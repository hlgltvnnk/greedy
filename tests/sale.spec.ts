import {
  web3,
  AnchorProvider,
  setProvider,
  Program,
  workspace,
} from "@coral-xyz/anchor";
import { v4 as uuidv4, v1 as uuidv1 } from "uuid";

import {
  AMM_PROGRAM,
  DEFAULT_COMPLETION_PERCENTAGE,
  DEFAULT_DECIMALS,
  DEFAULT_FEE,
  DEFAULT_MULTIPLIER,
  DEFAULT_SUPPLY,
  ONE_SOL,
  airdrop,
  bufferFromString,
  sleep,
  uuidToBn,
  waitUntil,
} from "./util/setup";

import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";

import { GreedySolana } from "../target/types/greedy_solana";
import {
  ACCOUNT_SIZE,
  findMetadataAddress,
  findSaleAddress,
  findSaleStatsAddress,
  findSaleMintAddress,
  findProgramDataAddress,
} from "./util/entity";
import { BN } from "bn.js";
import {
  createSyncNativeInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as Token from "@solana/spl-token";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { expectThrowError } from "./util/console";
import { programError } from "./util/error";
import { PumpAmmSdk } from "@pump-fun/pump-swap-sdk";
import { WRAPPED_SOL_MINT } from "@metaplex-foundation/js";

describe("Sale flow", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.GreedySolana as Program<GreedySolana>;
  const pumpAmmSdk = new PumpAmmSdk(provider.connection, AMM_PROGRAM);

  const now = new BN(Math.round(new Date().getTime()) / 1000);

  let saleId = uuidToBn(uuidv4());

  const metadata = {
    name: "Test Token",
    symbol: "TT",
    uri: "https://example.com/token",
  };

  let args = {
    metadata,
    unlockWithAdmin: false,
    name: Array.from(bufferFromString("Test name", 32)),
    description: Array.from(bufferFromString("Test Token description", 256)),
    startDate: now,
    endDate: now.addn(1000),
    unlockRange: [1, 100],
    targetDeposit: ONE_SOL.muln(10),
  };

  const authority = web3.Keypair.generate();
  const another_authority = web3.Keypair.generate();

  beforeAll(async () => {
    await airdrop(provider.connection, authority.publicKey);
    await airdrop(provider.connection, another_authority.publicKey);

    const [programData] = findProgramDataAddress();

    try {
      await program.methods
        .initializeContractState(
          authority.publicKey,
          DEFAULT_MULTIPLIER,
          DEFAULT_FEE
        )
        .accounts({
          authority: provider.publicKey,
          programData,
        })
        .rpc();
    } catch (error) {
      if (!error.message.includes("custom program error: 0x0")) {
        throw error;
      }
    }
  });

  describe("create_sale", () => {
    it("fail - invalid sale id", async () => {
      const id = new BN(bufferFromString("invalid-id", 16));

      await expectThrowError(
        () =>
          program.methods
            .createSale(id, args)
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidUUID")
      );
    });

    it("fail - invalid sale id version", async () => {
      const id = uuidToBn(uuidv1());

      await expectThrowError(
        () =>
          program.methods
            .createSale(id, args)
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidUUID")
      );
    });

    it("fail - invalid end date", async () => {
      const wrongArgs = {
        ...args,
        endDate: args.startDate,
      };

      await expectThrowError(
        () =>
          program.methods
            .createSale(saleId, wrongArgs)
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidEndDate")
      );
    });

    it("fail - invalid unlock range", async () => {
      const wrongArgs = {
        ...args,
        unlockRange: [1, 123],
      };

      await expectThrowError(
        () =>
          program.methods
            .createSale(saleId, wrongArgs)
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidUnlockRange")
      );
    });

    it("fail - invalid target deposit", async () => {
      const wrongArgs = {
        ...args,
        targetDeposit: new BN(0),
      };

      await expectThrowError(
        () =>
          program.methods
            .createSale(saleId, wrongArgs)
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidTargetDeposit")
      );
    });

    it("success", async () => {
      const [sale] = findSaleAddress(saleId);
      const [saleStats] = findSaleStatsAddress(saleId);
      const [mint] = findSaleMintAddress(saleId);

      await program.methods
        .createSale(saleId, args)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.id.eq(saleId)).toBeTruthy();
      expect(fetchedSaleAccount.name).toEqual(args.name);
      expect(fetchedSaleAccount.description).toEqual(args.description);
      expect(fetchedSaleAccount.authority).toEqual(authority.publicKey);
      expect(fetchedSaleAccount.mint).toEqual(mint);
      expect(fetchedSaleAccount.startDate).toEqual(args.startDate);
      expect(fetchedSaleAccount.endDate).toEqual(args.endDate);
      expect(fetchedSaleAccount.unlockRange).toEqual(args.unlockRange);
      expect(fetchedSaleAccount.isLocked).toEqual(false);
      expect(
        fetchedSaleAccount.targetDeposit.eq(args.targetDeposit)
      ).toBeTruthy();
      expect(fetchedSaleAccount.totalGreed.isZero()).toBeTruthy();

      const fetchedSaleStatsAccount = await program.account.saleStats.fetch(
        saleStats
      );

      expect(fetchedSaleStatsAccount.id.eq(saleId)).toBeTruthy();
      expect(
        fetchedSaleStatsAccount.stats.every((x) => x.eq(new BN(0)))
      ).toBeTruthy();

      const saleInfo = await provider.connection.getAccountInfoAndContext(sale);

      expect(saleInfo.value.owner).toEqual(program.programId);
      expect(saleInfo.value.data.length).toEqual(ACCOUNT_SIZE.sale);

      const saleStatsInfo = await provider.connection.getAccountInfoAndContext(
        saleStats
      );

      expect(saleStatsInfo.value.owner).toEqual(program.programId);
      expect(saleStatsInfo.value.data.length).toEqual(ACCOUNT_SIZE.saleStats);

      const mintData = await Token.getMint(
        provider.connection,
        mint,
        undefined,
        TOKEN_PROGRAM_ID
      );

      expect(mintData.isInitialized).toBeTruthy();
      expect(mintData.mintAuthority).toEqual(mint);
      expect(mintData.freezeAuthority).toBeNull();
      expect(mintData.supply.toString()).toEqual(DEFAULT_SUPPLY.toString());
      expect(mintData.decimals).toEqual(DEFAULT_DECIMALS);

      const [metadataAddress] = await findMetadataAddress(mint);

      const accountInfo = await provider.connection.getAccountInfo(
        metadataAddress
      );

      if (!accountInfo) throw new Error("Metadata account not found");

      const [tokenMetadata] = Metadata.deserialize(accountInfo.data);

      expect(tokenMetadata.updateAuthority).toEqual(mint);
      expect(tokenMetadata.mint).toEqual(mint);
      expect(tokenMetadata.isMutable).toBeTruthy();
      expect(
        Array.from(tokenMetadata.data.name.trimEnd().replace(/\x00+$/, ""))
      ).toEqual(Array.from(metadata.name));
      expect(
        Array.from(tokenMetadata.data.symbol.trimEnd().replace(/\x00+$/, ""))
      ).toEqual(Array.from(metadata.symbol));
      expect(
        Array.from(tokenMetadata.data.uri.trimEnd().replace(/\x00+$/, ""))
      ).toEqual(Array.from(metadata.uri));

      const tokenAccountData = await Token.getOrCreateAssociatedTokenAccount(
        provider.connection,
        authority,
        mint,
        sale,
        true
      );
      expect(tokenAccountData.amount.toString()).toEqual(
        DEFAULT_SUPPLY.toString()
      );
    });

    it("fail - sale already exists", async () => {
      await expectThrowError(
        () =>
          program.methods
            .createSale(saleId, args)
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        /custom program error: 0x0/
      );
    });
  });

  describe("update_sale", () => {
    beforeAll(async () => {
      saleId = uuidToBn(uuidv4());

      const now = new BN(Math.round(new Date().getTime()) / 1000);

      args.startDate = now.addn(4);
      args.endDate = now.addn(6);

      try {
        await program.methods
          .createSale(saleId, args)
          .accounts({
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
      } catch (error) {
        console.log("Error creating sale", error);
      }
    });

    it("fail - authority mismatch", async () => {
      await expectThrowError(
        () =>
          program.methods
            .updateSaleEndDate(saleId, now)
            .accounts({
              authority: another_authority.publicKey,
            })
            .signers([another_authority])
            .rpc(),
        programError("AuthorityMismatch")
      );
    });

    it("fail - invalid end date", async () => {
      await expectThrowError(
        () =>
          program.methods
            .updateSaleEndDate(saleId, now)
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidEndDate")
      );
    });

    it("success - update end date", async () => {
      const newEndDate = now.addn(5000);
      await program.methods
        .updateSaleEndDate(saleId, newEndDate)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [sale] = findSaleAddress(saleId);
      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.endDate).toEqual(newEndDate);
    });

    it("success - update name", async () => {
      const newName = Array.from(bufferFromString("Updated name", 32));
      await program.methods
        .updateSaleName(saleId, newName)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [sale] = findSaleAddress(saleId);
      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.name).toEqual(newName);
    });

    it("success - update description", async () => {
      const newDescription = Array.from(
        bufferFromString("Updated Token description", 256)
      );

      await program.methods
        .updateSaleDescription(saleId, newDescription)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [sale] = findSaleAddress(saleId);
      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.description).toEqual(newDescription);
    });

    it("fail - invalid unlock range", async () => {
      await expectThrowError(
        () =>
          program.methods
            .updateSaleUnlockRange(saleId, [1, 125])
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidUnlockRange")
      );
    });

    it("success - update unlock range", async () => {
      const newUnlockRange = [1, 55];

      await program.methods
        .updateSaleUnlockRange(saleId, newUnlockRange)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [sale] = findSaleAddress(saleId);
      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.unlockRange).toEqual(newUnlockRange);
    });

    it("success - update token metadata", async () => {
      metadata.name = "Updated Token";
      metadata.symbol = "UT";
      metadata.uri = "https://example.com/updated-token";

      await program.methods
        .updateMintMetadataDate(saleId, metadata)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [mint] = findSaleMintAddress(saleId);
      const [metadataAddress] = await findMetadataAddress(mint);

      const accountInfo = await provider.connection.getAccountInfo(
        metadataAddress
      );

      if (!accountInfo) throw new Error("Metadata account not found");

      const [tokenMetadata] = Metadata.deserialize(accountInfo.data);

      expect(tokenMetadata.updateAuthority).toEqual(mint);
      expect(tokenMetadata.mint).toEqual(mint);
      expect(tokenMetadata.isMutable).toBeTruthy();
      expect(
        Array.from(tokenMetadata.data.name.trimEnd().replace(/\x00+$/, ""))
      ).toEqual(Array.from(metadata.name));
      expect(
        Array.from(tokenMetadata.data.symbol.trimEnd().replace(/\x00+$/, ""))
      ).toEqual(Array.from(metadata.symbol));
      expect(
        Array.from(tokenMetadata.data.uri.trimEnd().replace(/\x00+$/, ""))
      ).toEqual(Array.from(metadata.uri));
    });

    it("fail - invalid target amount", async () => {
      await expectThrowError(
        () =>
          program.methods
            .updateSaleTargetDeposit(saleId, new BN(0))
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidTargetDeposit")
      );
    });

    it("success - update target amount", async () => {
      const newTarget = new BN(ONE_SOL.muln(1000));

      await program.methods
        .updateSaleTargetDeposit(saleId, newTarget)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [sale] = findSaleAddress(saleId);
      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.targetDeposit.eq(newTarget)).toBeTruthy();
    });

    it("success - update all", async () => {
      const newTarget = new BN(ONE_SOL.muln(1234));
      const newUnlockRange = [1, 100];
      const newDescription = Array.from(
        bufferFromString("Updated Token description", 256)
      );
      const newName = Array.from(bufferFromString("Updated name", 32));
      const newEndDate = now.addn(5001);

      await program.methods
        .updateSale(
          saleId,
          newTarget,
          newDescription,
          newName,
          newEndDate,
          newUnlockRange
        )
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [sale] = findSaleAddress(saleId);
      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.targetDeposit.eq(newTarget)).toBeTruthy();
      expect(fetchedSaleAccount.name).toEqual(newName);
      expect(fetchedSaleAccount.description).toEqual(newDescription);
      expect(fetchedSaleAccount.endDate).toEqual(newEndDate);
      expect(fetchedSaleAccount.unlockRange).toEqual(newUnlockRange);
    });

    it("fail - sale already started", async () => {
      await sleep(2000);

      await expectThrowError(
        () =>
          program.methods
            .updateSaleUnlockRange(saleId, [1, 100])
            .accounts({
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("SaleAlreadyStarted")
      );
    });
  });

  describe("complete_sale", () => {
    beforeAll(async () => {
      saleId = uuidToBn(uuidv4());

      const now = new BN(Math.round(new Date().getTime()) / 1000);

      args.startDate = now.subn(1);
      args.endDate = now.addn(2);

      try {
        await program.methods
          .createSale(saleId, args)
          .accounts({
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
      } catch (error) {
        console.log("Error creating sale", error);
      }
    });

    it("fail - sale is active", async () => {
      await expectThrowError(
        () =>
          program.methods
            .completeSale(saleId)
            .accounts({
              authority: provider.publicKey,
            })
            .rpc(),
        programError("ActiveSale")
      );
    });

    it("success", async () => {
      const [sale] = findSaleAddress(saleId);
      const [mint] = findSaleMintAddress(saleId);

      const fetchedSaleAccountBefore = await program.account.sale.fetch(sale);

      try {
        await program.methods
          .participateInSale(
            saleId,
            fetchedSaleAccountBefore.targetDeposit,
            100
          )
          .accounts({
            sender: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        await waitUntil(fetchedSaleAccountBefore.endDate.toNumber() + 3);

        await program.methods
          .completeSale(saleId)
          .accounts({
            authority: provider.publicKey,
          })
          .rpc();
      } catch (error) {
        throw Error(error);
      }

      const fetchedSaleAccountAfter = await program.account.sale.fetch(sale);

      const saleTokenAccountData =
        await Token.getOrCreateAssociatedTokenAccount(
          provider.connection,
          authority,
          mint,
          provider.publicKey
        );

      const poolAmount = DEFAULT_SUPPLY.muln(
        100 - DEFAULT_COMPLETION_PERCENTAGE
      ).divn(100);

      expect(saleTokenAccountData.amount.toString()).toEqual(
        poolAmount.toString()
      );

      const tokenAccountAddr = await Token.getAssociatedTokenAddress(
        WRAPPED_SOL_MINT,
        provider.publicKey
      );

      let tx = new Transaction().add(
        // sync wrapped SOL balance
        createSyncNativeInstruction(tokenAccountAddr)
      );

      await provider.sendAndConfirm(tx, [], {
        commitment: "confirmed",
      });

      const wsolTokenAccountData =
        await Token.getOrCreateAssociatedTokenAccount(
          provider.connection,
          authority,
          WRAPPED_SOL_MINT,
          provider.publicKey
        );

      expect(wsolTokenAccountData.amount.toString()).toEqual(
        fetchedSaleAccountAfter.depositedAmount.toString()
      );
    });

    it("fail - sale is already completed", async () => {
      await expectThrowError(
        () =>
          program.methods
            .completeSale(saleId)
            .accounts({
              authority: provider.publicKey,
            })
            .rpc(),
        / Error Code: ArithmeticOverflow. /
      );
    });
  });

  describe("create_amm", () => {
    beforeAll(async () => {
      saleId = uuidToBn(uuidv4());

      const now = new BN(Math.round(new Date().getTime()) / 1000);

      args.startDate = now.subn(1);
      args.endDate = now.addn(2);

      try {
        await program.methods
          .createSale(saleId, args)
          .accounts({
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        await program.methods
          .participateInSale(saleId, args.targetDeposit, 100)
          .accounts({
            sender: authority.publicKey,
          })
          .signers([authority])
          .rpc();
      } catch (error) {
        console.log("Error creating sale", error);
      }
    });

    it("fail - sale still active", async () => {
      const [mint] = findSaleMintAddress(saleId);

      const [pool] = pumpAmmSdk.poolKey(
        0,
        provider.publicKey,
        mint,
        WRAPPED_SOL_MINT
      );

      const config = pumpAmmSdk.globalConfigKey();
      const [lpMint] = pumpAmmSdk.lpMintKey(pool);

      let [eventAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("__event_authority")],
        pumpAmmSdk.programId()
      );

      const authorityPoolTokenAccount = await Token.getAssociatedTokenAddress(
        lpMint,
        provider.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const additionalComputeBudgetInstruction =
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 700_000,
        });

      const additionalComputePrceInstruction =
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 700_000,
        });

      await expectThrowError(
        () =>
          program.methods
            .createAmm(saleId)
            .accounts({
              authority: provider.publicKey,
              pool,
              config,
              quoteMint: WRAPPED_SOL_MINT,
              lpMint,
              eventAuthority,
              authorityPoolTokenAccount,
            })
            .preInstructions([
              additionalComputeBudgetInstruction,
              additionalComputePrceInstruction,
            ])
            .rpc(),
        programError("ActiveSale")
      );
    });

    it("fail - sale is not completed", async () => {
      const [sale] = findSaleAddress(saleId);
      const [mint] = findSaleMintAddress(saleId);

      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      await waitUntil(fetchedSaleAccount.endDate.toNumber() + 3);

      const [pool] = pumpAmmSdk.poolKey(
        0,
        provider.publicKey,
        mint,
        WRAPPED_SOL_MINT
      );

      const config = pumpAmmSdk.globalConfigKey();
      const [lpMint] = pumpAmmSdk.lpMintKey(pool);

      let [eventAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("__event_authority")],
        pumpAmmSdk.programId()
      );

      const authorityPoolTokenAccount = await Token.getAssociatedTokenAddress(
        lpMint,
        provider.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const additionalComputeBudgetInstruction =
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 700_000,
        });

      const additionalComputePrceInstruction =
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 700_000,
        });

      await expectThrowError(
        () =>
          program.methods
            .createAmm(saleId)
            .accounts({
              authority: provider.publicKey,
              pool,
              config,
              quoteMint: WRAPPED_SOL_MINT,
              lpMint,
              eventAuthority,
              authorityPoolTokenAccount,
            })
            .preInstructions([
              additionalComputeBudgetInstruction,
              additionalComputePrceInstruction,
            ])
            .rpc(),
        /custom program error: 0x1/
      );
    });

    it("success", async () => {
      const [mint] = findSaleMintAddress(saleId);
      const [sale] = findSaleAddress(saleId);

      const wsolTokenAccountDataBefore =
        await Token.getOrCreateAssociatedTokenAccount(
          provider.connection,
          authority,
          WRAPPED_SOL_MINT,
          provider.publicKey
        );

      await program.methods
        .completeSale(saleId)
        .accounts({
          authority: provider.publicKey,
        })
        .rpc();

      const [pool] = pumpAmmSdk.poolKey(
        0,
        provider.publicKey,
        mint,
        WRAPPED_SOL_MINT
      );

      const config = pumpAmmSdk.globalConfigKey();
      const [lpMint] = pumpAmmSdk.lpMintKey(pool);

      let [eventAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("__event_authority")],
        pumpAmmSdk.programId()
      );

      const authorityPoolTokenAccount = await Token.getAssociatedTokenAddress(
        lpMint,
        provider.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const additionalComputeBudgetInstruction =
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 700_000,
        });

      const additionalComputePrceInstruction =
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 700_000,
        });

      try {
        await program.methods
          .createAmm(saleId)
          .accounts({
            authority: provider.publicKey,
            pool,
            config,
            quoteMint: WRAPPED_SOL_MINT,
            lpMint,
            eventAuthority,
            authorityPoolTokenAccount,
          })
          .preInstructions([
            additionalComputeBudgetInstruction,
            additionalComputePrceInstruction,
          ])
          .rpc();
      } catch (error) {
        throw Error(error);
      }

      const fetchedSaleAccountAfter = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccountAfter.completed).toBeTruthy();

      const fetchedPoolAccount = await pumpAmmSdk.fetchPool(pool);

      expect(fetchedPoolAccount.baseMint).toEqual(mint);
      expect(fetchedPoolAccount.quoteMint).toEqual(WRAPPED_SOL_MINT);
      expect(fetchedPoolAccount.lpMint).toEqual(lpMint);
      expect(fetchedPoolAccount.creator).toEqual(provider.publicKey);

      const fetchedSaleAccount = await program.account.sale.fetch(sale);
      const wsolTokenAccountDataAfter =
        await Token.getOrCreateAssociatedTokenAccount(
          provider.connection,
          authority,
          WRAPPED_SOL_MINT,
          provider.publicKey
        );

      const fee = fetchedSaleAccount.depositedAmount.mul(DEFAULT_FEE).divn(100);

      expect(wsolTokenAccountDataAfter.amount).toEqual(
        wsolTokenAccountDataBefore.amount + BigInt(fee.toNumber())
      );
    });
  });
});
