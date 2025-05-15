use anchor_lang::prelude::*;

#[error_code]
pub enum ProgramError {
    #[msg("Authority mismatched")]
    AuthorityMismatch,
    #[msg("Account has illegal owner")]
    IllegalOwner,
    #[msg("Invalid program data account")]
    InvalidProgramData,
    #[msg("Invalid program account")]
    InvalidProgramAccount,
    #[msg("Invalid UUID version")]
    InvalidUUID,
    #[msg("Invalid sale end date")]
    InvalidEndDate,
    #[msg("Invalid target deposit")]
    InvalidTargetDeposit,
    #[msg("Invalid sale unlock range")]
    InvalidUnlockRange,
    #[msg("Invalid sale price")]
    InvalidPrice,
    #[msg("Sale already started")]
    SaleAlreadyStarted,
    #[msg("Sale is inactive")]
    InactiveSale,
    #[msg("Sale is still active - recharge is available only on closed sales")]
    ActiveSale,
    #[msg("Sale is still locked")]
    LockedSale,
    #[msg("Invalid amount sale for sale participation")]
    InvalidParticipationAmount,
    #[msg("Invalid claim hour - must be less than sale unlock range")]
    InvalidClaimHour,
    #[msg("Early claim - participant is trying to claim before the claim hour")]
    EarlyClaim,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Value overflow - not possible")]
    ValueOverflow,
    #[msg("Sale is not filled enough")]
    SaleIsNotFilledEnough,
    #[msg("SaleAlreadyFiled")]
    FilledSale,
    #[msg("Distribution amount exceeded")]
    DistributionAmountExceeded,
    #[msg("Sale is not completed")]
    SaleIsNotCompleted,
    #[msg("Sale is already completed")]
    SaleIsCompleted,
    #[msg("Invalid sale multiplier")]
    InvalidMultiplier,
    #[msg("Invalid pda seeds")]
    InvalidSeeds,
    #[msg("Participant has already claimed tokens or recharged SOL")]
    ParticipantAlreadyClaimed,
}
