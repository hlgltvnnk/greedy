use {
    anyhow::{bail, Result},
    serde::{Deserialize, Serialize},
    sqlx::{postgres::PgRow, FromRow},
    std::fmt,
    uuid::Uuid,
};

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Eq)]
pub enum EventName {
    CreateSale,
}

impl EventName {
    pub fn from_index(index: usize) -> Result<Self> {
        match index {
            0 => Ok(Self::CreateSale),
            _ => bail!("Unknown instruction"),
        }
    }
}

impl fmt::Display for EventName {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Self::CreateSale => write!(f, "create_sale"),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum EventData {
    Sale(Sale),
}

impl<'r> FromRow<'r, PgRow> for EventData {
    fn from_row(row: &'r PgRow) -> sqlx::Result<Self> {
        let sale = Sale::from_row(row)?;

        Ok(EventData::Sale(sale))
    }
}

#[derive(FromRow, Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct Sale {
    pub sale_id: Uuid,
    pub end_date: i64,
}

impl From<Sale> for EventData {
    fn from(value: Sale) -> Self {
        Self::Sale(value)
    }
}

impl TryFrom<greedy_solana::Sale> for Sale {
    type Error = anyhow::Error;

    fn try_from(value: greedy_solana::Sale) -> Result<Self> {
        Ok(Self {
            sale_id: Uuid::from_u128(value.id),
            end_date: value.end_date,
        })
    }
}
