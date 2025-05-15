use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        metadata::Metadata,
        token::{Token, TokenAccount},
        token_2022::Token2022,
        token_interface::{Mint, TokenAccount as TokenAccountInterface},
    },
    pumpswap_sdk::{
        cpi::{accounts::CreatePool as CreatePoolAccounts, create_pool},
        program::PumpAmm,
    },
};

use super::{
    constants::{
        DEFAULT_MINT_DECIMALS, DEFAULT_SUPPLY, MAX_UNLOCK_RANGE, MIN_UNLOCK_RANGE, UUID_VERSION,
    },
    utils::{create_metadata, mint_tokens, update_metadata},
};
use crate::{
    context::{
        utils::{transfer_tokens, withdraw_sol, wrap_sol},
        COMPLETION_AMOUNT, MIN_TARGET_AMOUNT, WRAPPED_SOL_MINT,
    },
    errors::ProgramError,
    id,
    state::{
        contract_state::State,
        sale::{Sale, SaleStats},
    },
};
// --------------------------- Context ----------------------------- //

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct CreateSale<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        owner = id(),
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        bump,
        space = Sale::LEN
    )]
    pub sale: Account<'info, Sale>,

    #[account(
        init,
        payer = authority,
        owner = id(),
        seeds = [b"sale_stats".as_ref(), &sale_id.to_le_bytes()],
        bump,
        space = SaleStats::LEN
    )]
    pub sale_stats: Box<Account<'info, SaleStats>>,

    #[account(
        init,
        payer = authority,
        seeds = [b"sale_mint".as_ref(), &sale_id.to_le_bytes()],
        bump,
        mint::decimals = DEFAULT_MINT_DECIMALS,
        mint::authority = mint.key(),
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    /// CHECK: Validate address by deriving pda
    #[account(
            mut,
            seeds = [b"metadata", token_metadata_program.key().as_ref(), mint.key().as_ref()],
            bump,
            seeds::program = token_metadata_program.key(),
        )]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = sale,
        associated_token::token_program = token_program,
    )]
    pub token_account: InterfaceAccount<'info, TokenAccountInterface>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub token_metadata_program: Program<'info, Metadata>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct UpdateSale<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        constraint = sale.authority == authority.key() @ ProgramError::AuthorityMismatch,
        constraint = sale.start_date > Clock::get()?.unix_timestamp @ ProgramError::SaleAlreadyStarted,
        bump,
    )]
    pub sale: Account<'info, Sale>,
}

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct UpdateMintMetadata<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        constraint = sale.authority == authority.key() @ ProgramError::AuthorityMismatch,
        constraint = sale.start_date > Clock::get()?.unix_timestamp @ ProgramError::SaleAlreadyStarted,
        bump,
    )]
    pub sale: Account<'info, Sale>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(
        seeds = [b"sale_mint".as_ref(), &sale.id.to_le_bytes()],
        bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token>,

    pub token_metadata_program: Program<'info, Metadata>,
}

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct CompleteSale<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"state".as_ref()],
        constraint = state.authority == authority.key() @ ProgramError::AuthorityMismatch,
        bump,
    )]
    pub state: Box<Account<'info, State>>,

    #[account(
        mut,
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        constraint = sale.end_date <= Clock::get()?.unix_timestamp @ ProgramError::ActiveSale,
        bump,
    )]
    pub sale: Account<'info, Sale>,

    #[account(
        seeds = [b"sale_mint".as_ref(), &sale.id.to_le_bytes()],
        bump,
    )]
    pub sale_mint: InterfaceAccount<'info, Mint>,

    #[account(
        address = WRAPPED_SOL_MINT
    )]
    pub wsol_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = sale_mint,
        associated_token::authority = sale,
        )]
    pub sale_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = sale_mint,
        associated_token::authority = authority,
        )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = wsol_mint,
        associated_token::authority = authority,
        )]
    pub authority_wsol_token_account: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(
    sale_id: u128,
)]
pub struct CreateAmm<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"state".as_ref()],
        constraint = state.authority == authority.key() @ ProgramError::AuthorityMismatch,
        bump,
    )]
    pub state: Box<Account<'info, State>>,

    #[account(
        mut,
        seeds = [b"sale".as_ref(), &sale_id.to_le_bytes()],
        constraint = sale.end_date <= Clock::get()?.unix_timestamp @ ProgramError::ActiveSale,
        bump,
    )]
    pub sale: Box<Account<'info, Sale>>,

    // Amm accounts:
    /// CHECK: Pool account (PDA)
    #[account(mut)]
    pub pool: UncheckedAccount<'info>,

    /// CHECK: Config account
    pub config: UncheckedAccount<'info>,

    #[account(
        seeds = [b"sale_mint".as_ref(), &sale.id.to_le_bytes()],
        bump,
    )]
    pub base_mint: InterfaceAccount<'info, Mint>,

    pub quote_mint: InterfaceAccount<'info, Mint>,

    /// CHECK: LP token mint of the pool
    #[account(mut)]
    pub lp_mint: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = base_mint,
        associated_token::authority = authority,
        )]
    pub authority_base_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = quote_mint,
        associated_token::authority = authority,
        )]
    pub authority_quote_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: Payer pool LP token account. Used to receive LP during first deposit (initialize pool)
    #[account(mut)]
    pub authority_pool_token_account: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = base_mint,
        associated_token::authority = pool,
        )]
    pub pool_base_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = quote_mint,
        associated_token::authority = pool,
        )]
    pub pool_quote_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: Pool event authority (PDA)
    pub event_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub token2022_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub amm_program: Program<'info, PumpAmm>,
}

