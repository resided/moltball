// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MoltballPlayerNFT
 * @dev ERC-721 for player-season NFTs with rich on-chain stats
 */
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
    mapping(uint256 => uint256) public playerValue; // Calculated value in $BALL
    
    uint256 public constant MINT_PRICE = 1 * 10**18; // 1 BALL
    uint256 public constant MAX_BATCH_MINT = 25;
    uint256 public totalPlayers;
    
    address public ballToken;
    address public leagueContract;
    address public treasury;
    
    // Fee on mints (2.5% to treasury)
    uint256 public constant MINT_FEE_BPS = 250;
    
    event PlayerMinted(uint256 indexed tokenId, string playerName, string season, address indexed owner);
    event BatchMinted(address indexed owner, uint256 amount, uint256 totalCost);
    event PlayerValueUpdated(uint256 indexed tokenId, uint256 value);
    
    modifier onlyLeague() {
        require(msg.sender == leagueContract, "Only league contract");
        _;
    }
    
    constructor(address _ballToken, address _treasury) ERC721("Moltball Player", "BALLPLAYER") {
        require(_ballToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury");
        ballToken = _ballToken;
        treasury = _treasury;
    }
    
    function setLeagueContract(address _league) external onlyOwner {
        require(_league != address(0), "Invalid address");
        leagueContract = _league;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }
    
    /**
     * @dev Mint a pack of random players
     * @param amount Number of players to mint (1-25)
     */
    function mintPack(uint256 amount) external nonReentrant {
        require(amount > 0 && amount <= MAX_BATCH_MINT, "Invalid amount: 1-25");
        require(ballToken != address(0), "Token not set");
        
        uint256 totalCost = MINT_PRICE * amount;
        uint256 fee = (totalCost * MINT_FEE_BPS) / 10000;
        uint256 burnAmount = totalCost - fee;
        
        // Transfer fee to treasury
        IERC20(ballToken).transferFrom(msg.sender, treasury, fee);
        
        // Burn the rest
        IERC20(ballToken).transferFrom(msg.sender, address(0xdead), burnAmount);
        
        for (uint256 i = 0; i < amount; i++) {
            _mintRandomPlayer();
        }
        
        emit BatchMinted(msg.sender, amount, totalCost);
    }
    
    /**
     * @dev Mint a specific player with verified stats (admin only)
     */
    function mintPlayer(
        address to,
        PlayerStats calldata stats
    ) external onlyOwner returns (uint256) {
        string memory playerSeasonKey = string(abi.encodePacked(stats.playerName, ":", stats.season));
        require(!seasonMinted[playerSeasonKey], "Player-season already minted");
        
        totalPlayers++;
        uint256 tokenId = totalPlayers;
        
        playerStats[tokenId] = stats;
        seasonMinted[playerSeasonKey] = true;
        
        _calculateAndStoreValue(tokenId);
        
        _safeMint(to, tokenId);
        
        emit PlayerMinted(tokenId, stats.playerName, stats.season, to);
        return tokenId;
    }
    
    function _mintRandomPlayer() internal {
        // In production, this calls Chainlink VRF for true randomness
        // For MVP, pseudo-random from block data
        uint256 tokenId = totalPlayers + 1;
        
        PlayerStats memory stats = _generateRandomPlayer(tokenId);
        
        playerStats[tokenId] = stats;
        _calculateAndStoreValue(tokenId);
        
        _safeMint(msg.sender, tokenId);
        totalPlayers++;
        
        emit PlayerMinted(tokenId, stats.playerName, stats.season, msg.sender);
    }
    
    function _generateRandomPlayer(uint256 seed) internal view returns (PlayerStats memory) {
        // Placeholder - real implementation pulls from verified dataset
        return PlayerStats({
            playerName: string(abi.encodePacked("Player #", _uint2str(seed))),
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
    
    /**
     * @dev Calculate player value based on stats
     * Formula: overall^2 * (goals + assists + 1)
     */
    function _calculateAndStoreValue(uint256 tokenId) internal {
        PlayerStats memory stats = playerStats[tokenId];
        uint256 value = uint256(stats.overall) ** 2 * (uint256(stats.goals) + uint256(stats.assists) + 1);
        playerValue[tokenId] = value;
        emit PlayerValueUpdated(tokenId, value);
    }
    
    /**
     * @dev Recalculate value (callable by league after stat updates)
     */
    function updatePlayerValue(uint256 tokenId) external onlyLeague {
        _calculateAndStoreValue(tokenId);
    }
    
    /**
     * @dev Get player position category
     */
    function getPositionCategory(uint256 tokenId) external view returns (string memory) {
        string memory pos = playerStats[tokenId].position;
        if (_strEquals(pos, "GK")) return "GK";
        if (_strEquals(pos, "LB") || _strEquals(pos, "RB") || _strEquals(pos, "CB")) return "DEF";
        if (_strEquals(pos, "CDM") || _strEquals(pos, "CM") || _strEquals(pos, "CAM")) return "MID";
        return "FWD";
    }
    
    function _strEquals(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
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
