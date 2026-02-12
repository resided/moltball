// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MoltballPlayerNFT.sol";

/**
 * @title MoltballLeague
 * @dev Core league management and team registration
 */
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
        bytes32 proofHash; // Off-chain simulation proof
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
    uint256 public constant REGISTRATION_FEE = 50 * 10**18; // 50 BALL
    
    MoltballPlayerNFT public playerNFT;
    address public simulationOracle;
    address public rewardsVault;
    address public ballToken;
    
    // Season settings
    uint256 public constant MATCHES_PER_DAY = 6;
    uint256 public constant SEASON_LENGTH_DAYS = 14;
    
    event TeamRegistered(uint256 indexed teamId, string name, address owner, Tier tier);
    event TacticsUpdated(uint256 indexed teamId, string formation, uint8 playStyle);
    event MatchScheduled(uint256 indexed matchId, uint256 homeTeam, uint256 awayTeam, uint256 time);
    event MatchCompleted(uint256 indexed matchId, uint256 homeScore, uint256 awayScore);
    event SeasonStarted(uint256 season, uint256 startTime);
    event SeasonEnded(uint256 season, uint256 endTime);
    event TeamPromoted(uint256 indexed teamId, Tier newTier);
    event TeamRelegated(uint256 indexed teamId, Tier newTier);
    
    modifier onlyOracle() {
        require(msg.sender == simulationOracle, "Only oracle");
        _;
    }
    
    modifier onlyTeamOwner(uint256 teamId) {
        require(teams[teamId].owner == msg.sender, "Not team owner");
        _;
    }
    
    constructor(
        address _playerNFT, 
        address _rewardsVault, 
        address _ballToken
    ) {
        require(_playerNFT != address(0), "Invalid NFT address");
        require(_rewardsVault != address(0), "Invalid rewards vault");
        require(_ballToken != address(0), "Invalid token address");
        
        playerNFT = MoltballPlayerNFT(_playerNFT);
        rewardsVault = _rewardsVault;
        ballToken = _ballToken;
    }
    
    function setSimulationOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid address");
        simulationOracle = _oracle;
    }
    
    /**
     * @dev Register a new team
     * @param name Team name (1-32 chars)
     * @param colors Team colors in hex
     * @param playerIds Array of player NFT IDs owned by sender
     */
    function registerTeam(
        string calldata name,
        string calldata colors,
        uint256[] calldata playerIds
    ) external nonReentrant returns (uint256) {
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Invalid name length");
        require(playerIds.length >= MIN_PLAYERS && playerIds.length <= MAX_PLAYERS, "Invalid squad size");
        require(ownerToTeam[msg.sender] == 0, "Already has team");
        require(currentSeason > 0, "No active season");
        
        // Collect registration fee
        IERC20(ballToken).transferFrom(msg.sender, rewardsVault, REGISTRATION_FEE);
        
        // Verify all players are owned by sender
        uint256 totalValue;
        for (uint i = 0; i < playerIds.length; i++) {
            require(playerNFT.ownerOf(playerIds[i]) == msg.sender, "Not owner of player");
            totalValue += playerNFT.playerValue(playerIds[i]);
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
    
    /**
     * @dev Update team tactics
     */
    function updateTactics(
        uint256 teamId,
        string calldata formation,
        uint8 attackingIntensity,
        uint8 defensiveLine,
        uint8 pressingIntensity,
        uint8 playStyle
    ) external onlyTeamOwner(teamId) {
        require(attackingIntensity <= 10 && defensiveLine <= 10 && pressingIntensity <= 10, "Invalid intensity");
        require(playStyle <= 4, "Invalid play style");
        require(bytes(formation).length > 0 && bytes(formation).length <= 10, "Invalid formation");
        
        teamTactics[teamId] = Tactics({
            formation: formation,
            attackingIntensity: attackingIntensity,
            defensiveLine: defensiveLine,
            pressingIntensity: pressingIntensity,
            playStyle: playStyle
        });
        
        emit TacticsUpdated(teamId, formation, playStyle);
    }
    
    /**
     * @dev Calculate team tier based on total value
     */
    function _calculateTier(uint256 totalValue) internal pure returns (Tier) {
        if (totalValue > 500000) return Tier.MLS;
        if (totalValue > 250000) return Tier.UCL;
        if (totalValue > 100000) return Tier.UEL;
        return Tier.CONFERENCE;
    }
    
    /**
     * @dev Start a new season
     */
    function startSeason() external onlyOwner {
        require(currentSeason == 0 || block.timestamp > seasonStartTime + (SEASON_LENGTH_DAYS * 1 days), "Season in progress");
        
        currentSeason++;
        seasonStartTime = block.timestamp;
        
        emit SeasonStarted(currentSeason, seasonStartTime);
    }
    
    /**
     * @dev End current season and process promotions/relegations
     */
    function endSeason() external onlyOwner {
        require(currentSeason > 0, "No active season");
        require(block.timestamp >= seasonStartTime + (SEASON_LENGTH_DAYS * 1 days), "Season not complete");
        
        // Process promotions and relegations based on standings
        // Implementation: promote top 3 from each tier, relegate bottom 3
        
        emit SeasonEnded(currentSeason, block.timestamp);
    }
    
    /**
     * @dev Schedule a match (called by oracle)
     */
    function scheduleMatch(uint256 homeTeamId, uint256 awayTeamId) external onlyOracle returns (uint256) {
        require(teams[homeTeamId].active && teams[awayTeamId].active, "Team not active");
        require(homeTeamId != awayTeamId, "Same team");
        require(teams[homeTeamId].tier == teams[awayTeamId].tier, "Different tiers");
        
        matchCount++;
        uint256 matchId = matchCount;
        
        matches[matchId] = Match({
            matchId: matchId,
            homeTeamId: homeTeamId,
            awayTeamId: awayTeamId,
            homeScore: 0,
            awayScore: 0,
            status: MatchStatus.PENDING,
            scheduledTime: block.timestamp,
            completedTime: 0,
            goalScorers: new uint256[](0),
            goalTimes: new uint256[](0),
            proofHash: 0
        });
        
        emit MatchScheduled(matchId, homeTeamId, awayTeamId, block.timestamp);
        return matchId;
    }
    
    /**
     * @dev Record match result (called by oracle)
     */
    function recordMatchResult(
        uint256 matchId,
        uint256 homeScore,
        uint256 awayScore,
        uint256[] calldata goalScorers,
        uint256[] calldata goalTimes,
        bytes32 proofHash
    ) external onlyOracle {
        require(goalScorers.length == goalTimes.length, "Length mismatch");
        
        Match storage match_ = matches[matchId];
        require(match_.status == MatchStatus.PENDING, "Match not pending");
        
        match_.homeScore = homeScore;
        match_.awayScore = awayScore;
        match_.status = MatchStatus.COMPLETED;
        match_.completedTime = block.timestamp;
        match_.goalScorers = goalScorers;
        match_.goalTimes = goalTimes;
        match_.proofHash = proofHash;
        
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
    
    /**
     * @dev Get team stats
     */
    function getTeamStats(uint256 teamId) external view returns (
        uint256 played,
        uint256 wins,
        uint256 draws,
        uint256 losses,
        uint256 goalsFor,
        uint256 goalsAgainst,
        int256 goalDifference,
        uint256 points
    ) {
        Team storage team = teams[teamId];
        played = team.wins + team.draws + team.losses;
        wins = team.wins;
        draws = team.draws;
        losses = team.losses;
        goalsFor = team.goalsFor;
        goalsAgainst = team.goalsAgainst;
        goalDifference = int256(goalsFor) - int256(goalsAgainst);
        points = team.points;
    }
    
    /**
     * @dev Get all team IDs (for standings calculation off-chain)
     */
    function getAllTeamIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](teamCount);
        for (uint i = 0; i < teamCount; i++) {
            ids[i] = i + 1;
        }
        return ids;
    }
}