// -------------------------- Arguments ---------------------------- //

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct MetadataArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateSaleArgs {
    metadata: MetadataArgs,
    unlock_with_admin: bool,
    target_deposit: u64,
    name: [u8; 32],
    description: [u8; 256],
    start_date: i64,
    end_date: i64,
    unlock_range: [u16; 2],
}

// ------------------------ Implementation ------------------------- //

impl CreateSale<'_> {
    pub fn create_sale(
        &mut self,
        sale_id: u128,
        args: CreateSaleArgs,
        mint_bump: u8,
    ) -> Result<()> {
        let id = uuid::Uuid::from_u128(sale_id);

        self.validate(id, &args)?;

        let sale = &mut self.sale;
        let sale_stats = &mut self.sale_stats;

        if args.unlock_with_admin {
            sale.is_locked = true;
        }

        sale.id = sale_id;
        sale.target_deposit = args.target_deposit;
        sale.description = args.description;
        sale.name = args.name;
        sale.authority = self.authority.key();
        sale.mint = self.mint.key();
        sale.start_date = args.start_date;
        sale.end_date = args.end_date;
        sale.unlock_range = args.unlock_range;
        sale.version = Sale::VERSION;

        sale_stats.id = sale_id;
        sale_stats.version = SaleStats::VERSION;

        mint_tokens(
            self.mint.to_account_info(),
            self.token_account.to_account_info(),
            self.token_program.to_account_info(),
            sale_id,
            mint_bump,
            DEFAULT_SUPPLY,
        )?;

        create_metadata(
            self.mint.to_account_info(),
            self.metadata_account.to_account_info(),
            self.token_metadata_program.to_account_info(),
            self.system_program.to_account_info(),
            self.rent.to_account_info(),
            self.authority.to_account_info(),
            sale_id,
            mint_bump,
            args.metadata,
        )?;

        msg!("Sale {} initialized", id);

        Ok(())
    }

    pub fn validate(&mut self, id: uuid::Uuid, args: &CreateSaleArgs) -> Result<()> {
        require!(
            id.get_version_num() == UUID_VERSION,
            ProgramError::InvalidUUID
        );

        require!(
            args.target_deposit >= MIN_TARGET_AMOUNT,
            ProgramError::InvalidTargetDeposit
        );

        require!(
            args.start_date < args.end_date,
            ProgramError::InvalidEndDate
        );

        let lower_bound = args.unlock_range[0];
        let upper_bound = args.unlock_range[1];

        require!(
            (lower_bound < upper_bound)
                && (MIN_UNLOCK_RANGE..=MAX_UNLOCK_RANGE).contains(&lower_bound)
                && (MIN_UNLOCK_RANGE..=MAX_UNLOCK_RANGE).contains(&upper_bound),
            ProgramError::InvalidUnlockRange
        );

        Ok(())
    }
}

