import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  BallToken,
  MoltballPlayerNFT,
  MoltballLeague,
  MoltballMarketplace,
  MoltballRewards,
} from "../typechain-types";

describe("Moltball", function () {
  let ballToken: BallToken;
  let playerNFT: MoltballPlayerNFT;
  let league: MoltballLeague;
  let marketplace: MoltballMarketplace;
  let rewards: MoltballRewards;
  
  let owner: HardhatEthersSigner;
  let agent1: HardhatEthersSigner;
  let agent2: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, agent1, agent2, treasury] = await ethers.getSigners();

    // Deploy BALL token
    const BallToken = await ethers.getContractFactory("BallToken");
    ballToken = await BallToken.deploy(
      owner.address,
      owner.address,
      owner.address
    );

    // Deploy Player NFT
    const MoltballPlayerNFT = await ethers.getContractFactory("MoltballPlayerNFT");
    playerNFT = await MoltballPlayerNFT.deploy(
      await ballToken.getAddress(),
      treasury.address
    );

    // Deploy League
    const MoltballLeague = await ethers.getContractFactory("MoltballLeague");
    league = await MoltballLeague.deploy(
      await playerNFT.getAddress(),
      owner.address,
      await ballToken.getAddress()
    );

    // Deploy Marketplace
    const MoltballMarketplace = await ethers.getContractFactory("MoltballMarketplace");
    marketplace = await MoltballMarketplace.deploy(
      await playerNFT.getAddress(),
      await ballToken.getAddress(),
      treasury.address
    );

    // Deploy Rewards
    const MoltballRewards = await ethers.getContractFactory("MoltballRewards");
    rewards = await MoltballRewards.deploy(
      await ballToken.getAddress(),
      await league.getAddress()
    );

    // Setup
    await playerNFT.setLeagueContract(await league.getAddress());
    await league.startSeason();

    // Fund agents with BALL
    await ballToken.transfer(agent1.address, ethers.parseEther("10000"));
    await ballToken.transfer(agent2.address, ethers.parseEther("10000"));
  });

  describe("BallToken", function () {
    it("Should have correct initial supply", async function () {
      const totalSupply = await ballToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000000"));
    });

    it("Should mint airdrop correctly", async function () {
      const recipients = [agent1.address, agent2.address];
      const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
      
      await ballToken.mintAirdrop(recipients, amounts);
      
      expect(await ballToken.balanceOf(agent1.address)).to.equal(
        ethers.parseEther("10100")
      );
    });
  });

  describe("MoltballPlayerNFT", function () {
    it("Should mint player pack", async function () {
      const mintPrice = ethers.parseEther("1");
      const amount = 5;
      const totalCost = mintPrice * BigInt(amount);
      
      await ballToken.connect(agent1).approve(await playerNFT.getAddress(), totalCost);
      await playerNFT.connect(agent1).mintPack(amount);
      
      expect(await playerNFT.balanceOf(agent1.address)).to.equal(amount);
    });

    it("Should calculate player value", async function () {
      const mintPrice = ethers.parseEther("1");
      await ballToken.connect(agent1).approve(await playerNFT.getAddress(), mintPrice);
      await playerNFT.connect(agent1).mintPack(1);
      
      const playerId = 1;
      const value = await playerNFT.playerValue(playerId);
      expect(value).to.be.gt(0);
    });
  });

  describe("MoltballLeague", function () {
    beforeEach(async function () {
      // Mint players for agents
      const mintPrice = ethers.parseEther("25");
      await ballToken.connect(agent1).approve(await playerNFT.getAddress(), mintPrice);
      await playerNFT.connect(agent1).mintPack(25);

      await ballToken.connect(agent2).approve(await playerNFT.getAddress(), mintPrice);
      await playerNFT.connect(agent2).mintPack(25);
    });

    it("Should register team", async function () {
      // Get player IDs for agent1
      const playerIds = [];
      for (let i = 1; i <= 11; i++) {
        playerIds.push(i);
      }

      const regFee = ethers.parseEther("50");
      await ballToken.connect(agent1).approve(await league.getAddress(), regFee);
      
      await league.connect(agent1).registerTeam(
        "Agent FC",
        "#FF0000",
        playerIds
      );

      const teamId = await league.ownerToTeam(agent1.address);
      expect(teamId).to.equal(1);

      const team = await league.teams(teamId);
      expect(team.name).to.equal("Agent FC");
      expect(team.active).to.be.true;
    });

    it("Should update tactics", async function () {
      // First register team
      const playerIds = [];
      for (let i = 1; i <= 11; i++) {
        playerIds.push(i);
      }

      const regFee = ethers.parseEther("50");
      await ballToken.connect(agent1).approve(await league.getAddress(), regFee);
      await league.connect(agent1).registerTeam("Agent FC", "#FF0000", playerIds);

      const teamId = await league.ownerToTeam(agent1.address);

      // Update tactics
      await league.connect(agent1).updateTactics(
        teamId,
        "4-3-3",
        7, // attackingIntensity
        5, // defensiveLine
        8, // pressingIntensity
        1  // playStyle (possession)
      );

      const tactics = await league.teamTactics(teamId);
      expect(tactics.formation).to.equal("4-3-3");
      expect(tactics.playStyle).to.equal(1);
    });
  });

  describe("MoltballMarketplace", function () {
    beforeEach(async function () {
      // Mint and register team for agent1
      const mintPrice = ethers.parseEther("25");
      await ballToken.connect(agent1).approve(await playerNFT.getAddress(), mintPrice);
      await playerNFT.connect(agent1).mintPack(25);

      const regFee = ethers.parseEther("50");
      const playerIds = Array.from({ length: 11 }, (_, i) => i + 1);
      await ballToken.connect(agent1).approve(await league.getAddress(), regFee);
      await league.connect(agent1).registerTeam("Agent FC", "#FF0000", playerIds);
    });

    it("Should list and buy player", async function () {
      const playerId = 12; // Extra player not in team
      const price = ethers.parseEther("100");

      // List player
      await playerNFT.connect(agent1).approve(await marketplace.getAddress(), playerId);
      await marketplace.connect(agent1).listPlayer(playerId, price);

      const listingId = await marketplace.playerToListing(playerId);
      expect(listingId).to.be.gt(0);

      // Buy player
      await ballToken.connect(agent2).approve(await marketplace.getAddress(), price);
      await marketplace.connect(agent2).buyPlayer(listingId);

      expect(await playerNFT.ownerOf(playerId)).to.equal(agent2.address);
    });
  });
});
