use uuid::Uuid;

use {
    anyhow::{anyhow, Result},
    sqlx::{
        postgres::{PgPool, PgPoolOptions},
        query, Row,
    },
    std::env,
    std::fs,
    tracing::{info, trace},
};

use super::PushPayload;
use crate::{
    app::now,
    configuration::DatabaseConfig,
    database::payload::SaleStatus,
    indexer::cursor::IndexingCursor,
    rpc::{EventData, Sale},
};

pub struct DatabaseManager {
    pool: PgPool,
}

impl DatabaseManager {
    pub async fn new(config: &DatabaseConfig) -> Result<Self> {
        let connection_str = config.get_connection_string();
        let pool = PgPoolOptions::new().connect(&connection_str).await?;

        let db = DatabaseManager { pool };

        if config.run_migrations {
            db.run_migrations().await?;
        }

        info!("Database connection established");

        Ok(db)
    }

    pub async fn process_payload(&self, payloads: Vec<PushPayload>) -> Result<()> {
        for payload in payloads {
            match payload.data {
                EventData::Sale(sale) => {
                    self.insert_sale(sale, &payload.hash).await?;
                }
            }
        }

        Ok(())
    }

    async fn insert_sale(&self, sale: Sale, hash: &str) -> Result<()> {
        info!("Inserting sale: {:?}", sale);

        query(
            "INSERT INTO sales (sale_id, status, end_date, hash)
            VALUES ($1, $2, $3, $4)",
        )
        .bind(sale.sale_id)
        .bind(SaleStatus::Waiting)
        .bind(sale.end_date)
        .bind(hash)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn update_sale_status(&self, id: &Uuid, status: SaleStatus) -> Result<()> {
        info!("Updating sale status: {:?}", status);

        query(
            "
            UPDATE sales
            SET status = $1
            WHERE sale_id = $2;",
        )
        .bind(status)
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn fetch_sales(&self) -> Result<Vec<Uuid>> {
        trace!("Fetching sales");

        let now = now()? as i64;

        // TODO: do i need to process failed sales?
        let res = query(
            "SELECT * FROM sales
            WHERE status = 'Waiting'
            AND end_date <= $1",
        )
        .bind(now)
        .fetch_all(&self.pool)
        .await?;

        let sales = res.iter().map(|row| row.get("sale_id")).collect::<Vec<_>>();

        if sales.is_empty() {
            trace!("No sales found");
        } else {
            info!(count = sales.len(), "Found sales");
        }

        Ok(sales)
    }

    pub async fn insert_persistence(&self, cursor: &IndexingCursor) -> Result<()> {
        match cursor {
            IndexingCursor::Transaction(cursor) => {
                info!("Inserting cursor: {:?}", cursor);

                query(
                    "INSERT INTO persistence (id, indexing_cursor) VALUES (0, $1)
                ON CONFLICT (id) DO UPDATE
                SET indexing_cursor = EXCLUDED.indexing_cursor",
                )
                .bind(cursor)
                .execute(&self.pool)
                .await?;
            }
            IndexingCursor::None => {
                info!("Inserting cursor: None");

                query(
                    "INSERT INTO persistence (id, indexing_cursor) VALUES (0, NULL)
                ON CONFLICT (id) DO UPDATE
                SET indexing_cursor = EXCLUDED.indexing_cursor",
                )
                .execute(&self.pool)
                .await?;
            }
        };

        Ok(())
    }

    pub async fn fetch_persistence(&self) -> Result<IndexingCursor> {
        info!("Fetching persistence");

        let res = query("SELECT * FROM persistence WHERE id = 0")
            .fetch_one(&self.pool)
            .await;

        match res {
            Ok(row) => {
                let cursor = row.get::<Option<String>, _>("indexing_cursor");
                info!(cursor = ?cursor, "Found cursor");

                let cursor = match cursor {
                    Some(cursor) => IndexingCursor::Transaction(cursor),
                    None => IndexingCursor::None,
                };

                Ok(cursor)
            }
            Err(err) => match err {
                sqlx::Error::RowNotFound => {
                    info!("No cursor found");

                    Ok(IndexingCursor::None)
                }
                _ => Err(anyhow!("Failed to fetch persistence: {}", err)),
            },
        }
    }

    async fn run_migrations(&self) -> Result<()> {
        info!("Applying migrations");
        let migrations_path =
            env::var("MIGRATIONS_PATH").unwrap_or_else(|_| "migrations".to_string());

        let status = migrations_path.clone() + "/status.sql";
        let persistence = migrations_path.clone() + "/persistence.sql";
        let sales = migrations_path.clone() + "/sales.sql";

        let migration_files = vec![status, persistence, sales];

        for file_path in migration_files {
            trace!("Applying migration: {}", file_path);

            let sql = fs::read_to_string(file_path)
                .map_err(|e| anyhow!("Failed to read migration file: {}", e))?;
            query(&sql).execute(&self.pool).await?;
        }
        Ok(())
    }
}
