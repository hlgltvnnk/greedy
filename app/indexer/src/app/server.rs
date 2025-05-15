use {
    anyhow::{anyhow, Result},
    axum::{http::StatusCode, response::IntoResponse, routing::get, Router, Server},
    tokio::sync::oneshot,
    tracing::info,
};

use super::{interface::AppExecutor, App};

/// Handle health requests
pub(crate) async fn health_handler() -> impl IntoResponse {
    StatusCode::OK
}

impl<T: AppExecutor> App<T> {
    async fn create_router(&self) -> Result<Router> {
        let router = Router::new().route("/health", get(health_handler));

        Ok(router)
    }

    pub async fn run_server(&mut self) -> Result<()> {
        let (tx, rx) = oneshot::channel::<()>();
        self.shutdown_sender = Some(tx);

        let server = Server::bind(&self.socket)
            .serve(self.create_router().await?.into_make_service())
            .with_graceful_shutdown(async {
                rx.await.ok();
                info!("Signal received, starting graceful shutdown");
            });

        // Spawn on background
        tokio::spawn(async move { server.await.map_err(|e| anyhow!(e)) });

        Ok(())
    }
}
