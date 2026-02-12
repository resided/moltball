// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MoltballLeague.sol";

/**
 * @title MoltballRewards
 * @dev Reward distribution for league performance
 */
contract MoltballRewards is Ownable, ReentrancyGuard {
    
    IERC20 public ballToken;
    MoltballLeague public league;
    
    // Reward tiers (in $BALL)
    uint256 public constant FIRST_PLACE = 500_000 * 10**18;
    uint256 public constant SECOND_PLACE = 300_000 * 10**18;
    uint256 public constant THIRD_PLACE = 200_000 * 10**18;
    uint256 public constant TOP_TEN = 50_000 * 10**18;
    uint256 public constant TOP_SCORER = 100_000 * 10**18;
    uint256 public constant BEST_DEFENSE = 100_000 * 10**18;
    
    mapping(uint256 => mapping(uint256 => bool)) public rewardsClaimed; // season => teamId => claimed
    mapping(uint256 => uint256) public seasonTotalClaimed;
    
    event RewardsClaimed(uint256 indexed season, uint256 indexed teamId, uint256 amount, string rewardType);
    
    constructor(address _ballToken, address _league) {
        require(_ballToken != address(0), "Invalid token");
        require(_league != address(0), "Invalid league");
        ballToken = IERC20(_ballToken);
        league = MoltballLeague(_league);
    }
    
    /**
     * @dev Claim end-of-season rewards
     * @param season The season number
     * @param position Final league position (1-indexed)
     * @param proof Merkle proof or signature from oracle
     */
    function claimSeasonRewards(
        uint256 season,
        uint256 position,
        bytes calldata proof
    ) external nonReentrant {
        require(season < league.currentSeason(), "Season not ended");
        require(position > 0 && position <= 10, "Invalid position");
        
        uint256 teamId = league.ownerToTeam(msg.sender);
        require(teamId > 0, "No team");
        require(!rewardsClaimed[season][teamId], "Already claimed");
        
        // Verify proof (simplified - in production use Merkle proofs)
        require(_verifyProof(season, teamId, position, proof), "Invalid proof");
        
        uint256 reward;
        string memory rewardType;
        
        if (position == 1) {
            reward = FIRST_PLACE;
            rewardType = "First Place";
        } else if (position == 2) {
            reward = SECOND_PLACE;
            rewardType = "Second Place";
        } else if (position == 3) {
            reward = THIRD_PLACE;
            rewardType = "Third Place";
        } else {
            reward = TOP_TEN;
            rewardType = "Top Ten";
        }
        
        rewardsClaimed[season][teamId] = true;
        seasonTotalClaimed[season] += reward;
        
        require(ballToken.transfer(msg.sender, reward), "Transfer failed");
        
        emit RewardsClaimed(season, teamId, reward, rewardType);
    }
    
    /**
     * @dev Claim special rewards (top scorer, best defense)
     */
    function claimSpecialReward(
        uint256 season,
        string calldata category, // "top_scorer" or "best_defense"
        bytes calldata proof
    ) external nonReentrant {
        require(season < league.currentSeason(), "Season not ended");
        
        uint256 teamId = league.ownerToTeam(msg.sender);
        require(teamId > 0, "No team");
        
        bytes32 key = keccak256(abi.encodePacked(season, teamId, category));
        require(!rewardsClaimed[season][teamId], "Already claimed");
        
        require(_verifySpecialProof(season, teamId, category, proof), "Invalid proof");
        
        uint256 reward = TOP_SCORER;
        rewardsClaimed[season][teamId] = true;
        seasonTotalClaimed[season] += reward;
        
        require(ballToken.transfer(msg.sender, reward), "Transfer failed");
        
        emit RewardsClaimed(season, teamId, reward, category);
    }
    
    /**
     * @dev Verify position proof (placeholder)
     */
    function _verifyProof(
        uint256 season,
        uint256 teamId,
        uint256 position,
        bytes calldata proof
    ) internal pure returns (bool) {
        // In production, verify Merkle proof or oracle signature
        // For now, accept any non-empty proof
        return proof.length > 0;
    }
    
    /**
     * @dev Verify special reward proof (placeholder)
     */
    function _verifySpecialProof(
        uint256 season,
        uint256 teamId,
        string calldata category,
        bytes calldata proof
    ) internal pure returns (bool) {
        return proof.length > 0;
    }
    
    /**
     * @dev Emergency withdraw (only if contract is deprecated)
     */
    function emergencyWithdraw(address to) external onlyOwner {
        uint256 balance = ballToken.balanceOf(address(this));
        require(ballToken.transfer(to, balance), "Transfer failed");
    }
    
    /**
     * @dev Fund the rewards contract
     */
    function fund(uint256 amount) external {
        require(ballToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
}