impl UpdateSale<'_> {
    pub fn update_sale(
        &mut self,
        _sale_id: u128,
        target_deposit: u64,
        description: [u8; 256],
        name: [u8; 32],
        end_date: i64,
        unlock_range: [u16; 2],
    ) -> Result<()> {
        let sale = &mut self.sale;

        let lower_bound = unlock_range[0];
        let upper_bound = unlock_range[1];

        require!(sale.start_date < end_date, ProgramError::InvalidEndDate);
        require!(
            (lower_bound < upper_bound)
                && (MIN_UNLOCK_RANGE..=MAX_UNLOCK_RANGE).contains(&lower_bound)
                && (MIN_UNLOCK_RANGE..=MAX_UNLOCK_RANGE).contains(&upper_bound),
            ProgramError::InvalidUnlockRange
        );
        require!(
            target_deposit >= MIN_TARGET_AMOUNT,
            ProgramError::InvalidTargetDeposit
        );

        sale.target_deposit = target_deposit;
        sale.description = description;
        sale.name = name;
        sale.end_date = end_date;
        sale.unlock_range = unlock_range;

        msg!("Sale updated");

        Ok(())
    }

    pub fn update_sale_name(&mut self, _sale_id: u128, name: [u8; 32]) -> Result<()> {
        let sale = &mut self.sale;

        sale.name = name;

        msg!("Sale name updated");

        Ok(())
    }

    pub fn update_sale_description(
        &mut self,
        _sale_id: u128,
        description: [u8; 256],
    ) -> Result<()> {
        let sale = &mut self.sale;

        sale.description = description;

        msg!("Sale description updated");

        Ok(())
    }

    pub fn update_sale_end_date(&mut self, _sale_id: u128, end_date: i64) -> Result<()> {
        let sale = &mut self.sale;

        require!(sale.start_date < end_date, ProgramError::InvalidEndDate);

        sale.end_date = end_date;

        msg!("Sale end date updated");

        Ok(())
    }

    pub fn update_sale_unlock_range(
        &mut self,
        _sale_id: u128,
        unlock_range: [u16; 2],
    ) -> Result<()> {
        let sale = &mut self.sale;

        let lower_bound = unlock_range[0];
        let upper_bound = unlock_range[1];

        require!(
            (lower_bound < upper_bound)
                && (MIN_UNLOCK_RANGE..=MAX_UNLOCK_RANGE).contains(&lower_bound)
                && (MIN_UNLOCK_RANGE..=MAX_UNLOCK_RANGE).contains(&upper_bound),
            ProgramError::InvalidUnlockRange
        );

        sale.unlock_range = unlock_range;

        msg!("Sale unlock range updated");

        Ok(())
    }

    pub fn update_sale_target_deposit(
        &mut self,
        _sale_id: u128,
        target_deposit: u64,
    ) -> Result<()> {
        let sale = &mut self.sale;

        require!(
            target_deposit >= MIN_TARGET_AMOUNT,
            ProgramError::InvalidTargetDeposit
        );

        sale.target_deposit = target_deposit;

        msg!("Sale end date updated");

        Ok(())
    }
}

