use {
    anchor_lang::{prelude::*, solana_program, system_program},
    anchor_spl::{
        metadata::{
            create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
            update_metadata_accounts_v2, CreateMetadataAccountsV3, UpdateMetadataAccountsV2,
        },
        token::{close_account, mint_to, spl_token, CloseAccount, MintTo},
        token_interface::{self, TransferChecked},
    },
};

use super::{MetadataArgs, DEFAULT_MINT_DECIMALS};

/// This method mints tokens to the user token account
pub fn mint_tokens<'info>(
    mint: AccountInfo<'info>,
    token_account: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    sale_id: u128,
    bump: u8,
    supply: u64,
) -> Result<()> {
    let binding = [bump];
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"sale_mint".as_ref(),
        &sale_id.to_le_bytes(),
        binding.as_ref(),
    ]];

    let cpi_accounts = MintTo {
        mint: mint.clone(),
        to: token_account,
        authority: mint,
    };

    let cpi_context = CpiContext::new(token_program, cpi_accounts).with_signer(signer_seeds);

    mint_to(cpi_context, supply)
}

#[allow(clippy::too_many_arguments)]
/// This method creates metadata for token
pub fn create_metadata<'info>(
    mint: AccountInfo<'info>,
    metadata_account: AccountInfo<'info>,
    token_metadata_program: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    rent: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    sale_id: u128,
    bump: u8,
    metadata: MetadataArgs,
) -> Result<()> {
    let binding = [bump];
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"sale_mint".as_ref(),
        &sale_id.to_le_bytes(),
        binding.as_ref(),
    ]];

    create_metadata_accounts_v3(
        CpiContext::new(
            token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: metadata_account.to_account_info(),
                mint: mint.to_account_info(),
                mint_authority: mint.to_account_info(), // PDA is mint authority
                update_authority: mint.to_account_info(), // PDA is update authority
                payer: payer.to_account_info(),
                system_program: system_program.to_account_info(),
                rent: rent.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        DataV2 {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        true,
        true,
        None,
    )?;

    Ok(())
}

/// This method updates metadata for token
pub fn update_metadata<'info>(
    mint: AccountInfo<'info>,
    metadata_account: AccountInfo<'info>,
    token_metadata_program: AccountInfo<'info>,
    sale_id: u128,
    bump: u8,
    metadata: MetadataArgs,
) -> Result<()> {
    let binding = [bump];
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"sale_mint".as_ref(),
        &sale_id.to_le_bytes(),
        binding.as_ref(),
    ]];

    update_metadata_accounts_v2(
        CpiContext::new(
            token_metadata_program.to_account_info(),
            UpdateMetadataAccountsV2 {
                metadata: metadata_account.to_account_info(),
                update_authority: mint.to_account_info(), // PDA is update authority
            },
        )
        .with_signer(signer_seeds),
        None,
        Some(DataV2 {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        }),
        None,
        None,
    )?;

    Ok(())
}

/// This method transfers sol from user to program
pub fn transfer_sol<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    amount: u64,
    system_program: AccountInfo<'info>,
) -> Result<()> {
    let cpi_ctx = CpiContext::new(system_program, system_program::Transfer { from, to });

    system_program::transfer(cpi_ctx, amount)
}

#[allow(clippy::too_many_arguments)]
/// This method transfers tokens from pda ata to user ata
pub fn transfer_tokens<'info>(
    mint: AccountInfo<'info>,
    sale: AccountInfo<'info>,
    from_ata: AccountInfo<'info>,
    to_ata: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    sale_id: u128,
    amount: u64,
    bump: u8,
) -> Result<()> {
    let binding = [bump];
    let signer_seeds: &[&[&[u8]]] =
        &[&[b"sale".as_ref(), &sale_id.to_le_bytes(), binding.as_ref()]];

    let cpi_accounts = TransferChecked {
        mint: mint.clone(),
        from: from_ata,
        to: to_ata,
        authority: sale,
    };
    let cpi_context = CpiContext::new(token_program, cpi_accounts).with_signer(signer_seeds);

    token_interface::transfer_checked(cpi_context, amount, DEFAULT_MINT_DECIMALS)
}

/// This method transfers sol from program to user account
pub fn withdraw_sol<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    from.sub_lamports(amount)?;
    to.add_lamports(amount)?;

    Ok(())
}

pub fn wrap_sol<'info>(
    wsol_account: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
) -> Result<()> {
    // Sync WSOL balance
    let ix = spl_token::instruction::sync_native(token_program.key, wsol_account.key)?;
    solana_program::program::invoke(&ix, &[wsol_account.clone(), token_program])?;

    Ok(())
}

pub fn _close_ata<'info>(
    sale: AccountInfo<'info>,
    account: AccountInfo<'info>,
    destination: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    sale_id: u128,
    bump: u8,
) -> Result<()> {
    let binding = [bump];
    let signer_seeds: &[&[&[u8]]] =
        &[&[b"sale".as_ref(), &sale_id.to_le_bytes(), binding.as_ref()]];

    let cpi_accounts = CloseAccount {
        account,
        destination,
        authority: sale,
    };
    let cpi_context = CpiContext::new_with_signer(token_program, cpi_accounts, signer_seeds);

    close_account(cpi_context)?;

    Ok(())
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct TokenMetadataArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
