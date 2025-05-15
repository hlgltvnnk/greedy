use anchor_lang::prelude::*;

use crate::{errors::ProgramError, id, program::GreedySolana, state::contract_state::State};

// --------------------------- Context ----------------------------- //

#[derive(Accounts)]
pub struct InitializeContractState<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        owner = id(),
        seeds = [b"state".as_ref()],
        bump,
        space = State::LEN
    )]
    pub state: Account<'info, State>,

    #[account(
        constraint = program_account.key() == id() @ ProgramError::InvalidProgramAccount,
        constraint = program_account.programdata_address()? == Some(program_data.key()) @ ProgramError::InvalidProgramData,
    )]
    pub program_account: Program<'info, GreedySolana>,

    #[account(
        constraint = program_data.upgrade_authority_address == Some(authority.key()) @ ProgramError::AuthorityMismatch,
    )]
    pub program_data: Account<'info, ProgramData>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateContractState<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"state".as_ref()],
        constraint = state.authority == authority.key() @ ProgramError::AuthorityMismatch,
        bump,
    )]
    pub state: Account<'info, State>,
}

// ------------------------ Implementation ------------------------- //

impl InitializeContractState<'_> {
    pub fn initialize_contract_state(
        &mut self,
        authority: Pubkey,
        multiplier: u64,
        fee: u64,
    ) -> Result<()> {
        let state = &mut self.state;

        state.authority = authority;
        state.multiplier = multiplier;
        state.fee = fee;
        state.version = State::VERSION;

        msg!("Contract state initialized");

        Ok(())
    }
}

impl UpdateContractState<'_> {
    pub fn set_authority(&mut self, authority: Pubkey) -> Result<()> {
        let state = &mut self.state;

        state.authority = authority;

        msg!("Contract state updated: authority set to {authority}",);

        Ok(())
    }

    pub fn set_multiplier(&mut self, multiplier: u64) -> Result<()> {
        let state = &mut self.state;

        state.multiplier = multiplier;

        msg!("Contract state multiplier updated",);

        Ok(())
    }

    pub fn set_fee(&mut self, fee: u64) -> Result<()> {
        let state = &mut self.state;

        state.fee = fee;

        msg!("Contract state fee updated",);

        Ok(())
    }
}
