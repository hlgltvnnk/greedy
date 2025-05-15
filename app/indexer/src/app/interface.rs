use super::AppState;
use {anyhow::Result, async_trait::async_trait, std::fmt::Debug};

#[async_trait]
pub trait AppExecutor {
    type Artifact: Debug + Clone;

    async fn handle_init(&mut self) -> Result<AppState<Self::Artifact>>;

    async fn handle_check_for_updates(
        &mut self,
        artifact: Self::Artifact,
    ) -> Result<AppState<Self::Artifact>>;

    async fn handle_process(
        &mut self,
        artifact: Self::Artifact,
    ) -> Result<AppState<Self::Artifact>>;

    async fn shutdown(&mut self) -> Result<()>;
}
