// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MoltballMarketplace
 * @dev Agent-to-agent player trading with buyback-and-burn on fees
 */
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
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userOffers;
    
    uint256 public listingCount;
    uint256 public offerCount;
    
    IERC721 public playerNFT;
    IERC20 public ballToken;
    
    uint256 public constant FEE_BPS = 250; // 2.5%
    uint256 public constant BURN_BPS = 100; // 1% burned
    uint256 public constant TREASURY_BPS = 150; // 1.5% to treasury
    
    address public treasury;
    uint256 public totalVolume;
    uint256 public totalFeesBurned;
    
    event Listed(uint256 indexed listingId, uint256 indexed playerId, address seller, uint256 price);
    event Delisted(uint256 indexed listingId);
    event Sold(uint256 indexed listingId, uint256 indexed playerId, address buyer, uint256 price);
    event OfferMade(uint256 indexed offerId, uint256 indexed playerId, address buyer, uint256 price, uint256 expiresAt);
    event OfferAccepted(uint256 indexed offerId, uint256 indexed playerId, address seller, address buyer, uint256 price);
    event OfferCancelled(uint256 indexed offerId);
    
    constructor(address _playerNFT, address _ballToken, address _treasury) {
        require(_playerNFT != address(0), "Invalid NFT address");
        require(_ballToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury");
        
        playerNFT = IERC721(_playerNFT);
        ballToken = IERC20(_ballToken);
        treasury = _treasury;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }
    
    /**
     * @dev List a player for sale
     * @param playerId The player NFT ID
     * @param price Price in $BALL
     */
    function listPlayer(uint256 playerId, uint256 price) external nonReentrant {
        require(playerNFT.ownerOf(playerId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");
        require(playerToListing[playerId] == 0, "Already listed");
        require(playerNFT.isApprovedForAll(msg.sender, address(this)) || 
                playerNFT.getApproved(playerId) == address(this), "Not approved");
        
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
        userListings[msg.sender].push(listingCount);
        
        emit Listed(listingCount, playerId, msg.sender, price);
    }
    
    /**
     * @dev Delist a player
     * @param listingId The listing ID
     */
    function delistPlayer(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not active");
        
        listing.active = false;
        playerToListing[listing.playerId] = 0;
        
        emit Delisted(listingId);
    }
    
    /**
     * @dev Buy a listed player
     * @param listingId The listing ID
     */
    function buyPlayer(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Not active");
        require(msg.sender != listing.seller, "Cannot buy own");
        
        uint256 fee = (listing.price * FEE_BPS) / 10000;
        uint256 burnAmount = (listing.price * BURN_BPS) / 10000;
        uint256 treasuryAmount = (listing.price * TREASURY_BPS) / 10000;
        uint256 sellerProceeds = listing.price - fee;
        
        listing.active = false;
        playerToListing[listing.playerId] = 0;
        
        // Transfer fees
        require(ballToken.transferFrom(msg.sender, address(0xdead), burnAmount), "Burn failed");
        require(ballToken.transferFrom(msg.sender, treasury, treasuryAmount), "Treasury fee failed");
        require(ballToken.transferFrom(msg.sender, listing.seller, sellerProceeds), "Payment failed");
        
        // Transfer NFT
        playerNFT.transferFrom(listing.seller, msg.sender, listing.playerId);
        
        totalVolume += listing.price;
        totalFeesBurned += burnAmount;
        
        emit Sold(listingId, listing.playerId, msg.sender, listing.price);
    }
    
    /**
     * @dev Make an offer on a player (not necessarily listed)
     * @param playerId The player NFT ID
     * @param price Offer price in $BALL
     * @param duration Duration in seconds (max 7 days)
     */
    function makeOffer(uint256 playerId, uint256 price, uint256 duration) external {
        require(price > 0, "Price must be > 0");
        require(duration > 0 && duration <= 7 days, "Duration: 1s-7d");
        require(playerNFT.ownerOf(playerId) != msg.sender, "Cannot offer on own");
        
        // Escrow the BALL tokens
        require(ballToken.transferFrom(msg.sender, address(this), price), "Escrow failed");
        
        offerCount++;
        offers[offerCount] = Offer({
            offerId: offerCount,
            playerId: playerId,
            buyer: msg.sender,
            price: price,
            expiresAt: block.timestamp + duration,
            active: true
        });
        
        userOffers[msg.sender].push(offerCount);
        
        emit OfferMade(offerCount, playerId, msg.sender, price, block.timestamp + duration);
    }
    
    /**
     * @dev Cancel an offer and refund escrow
     * @param offerId The offer ID
     */
    function cancelOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.buyer == msg.sender, "Not buyer");
        require(offer.active, "Not active");
        
        offer.active = false;
        
        // Refund escrow
        require(ballToken.transfer(offer.buyer, offer.price), "Refund failed");
        
        emit OfferCancelled(offerId);
    }
    
    /**
     * @dev Accept an offer
     * @param offerId The offer ID
     */
    function acceptOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.active, "Not active");
        require(block.timestamp < offer.expiresAt, "Expired");
        require(playerNFT.ownerOf(offer.playerId) == msg.sender, "Not owner");
        
        offer.active = false;
        
        uint256 fee = (offer.price * FEE_BPS) / 10000;
        uint256 burnAmount = (offer.price * BURN_BPS) / 10000;
        uint256 treasuryAmount = (offer.price * TREASURY_BPS) / 10000;
        uint256 sellerProceeds = offer.price - fee;
        
        // Distribute from escrow
        require(ballToken.transfer(address(0xdead), burnAmount), "Burn failed");
        require(ballToken.transfer(treasury, treasuryAmount), "Treasury fee failed");
        require(ballToken.transfer(msg.sender, sellerProceeds), "Payment failed");
        
        // Transfer NFT
        playerNFT.transferFrom(msg.sender, offer.buyer, offer.playerId);
        
        // Cancel any active listing for this player
        uint256 listingId = playerToListing[offer.playerId];
        if (listingId > 0 && listings[listingId].active) {
            listings[listingId].active = false;
            playerToListing[offer.playerId] = 0;
        }
        
        totalVolume += offer.price;
        totalFeesBurned += burnAmount;
        
        emit OfferAccepted(offerId, offer.playerId, msg.sender, offer.buyer, offer.price);
    }
    
    /**
     * @dev Get active listings count
     */
    function getActiveListingsCount() external view returns (uint256) {
        uint256 count;
        for (uint i = 1; i <= listingCount; i++) {
            if (listings[i].active) count++;
        }
        return count;
    }
    
    /**
     * @dev Get user's active listings
     */
    function getUserActiveListings(address user) external view returns (uint256[] memory) {
        uint256[] memory all = userListings[user];
        uint256 activeCount;
        for (uint i = 0; i < all.length; i++) {
            if (listings[all[i]].active) activeCount++;
        }
        
        uint256[] memory active = new uint256[](activeCount);
        uint256 idx;
        for (uint i = 0; i < all.length; i++) {
            if (listings[all[i]].active) {
                active[idx++] = all[i];
            }
        }
        return active;
    }
}
