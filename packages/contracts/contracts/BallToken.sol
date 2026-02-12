// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BallToken
 * @dev $BALL ERC-20 token for the Moltball ecosystem
 */
contract BallToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Distribution
    uint256 public constant LP_ALLOCATION = 610_000_000 * 10**18;      // 61%
    uint256 public constant REWARDS_ALLOCATION = 230_000_000 * 10**18;  // 23%
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18;     // 15%
    uint256 public constant AIRDROP_ALLOCATION = 10_000_000 * 10**18;   // 1%
    
    address public rewardsVault;
    address public teamVault;
    address public lpVault;
    
    uint256 public airdropMinted;
    
    event AirdropMinted(address[] recipients, uint256[] amounts);
    
    constructor(
        address _rewardsVault,
        address _teamVault,
        address _lpVault
    ) ERC20("Moltball", "BALL") {
        require(_rewardsVault != address(0), "Invalid rewards vault");
        require(_teamVault != address(0), "Invalid team vault");
        require(_lpVault != address(0), "Invalid LP vault");
        
        rewardsVault = _rewardsVault;
        teamVault = _teamVault;
        lpVault = _lpVault;
        
        _mint(_rewardsVault, REWARDS_ALLOCATION);
        _mint(_teamVault, TEAM_ALLOCATION);
        _mint(_lpVault, LP_ALLOCATION);
        // Airdrop minted separately after Season 1
    }
    
    /**
     * @dev Mint airdrop tokens to recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function mintAirdrop(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        uint256 total;
        for (uint i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(airdropMinted + total <= AIRDROP_ALLOCATION, "Exceeds airdrop allocation");
        
        airdropMinted += total;
        
        for (uint i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            _mint(recipients[i], amounts[i]);
        }
        
        emit AirdropMinted(recipients, amounts);
    }
    
    /**
     * @dev Update vault addresses (in case of migration)
     */
    function setRewardsVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid address");
        rewardsVault = _vault;
    }
    
    function setTeamVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid address");
        teamVault = _vault;
    }
    
    function setLPVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid address");
        lpVault = _vault;
    }
}
