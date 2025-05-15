use {
    serde::{Deserialize, Serialize},
    std::fmt::Debug,
};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AppState<T: Debug + Clone> {
    /// App is initializing: reading config and recovering the persisted state
    Init,
    /// App is checking for updates: checking for new blocks and transactions (start from the last persisted block)
    CheckForUpdates { artifact: T },
    /// App is running: indexing changes
    Processing { artifact: T },
    /// App is waiting: waiting for new blocks and transactions until timestamp
    Waiting { artifact: T, until: u64 },
    /// App is stopped: no more indexing, with exit message
    Stopped { message: String },
}

impl<T: Debug + Clone> AppState<T> {
    pub fn transition(&mut self, new_state: Self) -> bool {
        match (&self, &new_state) {
            // Already stopped, don't proceed
            (_, AppState::Stopped { message }) => {
                tracing::info!(message, "App stopped");

                false
            }

            // If the new state is waiting, and the current state is also waiting, just move on
            (AppState::Waiting { .. }, AppState::Waiting { .. }) => true,

            // If the new state is processing, and the current state is also processing, just move on
            (AppState::Processing { .. }, AppState::Processing { .. }) => {
                *self = new_state;
                true
            }

            // Otherwise, change the state
            (_, _) => {
                tracing::debug!(
                    from = ?&self,
                    to = ?&new_state,
                    "State change",
                );

                *self = new_state;
                true
            }
        }
    }
}
