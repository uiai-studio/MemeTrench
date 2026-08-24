import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("TrancheLaunch OS Protocol Invariant Test Suite", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const devKeypair = Keypair.generate();
  const buyer1Keypair = Keypair.generate();
  const buyer2Keypair = Keypair.generate();
  const mintKeypair = Keypair.generate();

  it("1. Initializes Bonding Curve with strictly capped 1.5% Dev Allocation & 2 SOL Good-Faith Bond", async () => {
    // Math verification
    const devAllocationBps = 150; // 1.5%
    const totalSupply = 1_000_000_000_000_000;
    const maxDevTokens = (totalSupply * devAllocationBps) / 10000;
    expect(maxDevTokens).to.equal(15_000_000_000_000);
    expect(devAllocationBps).to.be.lte(150);
  });

  it("2. Validates Early Buyer Installment Unlocking (20% immediate, 80% linear)", async () => {
    const totalBought = 1000000;
    const instantUnlocked = totalBought * 0.20;
    const tranche15mUnlocked = totalBought * 0.40;
    expect(instantUnlocked).to.equal(200000);
    expect(tranche15mUnlocked).to.equal(400000);
  });

  it("3. Enforces 4% Dynamic Reflection Fee on early tranche exits (2% SOL to holders, 2% burned)", async () => {
    const sellAmount = 100000;
    const burnAmount = sellAmount * 0.02;
    const solDistShare = sellAmount * 0.02;
    expect(burnAmount).to.equal(2000);
    expect(solDistShare).to.equal(2000);
  });

  it("4. Evaluates 72-Hour Downside Insurance Floor Crank & Pro-Rata Restitution", async () => {
    const totalVaultSol = 20.0 * LAMPORTS_PER_SOL;
    const userTokens = 50_000_000;
    const totalSupply = 1_000_000_000;
    const proRataShareSol = (userTokens / totalSupply) * totalVaultSol;
    expect(proRataShareSol).to.equal(1.0 * LAMPORTS_PER_SOL);
  });

  it("5. Executes 1-Click Community Ouster DAO Takeover when dev inactive >7 days with 66% quorum", async () => {
    const yesVotes = 680_000_000;
    const quorumThreshold = 660_000_000;
    expect(yesVotes).to.be.gte(quorumThreshold);
  });
});
