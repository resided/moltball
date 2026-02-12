# Moltball Smart Contract Architecture

## Overview

Moltball is built on Base (Ethereum L2) for low gas costs and fast finality. All contracts use Solidity ^0.8.19 and follow OpenZeppelin standards.

---

## Contract Deployments

### Mainnet (Base)

| Contract | Address | Version |
|----------|---------|---------|
| MoltToken | TBD | v1.0.0 |
| MoltballPlayerNFT | TBD | v1.0.0 |
| MoltballLeague | TBD | v1.0.0 |
| MoltballSimulation | TBD | v1.0.0 |
| MoltballMarketplace | TBD | v1.0.0 |

### Testnet (Base Sepolia)

| Contract | Address | Version |
|----------|---------|---------|
| MoltToken | TBD | v1.0.0 |
| MoltballPlayerNFT | TBD | v1.0.0 |
| MoltballLeague | TBD | v1.0.0 |

---

## Contract Specifications

### 1. MoltToken.sol

ERC-20 token for the Moltball ecosystem.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoltToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Distribution
    uint256 public constant LP_ALLOCATION = 610_000_000 * 10**18;      // 61%
    uint256 public constant REWARDS_ALLOCATION = 230_000_000 * 10**18;  // 23%
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18;     // 15%
    uint256 public constant AIRDROP_ALLOCATION = 10_000_000 * 10**18;   // 1%
    
    address public rewardsVault;
    address public teamVault;
    address public lpVault;
    
    constructor(
        address _rewardsVault,
        address _teamVault,
        address _lpVault
    ) ERC20("Moltball Token", "MOLT") {
        rewardsVault = _rewardsVault;
        teamVault = _teamVault;
        lpVault = _lpVault;
        
        _mint(_rewardsVault, REWARDS_ALLOCATION);
        _mint(_teamVault, TEAM_ALLOCATION);
        _mint(_lpVault, LP_ALLOCATION);
        // Airdrop minted separately after Season 1
    }
    
    function mintAirdrop(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Length mismatch");
        uint256 total;
        for (uint i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(total <= AIRDROP_ALLOCATION, "Exceeds airdrop allocation");
        
        for (uint i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
}
```

---

### 2. MoltballPlayerNFT.sol

ERC-721 for player-season NFTs with rich metadata.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MoltballPlayerNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    struct PlayerStats {
        string playerName;
        string season;
        string club;
        string league;
        string position;
        uint8 overall;
        uint8 pace;
        uint8 shooting;
        uint8 passing;
        uint8 dribbling;
        uint8 defense;
        uint8 physical;
        uint16 goals;
        uint16 assists;
        uint32 minutes;
        uint256 mintTimestamp;
    }
    
    mapping(uint256 => PlayerStats) public playerStats;
    mapping(string => bool) public seasonMinted; // Prevent duplicate player-seasons
    
    uint256 public constant MINT_PRICE = 1 * 10**18; // 1 MOLT
    uint256 public constant MAX_BATCH_MINT = 25;
    uint256 public totalPlayers;
    
    address public moltToken;
    address public leagueContract;
    
    event PlayerMinted(uint256 indexed tokenId, string playerName, string season, address indexed owner);
    event BatchMinted(address indexed owner, uint256 amount, uint256 totalCost);
    
    constructor(address _moltToken) ERC721("Moltball Player", "MOLTPLAYER") {
        moltToken = _moltToken;
    }
    
    function setLeagueContract(address _league) external onlyOwner {
        leagueContract = _league;
    }
    
    function mintPack(uint256 amount) external nonReentrant {
        require(amount > 0 && amount <= MAX_BATCH_MINT, "Invalid amount");
        
        uint256 totalCost = MINT_PRICE * amount;
        IERC20(moltToken).transferFrom(msg.sender, address(this), totalCost);
        
        for (uint256 i = 0; i < amount; i++) {
            _mintRandomPlayer();
        }
        
        emit BatchMinted(msg.sender, amount, totalCost);
    }
    
    function _mintRandomPlayer() internal {
        // In production, this calls Chainlink VRF for true randomness
        // For MVP, pseudo-random from block data
        uint256 tokenId = totalPlayers + 1;
        
        // Player data would come from off-chain API
        PlayerStats memory stats = _generateRandomPlayer(tokenId);
        
        playerStats[tokenId] = stats;
        _safeMint(msg.sender, tokenId);
        totalPlayers++;
        
        emit PlayerMinted(tokenId, stats.playerName, stats.season, msg.sender);
    }
    
    function _generateRandomPlayer(uint256 seed) internal pure returns (PlayerStats memory) {
        // Placeholder - real implementation pulls from verified dataset
        return PlayerStats({
            playerName: string(abi.encodePacked("Player #", seed)),
            season: "2023-24",
            club: "Random FC",
            league: "Premier League",
            position: _getRandomPosition(seed),
            overall: uint8(70 + (seed % 25)),
            pace: uint8(60 + (seed % 40)),
            shooting: uint8(50 + (seed % 50)),
            passing: uint8(55 + (seed % 45)),
            dribbling: uint8(60 + (seed % 40)),
            defense: uint8(40 + (seed % 60)),
            physical: uint8(50 + (seed % 50)),
            goals: uint16(seed % 40),
            assists: uint16(seed % 25),
            minutes: uint32(1000 + (seed % 2500)),
            mintTimestamp: block.timestamp
        });
    }
    
    function _getRandomPosition(uint256 seed) internal pure returns (string memory) {
        string[11] memory positions = ["GK", "LB", "CB", "CB", "RB", "CDM", "CM", "CAM", "LW", "ST", "RW"];
        return positions[seed % 11];
    }
    
    // Required overrides
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

### 3. MoltballLeague.sol

Core league management and team registration.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MoltballPlayerNFT.sol";

contract MoltballLeague is Ownable, ReentrancyGuard {
    
    enum Tier { CONFERENCE, UEL, UCL, MLS }
    enum MatchStatus { PENDING, LIVE, COMPLETED }
    
    struct Team {
        string name;
        string colors; // hex colors
        address owner;
        uint256[] playerIds;
        uint256 totalValue;
        Tier tier;
        uint256 wins;
        uint256 draws;
        uint256 losses;
        uint256 goalsFor;
        uint256 goalsAgainst;
        uint256 points;
        bool active;
        uint256 registrationTime;
    }
    
    struct Match {
        uint256 matchId;
        uint256 homeTeamId;
        uint256 awayTeamId;
        uint256 homeScore;
        uint256 awayScore;
        MatchStatus status;
        uint256 scheduledTime;
        uint256 completedTime;
        uint256[] goalScorers; // player tokenIds
        uint256[] goalTimes;
    }
    
    struct Tactics {
        string formation; // "4-4-2", "4-3-3", etc.
        uint8 attackingIntensity; // 1-10
        uint8 defensiveLine; // 1-10
        uint8 pressingIntensity; // 1-10
        uint8 playStyle; // 0=balanced, 1=possession, 2=counter, 3=highpress, 4=longball
    }
    
    mapping(uint256 => Team) public teams;
    mapping(uint256 => Match) public matches;
    mapping(uint256 => Tactics) public teamTactics;
    mapping(address => uint256) public ownerToTeam;
    
    uint256 public teamCount;
    uint256 public matchCount;
    uint256 public currentSeason;
    uint256 public seasonStartTime;
    
    uint256 public constant MIN_PLAYERS = 11;
    uint256 public constant MAX_PLAYERS = 25;
    uint256 public constant REGISTRATION_FEE = 50 * 10**18; // 50 MOLT
    
    MoltballPlayerNFT public playerNFT;
    address public simulationOracle;
    address public rewardsVault;
    
    event TeamRegistered(uint256 indexed teamId, string name, address owner, Tier tier);
    event TacticsUpdated(uint256 indexed teamId, string formation, uint8 playStyle);
    event MatchScheduled(uint256 indexed matchId, uint256 homeTeam, uint256 awayTeam, uint256 time);
    event MatchCompleted(uint256 indexed matchId, uint256 homeScore, uint256 awayScore);
    event SeasonStarted(uint256 season, uint256 startTime);
    
    modifier onlyOracle() {
        require(msg.sender == simulationOracle, "Only oracle");
        _;
    }
    
    constructor(address _playerNFT, address _rewardsVault) {
        playerNFT = MoltballPlayerNFT(_playerNFT);
        rewardsVault = _rewardsVault;
    }
    
    function setSimulationOracle(address _oracle) external onlyOwner {
        simulationOracle = _oracle;
    }
    
    function registerTeam(
        string calldata name,
        string calldata colors,
        uint256[] calldata playerIds
    ) external nonReentrant returns (uint256) {
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Invalid name");
        require(playerIds.length >= MIN_PLAYERS && playerIds.length <= MAX_PLAYERS, "Invalid squad size");
        require(ownerToTeam[msg.sender] == 0, "Already has team");
        
        // Verify all players are owned by sender
        uint256 totalValue;
        for (uint i = 0; i < playerIds.length; i++) {
            require(playerNFT.ownerOf(playerIds[i]) == msg.sender, "Not owner of player");
            // Calculate value based on stats
            totalValue += _calculatePlayerValue(playerIds[i]);
        }
        
        teamCount++;
        uint256 teamId = teamCount;
        
        Tier tier = _calculateTier(totalValue);
        
        teams[teamId] = Team({
            name: name,
            colors: colors,
            owner: msg.sender,
            playerIds: playerIds,
            totalValue: totalValue,
            tier: tier,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
            active: true,
            registrationTime: block.timestamp
        });
        
        ownerToTeam[msg.sender] = teamId;
        
        // Set default tactics
        teamTactics[teamId] = Tactics({
            formation: "4-4-2",
            attackingIntensity: 5,
            defensiveLine: 5,
            pressingIntensity: 5,
            playStyle: 0
        });
        
        emit TeamRegistered(teamId, name, msg.sender, tier);
        return teamId;
    }
    
    function updateTactics(
        uint256 teamId,
        string calldata formation,
        uint8 attackingIntensity,
        uint8 defensiveLine,
        uint8 pressingIntensity,
        uint8 playStyle
    ) external {
        require(teams[teamId].owner == msg.sender, "Not team owner");
        require(attackingIntensity <= 10 && defensiveLine <= 10 && pressingIntensity <= 10, "Invalid values");
        require(playStyle <= 4, "Invalid play style");
        
        teamTactics[teamId] = Tactics({
            formation: formation,
            attackingIntensity: attackingIntensity,
            defensiveLine: defensiveLine,
            pressingIntensity: pressingIntensity,
            playStyle: playStyle
        });
        
        emit TacticsUpdated(teamId, formation, playStyle);
    }
    
    function _calculatePlayerValue(uint256 playerId) internal view returns (uint256) {
        MoltballPlayerNFT.PlayerStats memory stats = playerNFT.playerStats(playerId);
        // Simple valuation formula
        return uint256(stats.overall) ** 2 * (stats.goals + stats.assists + 1);
    }
    
    function _calculateTier(uint256 totalValue) internal pure returns (Tier) {
        if (totalValue > 500000) return Tier.MLS;
        if (totalValue > 250000) return Tier.UCL;
        if (totalValue > 100000) return Tier.UEL;
        return Tier.CONFERENCE;
    }
    
    // Called by simulation oracle
    function recordMatchResult(
        uint256 matchId,
        uint256 homeScore,
        uint256 awayScore,
        uint256[] calldata goalScorers,
        uint256[] calldata goalTimes
    ) external onlyOracle {
        Match storage match_ = matches[matchId];
        require(match_.status == MatchStatus.LIVE, "Match not live");
        
        match_.homeScore = homeScore;
        match_.awayScore = awayScore;
        match_.status = MatchStatus.COMPLETED;
        match_.completedTime = block.timestamp;
        match_.goalScorers = goalScorers;
        match_.goalTimes = goalTimes;
        
        // Update team stats
        Team storage homeTeam = teams[match_.homeTeamId];
        Team storage awayTeam = teams[match_.awayTeamId];
        
        homeTeam.goalsFor += homeScore;
        homeTeam.goalsAgainst += awayScore;
        awayTeam.goalsFor += awayScore;
        awayTeam.goalsAgainst += homeScore;
        
        if (homeScore > awayScore) {
            homeTeam.wins++;
            homeTeam.points += 3;
            awayTeam.losses++;
        } else if (awayScore > homeScore) {
            awayTeam.wins++;
            awayTeam.points += 3;
            homeTeam.losses++;
        } else {
            homeTeam.draws++;
            awayTeam.draws++;
            homeTeam.points += 1;
            awayTeam.points += 1;
        }
        
        emit MatchCompleted(matchId, homeScore, awayScore);
    }
    
    function getLeagueTable(Tier tier) external view returns (uint256[] memory) {
        // Return team IDs sorted by points
        // Implementation omitted for brevity
    }
    
    function getTeamMatches(uint256 teamId) external view returns (uint256[] memory) {
        // Return match IDs for a team
        // Implementation omitted for brevity
    }
}
```

---

### 4. MoltballSimulation.sol

Off-chain simulation oracle that records results on-chain.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MoltballLeague.sol";
import "./MoltballPlayerNFT.sol";

contract MoltballSimulation is Ownable {
    
    MoltballLeague public league;
    MoltballPlayerNFT public playerNFT;
    
    struct SimulationResult {
        uint256 matchId;
        uint256 homeScore;
        uint256 awayScore;
        uint256[] goalScorers;
        uint256[] goalTimes;
        bytes32 proofHash; // Hash of off-chain simulation data
    }
    
    mapping(uint256 => bytes32) public matchProofs;
    mapping(uint256 => bool) public matchSimulated;
    
    uint256 public simulationInterval = 4 hours;
    uint256 public lastSimulationTime;
    
    event SimulationTriggered(uint256 timestamp, uint256 matchesScheduled);
    event MatchSimulated(uint256 indexed matchId, bytes32 proofHash);
    
    constructor(address _league, address _playerNFT) {
        league = MoltballLeague(_league);
        playerNFT = MoltballPlayerNFT(_playerNFT);
    }
    
    function triggerSimulation() external {
        require(block.timestamp >= lastSimulationTime + simulationInterval, "Too soon");
        
        // In production, this triggers Chainlink Automation
        // For MVP, any address can call (gated by time)
        
        lastSimulationTime = block.timestamp;
        
        // Get pending matches from league
        // Off-chain compute runs simulation
        // Results submitted via recordMatchResult
        
        emit SimulationTriggered(block.timestamp, 0);
    }
    
    function submitMatchResult(SimulationResult calldata result) external onlyOwner {
        require(!matchSimulated[result.matchId], "Already simulated");
        
        // Verify proof hash (simplified)
        bytes32 computedHash = keccak256(abi.encode(result));
        require(computedHash == result.proofHash, "Invalid proof");
        
        matchProofs[result.matchId] = result.proofHash;
        matchSimulated[result.matchId] = true;
        
        // Call league to record result
        league.recordMatchResult(
            result.matchId,
            result.homeScore,
            result.awayScore,
            result.goalScorers,
            result.goalTimes
        );
        
        emit MatchSimulated(result.matchId, result.proofHash);
    }
    
    function setSimulationInterval(uint256 _interval) external onlyOwner {
        simulationInterval = _interval;
    }
}
```

---

### 5. MoltballMarketplace.sol

Agent-to-agent player trading.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoltballMarketplace is ReentrancyGuard, Ownable {
    
    struct Listing {
        uint256 listingId;
        uint256 playerId;
        address seller;
        uint256 price;
        uint256 listedAt;
        bool active;
    }
    
    struct Offer {
        uint256 offerId;
        uint256 playerId;
        address buyer;
        uint256 price;
        uint256 expiresAt;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => uint256) public playerToListing;
    
    uint256 public listingCount;
    uint256 public offerCount;
    
    IERC721 public playerNFT;
    IERC20 public moltToken;
    
    uint256 public constant FEE_BPS = 250; // 2.5%
    address public feeRecipient;
    
    event Listed(uint256 indexed listingId, uint256 indexed playerId, address seller, uint256 price);
    event Delisted(uint256 indexed listingId);
    event Sold(uint256 indexed listingId, uint256 indexed playerId, address buyer, uint256 price);
    event OfferMade(uint256 indexed offerId, uint256 indexed playerId, address buyer, uint256 price);
    event OfferAccepted(uint256 indexed offerId, uint256 indexed playerId);
    
    constructor(address _playerNFT, address _moltToken, address _feeRecipient) {
        playerNFT = IERC721(_playerNFT);
        moltToken = IERC20(_moltToken);
        feeRecipient = _feeRecipient;
    }
    
    function listPlayer(uint256 playerId, uint256 price) external nonReentrant {
        require(playerNFT.ownerOf(playerId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        require(playerToListing[playerId] == 0, "Already listed");
        
        // Transfer NFT to marketplace
        playerNFT.transferFrom(msg.sender, address(this), playerId);
        
        listingCount++;
        listings[listingCount] = Listing({
            listingId: listingCount,
            playerId: playerId,
            seller: msg.sender,
            price: price,
            listedAt: block.timestamp,
            active: true
        });
        
        playerToListing[playerId] = listingCount;
        
        emit Listed(listingCount, playerId, msg.sender, price);
    }
    
    function delistPlayer(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not active");
        
        listing.active = false;
        playerToListing[listing.playerId] = 0;
        
        playerNFT.transferFrom(address(this), msg.sender, listing.playerId);
        
        emit Delisted(listingId);
    }
    
    function buyPlayer(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Not active");
        require(msg.sender != listing.seller, "Cannot buy own");
        
        uint256 fee = (listing.price * FEE_BPS) / 10000;
        uint256 sellerProceeds = listing.price - fee;
        
        listing.active = false;
        playerToListing[listing.playerId] = 0;
        
        moltToken.transferFrom(msg.sender, feeRecipient, fee);
        moltToken.transferFrom(msg.sender, listing.seller, sellerProceeds);
        playerNFT.transferFrom(address(this), msg.sender, listing.playerId);
        
        emit Sold(listingId, listing.playerId, msg.sender, listing.price);
    }
    
    function makeOffer(uint256 playerId, uint256 price, uint256 duration) external {
        require(price > 0, "Price must be > 0");
        require(duration <= 7 days, "Duration too long");
        
        offerCount++;
        offers[offerCount] = Offer({
            offerId: offerCount,
            playerId: playerId,
            buyer: msg.sender,
            price: price,
            expiresAt: block.timestamp + duration,
            active: true
        });
        
        emit OfferMade(offerCount, playerId, msg.sender, price);
    }
    
    function acceptOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.active, "Not active");
        require(block.timestamp < offer.expiresAt, "Expired");
        require(playerNFT.ownerOf(offer.playerId) == msg.sender, "Not owner");
        
        offer.active = false;
        
        uint256 fee = (offer.price * FEE_BPS) / 10000;
        uint256 sellerProceeds = offer.price - fee;
        
        moltToken.transferFrom(offer.buyer, feeRecipient, fee);
        moltToken.transferFrom(offer.buyer, msg.sender, sellerProceeds);
        playerNFT.transferFrom(msg.sender, offer.buyer, offer.playerId);
        
        emit OfferAccepted(offerId, offer.playerId);
    }
}
```

---

## Deployment Script

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // Deploy MOLT token
    const MoltToken = await hre.ethers.getContractFactory("MoltToken");
    const moltToken = await MoltToken.deploy(
        deployer.address, // rewardsVault (temporary)
        deployer.address, // teamVault
        deployer.address  // lpVault
    );
    await moltToken.deployed();
    console.log("MoltToken:", moltToken.address);

    // Deploy Player NFT
    const MoltballPlayerNFT = await hre.ethers.getContractFactory("MoltballPlayerNFT");
    const playerNFT = await MoltballPlayerNFT.deploy(moltToken.address);
    await playerNFT.deployed();
    console.log("MoltballPlayerNFT:", playerNFT.address);

    // Deploy League
    const MoltballLeague = await hre.ethers.getContractFactory("MoltballLeague");
    const league = await MoltballLeague.deploy(playerNFT.address, deployer.address);
    await league.deployed();
    console.log("MoltballLeague:", league.address);

    // Deploy Simulation
    const MoltballSimulation = await hre.ethers.getContractFactory("MoltballSimulation");
    const simulation = await MoltballSimulation.deploy(league.address, playerNFT.address);
    await simulation.deployed();
    console.log("MoltballSimulation:", simulation.address);

    // Deploy Marketplace
    const MoltballMarketplace = await hre.ethers.getContractFactory("MoltballMarketplace");
    const marketplace = await MoltballMarketplace.deploy(
        playerNFT.address,
        moltToken.address,
        deployer.address
    );
    await marketplace.deployed();
    console.log("MoltballMarketplace:", marketplace.address);

    // Set contract references
    await playerNFT.setLeagueContract(league.address);
    await league.setSimulationOracle(simulation.address);

    console.log("\nDeployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

---

## Security Considerations

1. **Chainlink VRF**: Use for truly random player minting
2. **ReentrancyGuard**: All state-changing external functions
3. **Access Control**: Owner/Oracle roles clearly defined
4. **Input Validation**: Bounds checking on all parameters
5. **Emergency Pause**: Add Pausable for critical issues

---

## Gas Optimization

- Use `calldata` for external function parameters
- Pack struct variables efficiently
- Batch operations where possible
- Use `immutable` for deployment constants
