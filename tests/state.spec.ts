import {
  web3,
  AnchorProvider,
  setProvider,
  Program,
  workspace,
  BN,
} from "@coral-xyz/anchor";

import { expectThrowError } from "./util/console";
import { programError } from "./util/error";
import { TestToken } from "./util/token";
import { DEFAULT_FEE, DEFAULT_MULTIPLIER, airdrop } from "./util/setup";

import { GreedySolana } from "../target/types/greedy_solana";
import {
  ACCOUNT_SIZE,
  findContractStateAddress,
  findProgramDataAddress,
} from "./util/entity";

describe("State initialization", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.GreedySolana as Program<GreedySolana>;

  const authority = web3.Keypair.generate();
  const another_authority = web3.Keypair.generate();

  let testMint: TestToken;

  const multiplier = new BN(5);

  beforeAll(async () => {
    testMint = new TestToken(provider);
    await testMint.mint(1_000_000_000);

    await airdrop(provider.connection, authority.publicKey);
    await airdrop(provider.connection, another_authority.publicKey);
  });

  describe("initialize_state", () => {
    it("fail - authority mismatch", async () => {
      const [programData] = findProgramDataAddress();

      await expectThrowError(
        () =>
          program.methods
            .initializeContractState(
              authority.publicKey,
              multiplier,
              DEFAULT_FEE
            )
            .accounts({
              authority: another_authority.publicKey,
              programData,
            })
            .signers([another_authority])
            .rpc(),
        programError("AuthorityMismatch")
      );
    });

    it("success", async () => {
      const [state] = findContractStateAddress();
      const [programData] = findProgramDataAddress();

      const fee = DEFAULT_FEE.addn(1);

      await program.methods
        .initializeContractState(authority.publicKey, multiplier, fee)
        .accounts({
          authority: provider.publicKey,
          programData,
        })
        .rpc();

      const fetchedStateAccount = await program.account.state.fetch(state);

      expect(fetchedStateAccount.authority).toEqual(authority.publicKey);
      expect(fetchedStateAccount.multiplier.eq(multiplier)).toBeTruthy();
      expect(fetchedStateAccount.fee.eq(fee)).toBeTruthy();

      const stateInfo = await provider.connection.getAccountInfoAndContext(
        state
      );

      expect(stateInfo.value.owner).toEqual(program.programId);
      expect(stateInfo.value.data.length).toEqual(ACCOUNT_SIZE.state);
    });

    it("fail - state already exists", async () => {
      const [programData] = findProgramDataAddress();

      await expectThrowError(
        () =>
          program.methods
            .initializeContractState(
              authority.publicKey,
              multiplier,
              DEFAULT_FEE
            )
            .accounts({
              authority: provider.publicKey,
              programData,
            })
            .rpc(),
        /custom program error: 0x0/
      );
    });
  });

  describe("update_state", () => {
    it("fail - authority mismatch", async () => {
      await expectThrowError(
        () =>
          program.methods
            .setContractAuthority(another_authority.publicKey)
            .accounts({
              authority: another_authority.publicKey,
            })
            .signers([another_authority])
            .rpc(),
        programError("AuthorityMismatch")
      );
    });

    it("success - update contract multiplier", async () => {
      const [state] = findContractStateAddress();

      await program.methods
        .setContractMultiplier(DEFAULT_MULTIPLIER)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const fetchedStateAccount = await program.account.state.fetch(state);

      expect(
        fetchedStateAccount.multiplier.eq(DEFAULT_MULTIPLIER)
      ).toBeTruthy();
    });

    it("success - update contract fee", async () => {
      const [state] = findContractStateAddress();

      await program.methods
        .setContractFee(DEFAULT_FEE)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const fetchedStateAccount = await program.account.state.fetch(state);

      expect(fetchedStateAccount.fee.eq(DEFAULT_FEE)).toBeTruthy();
    });

    it("success - update contract authority", async () => {
      const [state] = findContractStateAddress();

      await program.methods
        .setContractAuthority(provider.publicKey)
        .accounts({
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const fetchedStateAccount = await program.account.state.fetch(state);

      expect(fetchedStateAccount.authority).toEqual(provider.publicKey);
    });
  });
});
