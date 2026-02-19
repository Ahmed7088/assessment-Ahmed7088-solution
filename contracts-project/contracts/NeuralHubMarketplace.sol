// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NuvyraHubMarketplace
 * @notice On-chain registry + ERC-1155 license minting for AI model ownership.
 *         Creators list models; buyers acquire licenses by paying price in ETH.
 */
contract NuvyraHubMarketplace is ERC1155, Ownable, ReentrancyGuard {
    struct Listing {
        address creator;
        uint256 priceWei;
        uint96 royaltyBps; // creator share of subsequent secondary sales (reserved)
        string slug;
        string metadataURI;
        bool active;
        uint256 totalLicensesSold;
    }

    uint256 public nextTokenId = 1;
    uint256 public platformFeeBps = 250; // 2.5%
    address public feeRecipient;

    mapping(uint256 => Listing) public listings;
    mapping(string => uint256) public slugToTokenId;
    mapping(uint256 => mapping(address => bool)) public hasLicense;

    event ModelListed(
        uint256 indexed tokenId,
        address indexed creator,
        string slug,
        uint256 priceWei,
        string metadataURI
    );
    event LicenseAcquired(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed creator,
        uint256 priceWei,
        uint256 platformFee,
        uint256 creatorProceeds
    );
    event ListingUpdated(uint256 indexed tokenId, uint256 priceWei, bool active);
    event PlatformFeeUpdated(uint256 feeBps, address feeRecipient);

    error EmptySlug();
    error SlugTaken();
    error InvalidPrice();
    error InvalidRoyalty();
    error NotListed();
    error InactiveListing();
    error IncorrectPayment();
    error NotCreator();
    error AlreadyLicensed();
    error TransferFailed();

    constructor(address initialOwner, address initialFeeRecipient)
        ERC1155("https://NuvyraHub.local/api/metadata/{id}.json")
        Ownable(initialOwner)
    {
        feeRecipient = initialFeeRecipient == address(0) ? initialOwner : initialFeeRecipient;
    }

    function listModel(
        string calldata slug,
        string calldata metadataURI,
        uint256 priceWei,
        uint96 royaltyBps
    ) external returns (uint256 tokenId) {
        if (bytes(slug).length == 0) revert EmptySlug();
        if (slugToTokenId[slug] != 0) revert SlugTaken();
        if (priceWei == 0) revert InvalidPrice();
        if (royaltyBps > 2_000) revert InvalidRoyalty(); // max 20%

        tokenId = nextTokenId++;
        listings[tokenId] = Listing({
            creator: msg.sender,
            priceWei: priceWei,
            royaltyBps: royaltyBps,
            slug: slug,
            metadataURI: metadataURI,
            active: true,
            totalLicensesSold: 0
        });
        slugToTokenId[slug] = tokenId;

        emit ModelListed(tokenId, msg.sender, slug, priceWei, metadataURI);
    }

    function acquireLicense(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        if (listing.creator == address(0)) revert NotListed();
        if (!listing.active) revert InactiveListing();
        if (msg.value != listing.priceWei) revert IncorrectPayment();
        if (hasLicense[tokenId][msg.sender]) revert AlreadyLicensed();

        uint256 fee = (msg.value * platformFeeBps) / 10_000;
        uint256 creatorProceeds = msg.value - fee;

        hasLicense[tokenId][msg.sender] = true;
        listing.totalLicensesSold += 1;

        _mint(msg.sender, tokenId, 1, "");

        _pay(feeRecipient, fee);
        _pay(listing.creator, creatorProceeds);

        emit LicenseAcquired(
            tokenId,
            msg.sender,
            listing.creator,
            msg.value,
            fee,
            creatorProceeds
        );
    }

    function updateListing(uint256 tokenId, uint256 priceWei, bool active) external {
        Listing storage listing = listings[tokenId];
        if (listing.creator != msg.sender) revert NotCreator();
        if (priceWei == 0) revert InvalidPrice();
        listing.priceWei = priceWei;
        listing.active = active;
        emit ListingUpdated(tokenId, priceWei, active);
    }

    function setPlatformFee(uint256 feeBps, address recipient) external onlyOwner {
        require(feeBps <= 1_000, "fee too high");
        require(recipient != address(0), "bad recipient");
        platformFeeBps = feeBps;
        feeRecipient = recipient;
        emit PlatformFeeUpdated(feeBps, recipient);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        Listing storage listing = listings[tokenId];
        if (bytes(listing.metadataURI).length > 0) {
            return listing.metadataURI;
        }
        return super.uri(tokenId);
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function getTokenIdBySlug(string calldata slug) external view returns (uint256) {
        return slugToTokenId[slug];
    }

    function _pay(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
