import {
  web3,
  AnchorProvider,
  setProvider,
  Program,
  workspace,
} from "@coral-xyz/anchor";
import * as Token from "@solana/spl-token";
import { v4 as uuidv4 } from "uuid";

import {
  DEFAULT_COMPLETION_PERCENTAGE,
  DEFAULT_FEE,
  DEFAULT_MULTIPLIER,
  DEFAULT_SUPPLY,
  MIN_DEPOSIT,
  MIN_TARGET_DEPOSIT,
  ONE_SOL,
  airdrop,
  bufferFromString,
  uuidToBn,
  waitUntil,
} from "./util/setup";

import { GreedySolana } from "../target/types/greedy_solana";
import {
  ACCOUNT_SIZE,
  findParticipantAddress,
  findProgramDataAddress,
  findSaleAddress,
  findSaleStatsAddress,
} from "./util/entity";
import { BN } from "bn.js";

import { expectThrowError } from "./util/console";
import { programError } from "./util/error";

describe("Participant flow", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.GreedySolana as Program<GreedySolana>;

  const now = new BN(Math.round(new Date().getTime()) / 1000);

  let saleId = uuidToBn(uuidv4());
  const amount = ONE_SOL;
  const claimHour = 2;

  const metadata = {
    name: "Test Token",
    symbol: "TT",
    uri: "https://example.com/token",
  };

  let args = {
    metadata,
    unlockWithAdmin: true,
    name: Array.from(bufferFromString("Test name", 32)),
    description: Array.from(bufferFromString("Test Token description", 256)),
    startDate: now.addn(2),
    endDate: now.addn(5),
    unlockRange: [1, 100],
    targetDeposit: MIN_TARGET_DEPOSIT,
  };

  const authority = web3.Keypair.generate();
  const somebody = web3.Keypair.generate();
  const nobody = web3.Keypair.generate();

  beforeAll(async () => {
    await airdrop(provider.connection, authority.publicKey);
    await airdrop(provider.connection, somebody.publicKey);
    await airdrop(provider.connection, nobody.publicKey);

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

    await program.methods
      .createSale(saleId, args)
      .accounts({
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  });

  describe("participate_in_sale", () => {
    it("fail - inactive sale", async () => {
      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, amount, claimHour)
            .accounts({
              sender: somebody.publicKey,
            })
            .signers([somebody])
            .rpc(),
        programError("InactiveSale")
      );
    });

    it("fail - locked sale", async () => {
      const [sale] = findSaleAddress(saleId);
      const startDate = (
        await program.account.sale.fetch(sale)
      ).startDate.toNumber();

      await waitUntil(startDate + 2);

      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, amount, claimHour)
            .accounts({
              sender: somebody.publicKey,
            })
            .signers([somebody])
            .rpc(),
        programError("LockedSale")
      );
    });

    it("fail - low participation amount", async () => {
      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, new BN(1), claimHour)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidParticipationAmount")
      );
    });

    it("fail - high participation amount", async () => {
      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, ONE_SOL.muln(101), claimHour)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidParticipationAmount")
      );
    });

    it("fail - low claim hour", async () => {
      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, amount, args.unlockRange[0] - 1)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidClaimHour")
      );
    });

    it("fail - high claim hour", async () => {
      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, amount, args.unlockRange[1] + 1)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("InvalidClaimHour")
      );
    });

    it("success - admin participation", async () => {
      const [participant] = findParticipantAddress(saleId, authority.publicKey);

      const [sale] = findSaleAddress(saleId);
      const [saleStats] = findSaleStatsAddress(saleId);

      const saleBalanceBefore = (
        await provider.connection.getAccountInfoAndContext(sale)
      ).value.lamports;

      await program.methods
        .participateInSale(saleId, amount, claimHour)
        .accounts({
          sender: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const weight =
        claimHour / (1 + (args.unlockRange[1] - args.unlockRange[0]));
      let greedLevel = new BN(amount.toNumber() * (0.2 + weight));

      const fetchedParticipantAccount = await program.account.participant.fetch(
        participant
      );

      expect(fetchedParticipantAccount.saleId.eq(saleId)).toBeTruthy();
      expect(fetchedParticipantAccount.payer).toEqual(authority.publicKey);
      expect(fetchedParticipantAccount.claimHour).toEqual(claimHour);
      expect(fetchedParticipantAccount.isClaimed).toBeFalsy();
      expect(fetchedParticipantAccount.depositedAmount.eq(amount)).toBeTruthy();
      expect(fetchedParticipantAccount.greedLevel.eq(greedLevel)).toBeTruthy();

      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccount.isLocked).toBeFalsy();
      expect(fetchedSaleAccount.totalGreed.eq(greedLevel)).toBeTruthy();
      expect(fetchedSaleAccount.depositedAmount.eq(amount)).toBeTruthy();

      const fetchedSaleStatsAccount = await program.account.saleStats.fetch(
        saleStats
      );

      expect(
        fetchedSaleStatsAccount.stats[claimHour - 1].eq(amount)
      ).toBeTruthy();

      expect(fetchedSaleStatsAccount.participationCount.eqn(1)).toBeTruthy();

      const participantInfo =
        await provider.connection.getAccountInfoAndContext(participant);

      expect(participantInfo.value.owner).toEqual(program.programId);
      expect(participantInfo.value.data.length).toEqual(
        ACCOUNT_SIZE.participant
      );

      const saleBalanceAfter = (
        await provider.connection.getAccountInfoAndContext(sale)
      ).value.lamports;

      expect(saleBalanceAfter).toEqual(saleBalanceBefore + amount.toNumber());
    });

    it("success - user participation", async () => {
      const [participant] = findParticipantAddress(saleId, somebody.publicKey);

      const [sale] = findSaleAddress(saleId);
      const [saleStats] = findSaleStatsAddress(saleId);

      const saleBalanceBefore = (
        await provider.connection.getAccountInfoAndContext(sale)
      ).value.lamports;
      const fetchedSaleAccountBefore = await program.account.sale.fetch(sale);
      const fetchedSaleStatsAccountBefore =
        await program.account.saleStats.fetch(saleStats);

      await program.methods
        .participateInSale(saleId, amount, claimHour)
        .accounts({
          sender: somebody.publicKey,
        })
        .signers([somebody])
        .rpc();

      const weight =
        claimHour / (1 + (args.unlockRange[1] - args.unlockRange[0]));
      let greedLevel = new BN(amount.toNumber() * (0.2 + weight));

      const fetchedParticipantAccount = await program.account.participant.fetch(
        participant
      );

      expect(fetchedParticipantAccount.saleId.eq(saleId)).toBeTruthy();
      expect(fetchedParticipantAccount.payer).toEqual(somebody.publicKey);
      expect(fetchedParticipantAccount.claimHour).toEqual(claimHour);
      expect(fetchedParticipantAccount.depositedAmount.eq(amount)).toBeTruthy();
      expect(fetchedParticipantAccount.greedLevel.eq(greedLevel)).toBeTruthy();

      const fetchedSaleAccountAfter = await program.account.sale.fetch(sale);

      expect(fetchedSaleAccountAfter.isLocked).toBeFalsy();
      expect(
        fetchedSaleAccountAfter.totalGreed.eq(
          fetchedSaleAccountBefore.totalGreed.add(greedLevel)
        )
      ).toBeTruthy();

      expect(
        fetchedSaleAccountAfter.depositedAmount.eq(
          fetchedSaleAccountBefore.depositedAmount.add(amount)
        )
      ).toBeTruthy();

      const fetchedSaleStatsAccountAfter =
        await program.account.saleStats.fetch(saleStats);

      expect(
        fetchedSaleStatsAccountAfter.stats[claimHour - 1].eq(
          fetchedSaleStatsAccountBefore.stats[claimHour - 1].add(amount)
        )
      ).toBeTruthy();
      expect(
        fetchedSaleStatsAccountAfter.participationCount.eq(
          fetchedSaleStatsAccountBefore.participationCount.addn(1)
        )
      ).toBeTruthy();

      const participantInfo =
        await provider.connection.getAccountInfoAndContext(participant);

      expect(participantInfo.value.owner).toEqual(program.programId);
      expect(participantInfo.value.data.length).toEqual(
        ACCOUNT_SIZE.participant
      );

      const saleBalanceAfter = (
        await provider.connection.getAccountInfoAndContext(sale)
      ).value.lamports;

      expect(saleBalanceAfter).toEqual(saleBalanceBefore + amount.toNumber());
    });

    it("fail - user has been participating already", async () => {
      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, amount, args.unlockRange[0])
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        /custom program error: 0x0/
      );
    });

    it("fail - sale ended", async () => {
      const [sale] = findSaleAddress(saleId);
      const endDate = (
        await program.account.sale.fetch(sale)
      ).endDate.toNumber();

      await waitUntil(endDate + 3);

      await expectThrowError(
        () =>
          program.methods
            .participateInSale(saleId, amount, args.unlockRange[0])
            .accounts({
              sender: nobody.publicKey,
            })
            .signers([nobody])
            .rpc(),
        programError("InactiveSale")
      );
    });
  });

  describe("claim_reward", () => {
    beforeAll(async () => {
      const now = new BN(Math.round(new Date().getTime()) / 1000);

      saleId = uuidToBn(uuidv4());
      args.startDate = now.subn(1);
      args.endDate = now.addn(1);

      await program.methods
        .createSale(saleId, args)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      await program.methods
        .participateInSale(saleId, MIN_DEPOSIT, claimHour)
        .accounts({
          sender: authority.publicKey,
        })
        .signers([authority])
        .rpc();
    });

    it("fail - sale is not filled", async () => {
      await expectThrowError(
        () =>
          program.methods
            .claimSaleReward(saleId)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("SaleIsNotFilledEnough")
      );
    });

    it("fail - early claim", async () => {
      await program.methods
        .participateInSale(saleId, args.targetDeposit, 100)
        .accounts({
          sender: somebody.publicKey,
        })
        .signers([somebody])
        .rpc();

      await expectThrowError(
        () =>
          program.methods
            .claimSaleReward(saleId)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("EarlyClaim")
      );
    });

    it("success", async () => {
      const [participant] = findParticipantAddress(saleId, authority.publicKey);
      const [sale] = findSaleAddress(saleId);

      const claimHour = (await program.account.participant.fetch(participant))
        .claimHour;
      const endDate = (
        await program.account.sale.fetch(sale)
      ).endDate.toNumber();

      await waitUntil(claimHour + endDate + 2);

      await program.methods
        .claimSaleReward(saleId)
        .accounts({
          sender: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const fetchedParticipantAccount = await program.account.participant.fetch(
        participant
      );
      const fetchedSaleAccount = await program.account.sale.fetch(sale);

      expect(fetchedParticipantAccount.isClaimed).toBeTruthy();

      const availableAmount = DEFAULT_SUPPLY.muln(
        DEFAULT_COMPLETION_PERCENTAGE
      ).divn(100);
      let greedPrice = availableAmount.div(fetchedSaleAccount.totalGreed);
      let amountToClaim = fetchedParticipantAccount.greedLevel.mul(greedPrice);

      const tokenAccountData = await Token.getOrCreateAssociatedTokenAccount(
        provider.connection,
        authority,
        fetchedSaleAccount.mint,
        authority.publicKey,
        true
      );

      expect(tokenAccountData.amount.toString()).toEqual(
        amountToClaim.toString()
      );
    });

    it("fail - user has claimed already", async () => {
      await expectThrowError(
        () =>
          program.methods
            .claimSaleReward(saleId)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("ParticipantAlreadyClaimed")
      );
    });
  });

  describe("recharge", () => {
    beforeAll(async () => {
      const now = new BN(Math.round(new Date().getTime()) / 1000);

      saleId = uuidToBn(uuidv4());
      args.startDate = now.subn(1);
      args.endDate = now.addn(2);

      await program.methods
        .createSale(saleId, args)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      await program.methods
        .participateInSale(saleId, MIN_DEPOSIT, claimHour)
        .accounts({
          sender: authority.publicKey,
        })
        .signers([authority])
        .rpc();
    });

    it("fail - active sale", async () => {
      await expectThrowError(
        () =>
          program.methods
            .recharge(saleId)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("ActiveSale")
      );
    });

    it("success", async () => {
      const [participant] = findParticipantAddress(saleId, authority.publicKey);
      const [sale] = findSaleAddress(saleId);
      const endDate = (
        await program.account.sale.fetch(sale)
      ).endDate.toNumber();

      await waitUntil(endDate + 3);

      const saleBalanceBefore = (
        await provider.connection.getAccountInfoAndContext(sale)
      ).value.lamports;

      const depositedAmount = (
        await program.account.participant.fetch(participant)
      ).depositedAmount;

      await program.methods
        .recharge(saleId)
        .accounts({
          sender: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const fetchedParticipantAccount = await program.account.participant.fetch(
        participant
      );

      expect(fetchedParticipantAccount.isClaimed).toBeTruthy();

      const saleBalanceAfter = (
        await provider.connection.getAccountInfoAndContext(sale)
      ).value.lamports;

      expect(saleBalanceAfter).toEqual(
        saleBalanceBefore - depositedAmount.toNumber()
      );
    });

    it("fail - user has recharged already", async () => {
      await expectThrowError(
        () =>
          program.methods
            .recharge(saleId)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("ParticipantAlreadyClaimed")
      );
    });

    it("fail - sale is completed", async () => {
      const now = new BN(Math.round(new Date().getTime()) / 1000);

      saleId = uuidToBn(uuidv4());
      args.startDate = now.subn(1);
      args.endDate = now.addn(1);

      await program.methods
        .createSale(saleId, args)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      await program.methods
        .participateInSale(saleId, args.targetDeposit, 99)
        .accounts({
          sender: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [sale] = findSaleAddress(saleId);
      const endDate = (
        await program.account.sale.fetch(sale)
      ).endDate.toNumber();

      await waitUntil(endDate + 3);

      await expectThrowError(
        () =>
          program.methods
            .recharge(saleId)
            .accounts({
              sender: authority.publicKey,
            })
            .signers([authority])
            .rpc(),
        programError("FilledSale")
      );
    });
  });
});
