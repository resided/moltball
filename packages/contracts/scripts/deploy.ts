import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy BALL token
  console.log("\n1. Deploying BallToken...");
  const BallToken = await ethers.getContractFactory("BallToken");
  const ballToken = await BallToken.deploy(
    deployer.address, // rewardsVault (temporary)
    deployer.address, // teamVault
    deployer.address  // lpVault
  );
  await ballToken.waitForDeployment();
  const ballTokenAddress = await ballToken.getAddress();
  console.log("BallToken:", ballTokenAddress);

  // Deploy Player NFT
  console.log("\n2. Deploying MoltballPlayerNFT...");
  const MoltballPlayerNFT = await ethers.getContractFactory("MoltballPlayerNFT");
  const playerNFT = await MoltballPlayerNFT.deploy(
    ballTokenAddress,
    deployer.address // treasury
  );
  await playerNFT.waitForDeployment();
  const playerNFTAddress = await playerNFT.getAddress();
  console.log("MoltballPlayerNFT:", playerNFTAddress);

  // Deploy League
  console.log("\n3. Deploying MoltballLeague...");
  const MoltballLeague = await ethers.getContractFactory("MoltballLeague");
  const league = await MoltballLeague.deploy(
    playerNFTAddress,
    deployer.address, // rewardsVault
    ballTokenAddress
  );
  await league.waitForDeployment();
  const leagueAddress = await league.getAddress();
  console.log("MoltballLeague:", leagueAddress);

  // Deploy Marketplace
  console.log("\n4. Deploying MoltballMarketplace...");
  const MoltballMarketplace = await ethers.getContractFactory("MoltballMarketplace");
  const marketplace = await MoltballMarketplace.deploy(
    playerNFTAddress,
    ballTokenAddress,
    deployer.address // treasury
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("MoltballMarketplace:", marketplaceAddress);

  // Deploy Rewards
  console.log("\n5. Deploying MoltballRewards...");
  const MoltballRewards = await ethers.getContractFactory("MoltballRewards");
  const rewards = await MoltballRewards.deploy(
    ballTokenAddress,
    leagueAddress
  );
  await rewards.waitForDeployment();
  const rewardsAddress = await rewards.getAddress();
  console.log("MoltballRewards:", rewardsAddress);

  // Set contract references
  console.log("\n6. Setting contract references...");
  await (await playerNFT.setLeagueContract(leagueAddress)).wait();
  console.log("✓ PlayerNFT league set");

  // Start first season
  console.log("\n7. Starting first season...");
  await (await league.startSeason()).wait();
  console.log("✓ Season 1 started");

  // Fund rewards contract
  console.log("\n8. Funding rewards contract...");
  const fundAmount = ethers.parseEther("1000000"); // 1M BALL
  await (await ballToken.transfer(rewardsAddress, fundAmount)).wait();
  console.log("✓ Rewards funded with 1M BALL");

  console.log("\n========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("BallToken:", ballTokenAddress);
  console.log("MoltballPlayerNFT:", playerNFTAddress);
  console.log("MoltballLeague:", leagueAddress);
  console.log("MoltballMarketplace:", marketplaceAddress);
  console.log("MoltballRewards:", rewardsAddress);
  console.log("========================================");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    contracts: {
      BallToken: ballTokenAddress,
      MoltballPlayerNFT: playerNFTAddress,
      MoltballLeague: leagueAddress,
      MoltballMarketplace: marketplaceAddress,
      MoltballRewards: rewardsAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment JSON:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
