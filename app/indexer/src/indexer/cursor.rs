use {
    serde::{Deserialize, Serialize},
    std::fmt::{Debug, Display},
};

pub type IndexingJob = String;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IndexingCursor {
    None,
    Transaction(String),
}

impl From<IndexingJob> for IndexingCursor {
    fn from(value: IndexingJob) -> Self {
        IndexingCursor::Transaction(value)
    }
}

impl Display for IndexingCursor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IndexingCursor::None => write!(f, "None"),
            IndexingCursor::Transaction(tx) => write!(f, "Transaction({})", tx),
        }
    }
}
