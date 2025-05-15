use {
    anchor_lang::{prelude::*, solana_program::native_token::lamports_to_sol},
    anchor_spl::{
        associated_token::AssociatedToken,
        token::Token,
        token_interface::{Mint, TokenAccount},
    },
};

use super::{
    constants::{COMPLETION_AMOUNT, MAX_AMOUNT, MIN_AMOUNT, SECONDS_PER_HOUR},
    utils::{transfer_sol, transfer_tokens, withdraw_sol},
};
use crate::{
    context::SCALE,
    errors::ProgramError,
    id,
    state::{
        contract_state::State,
        participant::Participant,
        sale::{Sale, SaleStats},
    },
};

// --------------------------- Context ----------------------------- //

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct ParticipateInSale<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        bump,
    )]
    pub sale: Account<'info, Sale>,

    #[account(
        mut,
        seeds = [b"sale_stats".as_ref(), &sale_id.to_le_bytes()],
        bump,
    )]
    pub sale_stats: Account<'info, SaleStats>,

    #[account(
        seeds = [b"state".as_ref()],
        bump,
    )]
    pub state: Account<'info, State>,

    #[account(
        init,
        payer = sender,
        owner = id(),
        seeds = [b"participant".as_ref(), &sale_id.to_le_bytes(), sender.key().as_ref()],
        bump,
        space = Participant::LEN
    )]
    pub participant: Account<'info, Participant>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct ClaimSaleReward<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        bump,
    )]
    pub sale: Account<'info, Sale>,

    #[account(
        mut,
        seeds = [b"participant".as_ref(), &sale_id.to_le_bytes(), sender.key().as_ref()],
        constraint = participant.payer == sender.key() @ ProgramError::AuthorityMismatch,
        bump,
    )]
    pub participant: Account<'info, Participant>,

    #[account(
        seeds = [b"sale_mint".as_ref(), &sale_id.to_le_bytes()],
        bump,
        constraint = mint.key() == sale.mint @ ProgramError::InvalidMint,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = sender,
        associated_token::mint = mint,
        associated_token::authority = sender,
        associated_token::token_program = token_program,
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = sale,
    )]
    pub sale_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct Recharge<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        constraint = sale.end_date < Clock::get()?.unix_timestamp @ ProgramError::ActiveSale,
        bump,
    )]
    pub sale: Account<'info, Sale>,

    #[account(
        mut,
        seeds = [b"participant".as_ref(), &sale_id.to_le_bytes(), sender.key().as_ref()],
        constraint = participant.payer == sender.key() @ ProgramError::AuthorityMismatch,
        bump,
    )]
    pub participant: Account<'info, Participant>,

    pub system_program: Program<'info, System>,
}

// ------------------------ Implementation ------------------------- //

impl ParticipateInSale<'_> {
    pub fn participate_in_sale(
        &mut self,
        sale_id: u128,
        amount: u64,
        claim_hour: u16,
    ) -> Result<()> {
        let sale = &mut self.sale;
        let stats = &mut self.sale_stats;

        let now = Clock::get()?.unix_timestamp;

        require!(
            (sale.start_date..=sale.end_date).contains(&now),
            ProgramError::InactiveSale
        );

        require!(
            !sale.is_locked || self.sender.key() == sale.authority,
            ProgramError::LockedSale
        );

        require!(
            (MIN_AMOUNT..=MAX_AMOUNT).contains(&amount),
            ProgramError::InvalidParticipationAmount
        );

        require!(
            (sale.unlock_range[0]..=sale.unlock_range[1]).contains(&claim_hour),
            ProgramError::InvalidClaimHour
        );

        let lower_bound = sale.unlock_range[0];
        let upper_bound = sale.unlock_range[1];

        let denominator = claim_hour as u64 * SCALE / (1 + upper_bound - lower_bound) as u64;
        let user_greed_level_scaled = amount * (self.state.multiplier + denominator);
        let user_greed_level = user_greed_level_scaled / SCALE;

        let participant = &mut self.participant;

        participant.sale_id = sale_id;
        participant.payer = self.sender.key();
        participant.claim_hour = claim_hour;
        participant.deposited_amount = amount;
        participant.greed_level = user_greed_level;
        participant.version = Participant::VERSION;

        transfer_sol(
            self.sender.to_account_info(),
            sale.to_account_info(),
            amount,
            self.system_program.to_account_info(),
        )?;

        if sale.is_locked {
            sale.is_locked = false;
        }

        self.sale.total_greed = sale
            .total_greed
            .checked_add(user_greed_level)
            .ok_or(ProgramError::ValueOverflow)?;

        self.sale.deposited_amount = self
            .sale
            .deposited_amount
            .checked_add(amount)
            .ok_or(ProgramError::ValueOverflow)?;

        let position = (claim_hour - 1) as usize;
        stats.stats[position] = stats.stats[position]
            .checked_add(amount)
            .ok_or(ProgramError::ValueOverflow)?;

        stats.participation_count += 1;

        msg!(
            "New participation: user {} deposited {} SOL to {} sale",
            participant.payer,
            lamports_to_sol(amount),
            uuid::Uuid::from_u128(participant.sale_id)
        );

        Ok(())
    }
}

impl ClaimSaleReward<'_> {
    pub fn claim_sale_reward(&mut self, sale_id: u128, sale_bump: u8) -> Result<()> {
        let claim_date =
            self.sale.end_date + (self.participant.claim_hour as i64) * SECONDS_PER_HOUR;

        require!(
            self.sale.deposited_amount >= self.sale.target_deposit,
            ProgramError::SaleIsNotFilledEnough
        );

        require!(
            claim_date <= Clock::get()?.unix_timestamp,
            ProgramError::EarlyClaim
        );

        require!(
            !self.participant.is_claimed,
            ProgramError::ParticipantAlreadyClaimed
        );

        self.participant.is_claimed = true;

        let greed_price = COMPLETION_AMOUNT / self.sale.total_greed;
        let amount_to_claim = self.participant.greed_level * greed_price;

        transfer_tokens(
            self.mint.to_account_info(),
            self.sale.to_account_info(),
            self.sale_token_account.to_account_info(),
            self.recipient_token_account.to_account_info(),
            self.token_program.to_account_info(),
            sale_id,
            amount_to_claim,
            sale_bump,
        )?;

        // LAMPORTS_PER_SOL - because DEFAULT_MINT_DECIMALS = SOL DECIMALS
        msg!(
            "User {} claimed {} tokens from {} sale",
            self.participant.payer,
            lamports_to_sol(amount_to_claim),
            uuid::Uuid::from_u128(sale_id)
        );

        Ok(())
    }
}

impl Recharge<'_> {
    pub fn racharge(&mut self, sale_id: u128) -> Result<()> {
        require!(
            !self.participant.is_claimed,
            ProgramError::ParticipantAlreadyClaimed
        );

        require!(
            self.sale.deposited_amount < self.sale.target_deposit,
            ProgramError::FilledSale
        );

        self.participant.is_claimed = true;

        withdraw_sol(
            &self.sale.to_account_info(),
            &self.sender.to_account_info(),
            self.participant.deposited_amount,
        )?;

        msg!(
            "New recharge: user {} recharged {} SOL from {} sale",
            self.participant.payer,
            lamports_to_sol(self.participant.deposited_amount),
            uuid::Uuid::from_u128(sale_id)
        );

        Ok(())
    }
}
