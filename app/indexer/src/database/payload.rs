use {
    serde::{Deserialize, Serialize},
    sqlx::FromRow,
};

use crate::rpc::EventData;

#[derive(sqlx::Type, Serialize, Deserialize, PartialEq, Clone, Debug)]
#[sqlx(type_name = "status")]
pub enum SaleStatus {
    Waiting,
    Failed,
    Completed,
    Closed,
}

#[derive(FromRow, Serialize, Deserialize, Debug, PartialEq)]
pub struct PushPayload {
    pub data: EventData,
    pub hash: String,
}
