use std::time::Duration;

use {
    anyhow::{bail, Result},
    tokio::time::sleep,
};

use super::{interface::AppExecutor, now, App, AppState};

impl<T: AppExecutor> App<T> {
    pub async fn run_executor(&mut self) -> Result<()> {
        loop {
            let new_state = self.next().await?;

            if !self.check_transition(new_state).await {
                break;
            }
        }

        Ok(())
    }

    async fn check_transition(&mut self, new_state: AppState<T::Artifact>) -> bool {
        self.state.lock().await.transition(new_state)
    }

    async fn get_state(&self) -> AppState<T::Artifact> {
        self.state.lock().await.clone()
    }

    async fn next(&mut self) -> Result<AppState<T::Artifact>> {
        match self.get_state().await {
            AppState::Init => self.executor.handle_init().await,
            AppState::CheckForUpdates { artifact } => {
                self.executor.handle_check_for_updates(artifact).await
            }
            AppState::Processing { artifact } => self.executor.handle_process(artifact).await,
            AppState::Waiting { until, artifact } => self.handle_waiting(until, artifact).await,
            AppState::Stopped { .. } => bail!("Stopped indexer should not be running"),
        }
    }

    #[tracing::instrument(name = "waiting", skip(self))]
    async fn handle_waiting(
        &mut self,
        until: u64,
        artifact: T::Artifact,
    ) -> Result<AppState<T::Artifact>> {
        let now = now()?;

        if now >= until {
            Ok(AppState::CheckForUpdates { artifact })
        } else {
            sleep(Duration::from_secs(until - now)).await;
            Ok(AppState::Waiting { until, artifact })
        }
    }
}
