use {anyhow::Result, async_trait::async_trait};

use super::{now, AppState, Indexer, IndexingCursor, IndexingJob};
use crate::app::interface::AppExecutor;

#[async_trait]
impl AppExecutor for Indexer {
    type Artifact = IndexingCursor;

    #[tracing::instrument(name = "init", skip(self))]
    async fn handle_init(&mut self) -> Result<AppState<IndexingCursor>> {
        let cursor = self.database.fetch_persistence().await?;

        Ok(AppState::CheckForUpdates { artifact: cursor })
    }

    #[tracing::instrument(name = "check_for_updates", skip(self))]
    async fn handle_check_for_updates(
        &mut self,
        cursor: IndexingCursor,
    ) -> Result<AppState<IndexingCursor>> {
        let artifacts = self.rpc.fetch_jobs(&cursor).await?;
        let state = self
            .get_updated_state(&artifacts.jobs, cursor, artifacts.cursor.clone())
            .await?;

        self.jobs.extend(artifacts.jobs);

        Ok(state)
    }

    #[tracing::instrument(name = "process", skip(self))]
    async fn handle_process(&mut self, cursor: IndexingCursor) -> Result<AppState<IndexingCursor>> {
        if let Some(job) = self.jobs.pop_front() {
            if let Some(payload) = self.rpc.process_job(&job).await? {
                self.database.process_payload(payload).await?;
            }

            let new_cursor = IndexingCursor::from(job.clone());

            self.database.insert_persistence(&new_cursor).await?;

            return Ok(AppState::Processing { artifact: cursor });
        };

        self.database.insert_persistence(&cursor).await?;

        tracing::trace!("No more jobs in the queue");

        Ok(AppState::CheckForUpdates { artifact: cursor })
    }

    async fn shutdown(&mut self) -> Result<()> {
        Ok(())
    }
}

impl Indexer {
    async fn get_updated_state(
        &self,
        jobs: &[IndexingJob],
        old_cursor: IndexingCursor,
        new_cursor: IndexingCursor,
    ) -> Result<AppState<IndexingCursor>> {
        if !jobs.is_empty() {
            tracing::info!(%new_cursor, "Earliest cursor found");

            Ok(AppState::Processing {
                artifact: new_cursor,
            })
        } else if old_cursor == IndexingCursor::None {
            self.database.insert_persistence(&new_cursor).await?;

            Ok(AppState::Stopped {
                message: "No valid transactions found on the contract address".to_string(),
            })
        } else {
            let timestamp = now()? + self.wait_interval_ms.as_secs();
            tracing::info!(timestamp, %new_cursor, "New jobs not found, waiting until next check");

            self.database.insert_persistence(&new_cursor).await?;

            Ok(AppState::Waiting {
                until: timestamp,
                artifact: new_cursor,
            })
        }
    }
}
