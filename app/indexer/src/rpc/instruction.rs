use crate::rpc::EventName;
use sha2::{Digest, Sha256};

pub const DISCRIMINATOR_SIZE: usize = 8;

/// Struct representing an Instruction entity from a Solana transaction
pub struct DecodedInstruction {
    /// Greedy instruction
    pub name: EventName,

    /// List of encoded accounts used by the instruction
    pub account_keys: Vec<String>,
}

/// Hashes instruction names to bytearray
pub fn get_sighashes() -> Vec<[u8; DISCRIMINATOR_SIZE]> {
    let names = ["create_sale"];

    names
        .iter()
        .map(|n| get_instruction_sighash(n))
        .collect::<Vec<_>>()
}

pub fn get_instruction_sighash(name: &str) -> [u8; DISCRIMINATOR_SIZE] {
    let mut hasher = Sha256::new();
    hasher.update(format!("global:{name}").as_bytes());

    let mut sighash = [0u8; DISCRIMINATOR_SIZE];
    sighash.copy_from_slice(&hasher.finalize()[..DISCRIMINATOR_SIZE]);
    sighash
}