impl UpdateMintMetadata<'_> {
    pub fn update_metadata(&mut self, _sale_id: u128, args: MetadataArgs, bump: u8) -> Result<()> {
        update_metadata(
            self.mint.to_account_info(),
            self.metadata_account.to_account_info(),
            self.token_metadata_program.to_account_info(),
            self.sale.id,
            bump,
            args,
        )?;

        msg!("Sale metadata updated");

        Ok(())
    }
}

impl CompleteSale<'_> {
    pub fn complete_sale(&mut self, sale_id: u128, sale_bump: u8) -> Result<()> {
        require!(!self.sale.completed, ProgramError::SaleIsCompleted);
        require!(
            self.sale.deposited_amount >= self.sale.target_deposit,
            ProgramError::SaleIsNotFilledEnough
        );

        transfer_tokens(
            self.sale_mint.to_account_info(),
            self.sale.to_account_info(),
            self.sale_token_account.to_account_info(),
            self.authority_token_account.to_account_info(),
            self.token_program.to_account_info(),
            sale_id,
            DEFAULT_SUPPLY - COMPLETION_AMOUNT,
            sale_bump,
        )?;

        withdraw_sol(
            &self.sale.to_account_info(),
            &self.authority_wsol_token_account.to_account_info(),
            self.sale.deposited_amount,
        )?;

        msg!("Sale {} completed", uuid::Uuid::from_u128(sale_id));

        Ok(())
    }
}

impl CreateAmm<'_> {
    pub fn create_amm(&mut self, sale_id: u128) -> Result<()> {
        require!(!self.sale.completed, ProgramError::SaleIsCompleted);

        wrap_sol(
            self.authority_quote_token_account.to_account_info(),
            self.token_program.to_account_info(),
        )?;

        self.create_amm_pool()?;

        // close_ata(
        //     self.sale.to_account_info(),
        //     self.sale_quote_token_account.to_account_info(),
        //     self.authority.to_account_info(),
        //     self.token_program.to_account_info(),
        //     sale_id,
        //     sale_bump,
        // )?;

        self.sale.completed = true;

        msg!("Pool created for {}", uuid::Uuid::from_u128(sale_id));

        Ok(())
    }

    pub fn create_amm_pool(&self) -> Result<()> {
        let index = 0;
        let base_in = DEFAULT_SUPPLY - COMPLETION_AMOUNT;

        let platform_fee = self.sale.deposited_amount * self.state.fee / 100;
        let quote_in = self.sale.deposited_amount - platform_fee;

        msg!(
            "Creating pool with base_in: {}, quote_in: {} on {}",
            base_in,
            quote_in,
            self.amm_program.key()
        );

        let cpi_program = self.amm_program.to_account_info();
        let cpi_accounts = CreatePoolAccounts {
            pool: self.pool.to_account_info(),
            global_config: self.config.to_account_info(),
            creator: self.authority.to_account_info(),
            base_mint: self.base_mint.to_account_info(),
            quote_mint: self.quote_mint.to_account_info(),
            lp_mint: self.lp_mint.to_account_info(),
            user_base_token_account: self.authority_base_token_account.to_account_info(),
            user_quote_token_account: self.authority_quote_token_account.to_account_info(),
            user_pool_token_account: self.authority_pool_token_account.to_account_info(),
            pool_base_token_account: self.pool_base_token_account.to_account_info(),
            pool_quote_token_account: self.pool_quote_token_account.to_account_info(),
            system_program: self.system_program.to_account_info(),
            token_2022_program: self.token2022_program.to_account_info(),
            base_token_program: self.token_program.to_account_info(),
            quote_token_program: self.token_program.to_account_info(),
            associated_token_program: self.associated_token_program.to_account_info(),
            event_authority: self.event_authority.to_account_info(),
            program: self.amm_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        create_pool(cpi_ctx, index, base_in, quote_in, self.authority.key())?;

        Ok(())
    }
}
