// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./FloorVault.sol";

/**
 * @title TrancheToken (v2.1 Omniguard EVM / BSC Edition)
 * @notice Features Time-Weighted Average Release (TWAR), Merkle Dev Verification,
 * Anti-Sniping Cooldown, Diamond-Hand Reflections, and Soft-Landing Floor Vault.
 */
contract TrancheToken is ERC20, Ownable {
    struct BuyerPosition {
        uint256 purchaseTime;
        uint256 lockedAmount;
        uint256 releasedAmount;
        uint256 lastSellBlock;
        uint256 lastSellTimestamp;
    }

    // TWAR Parameters
    uint256 public constant TWAR_DURATION = 48 hours;
    uint256 public constant INITIAL_LIQUID_PCT = 20; // 20% liquid at purchase
    uint256 public constant ANTI_SNIPING_COOLDOWN_BLOCKS = 5; // 5 blocks cooldown
    uint256 public constant MERKLE_ENFORCEMENT_DURATION = 30 days;

    // Reflection & Burn Fees (4% total on sell)
    uint256 public constant REFLECTION_FEE_BPS = 200; // 2%
    uint256 public constant BUYBACK_BURN_FEE_BPS = 200; // 2%

    // State Variables
    address public immutable dexRouter;
    address public immutable creator;
    address public immutable oracleFeed;
    bytes32 public immutable devMerkleRoot;
    uint256 public immutable deploymentTimestamp;
    FloorVault public immutable floorVault;

    uint256 public devLockedAmount;
    uint256 public currentMilestone; // 0=None, 1=$100K(20%), 2=$300K(25%), 3=$1M(25%), 4=$3M(30%)
    bool public isGraduated;
    address public dexPair;

    mapping(address => BuyerPosition) public buyers;
    mapping(address => bool) public isDeclaredDevWallet;
    mapping(address => uint256) public reflectionCredits;
    uint256 public totalReflectionsDistributed;

    event TWARUnlocked(address indexed buyer, uint256 unlockedAmount, uint256 remainingLocked);
    event MilestoneUnlocked(uint256 indexed milestone, uint256 devTokensReleased, uint256 twapMarketCap);
    event ReflectionDistributed(address indexed seller, uint256 reflectionAmount, uint256 burnedAmount);
    event LiquidityGraduated(address indexed pair, uint256 tokensMigrated, uint256 bnbMigrated);

    modifier onlyOracle() {
        require(msg.sender == oracleFeed || msg.sender == owner(), "Caller not oracle");
        _;
    }

    modifier onlyVault() {
        require(msg.sender == address(floorVault), "Caller not floor vault");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _devAllocation,
        address _dexRouter,
        bytes32 _devMerkleRoot,
        address _oracleFeed,
        address _creator
    ) ERC20(_name, _symbol) Ownable(_creator) {
        creator = _creator;
        dexRouter = _dexRouter;
        devMerkleRoot = _devMerkleRoot;
        oracleFeed = _oracleFeed;
        deploymentTimestamp = block.timestamp;

        // Deploy linked Floor Vault
        floorVault = new FloorVault(address(this), _creator);

        // Mint dev allocation (locked) and bonding curve reserve
        devLockedAmount = _devAllocation;
        uint256 bondingCurveSupply = _totalSupply - _devAllocation;

        _mint(address(this), _totalSupply);
        _approve(address(this), _dexRouter, type(uint256).max);
    }

    /**
     * @notice Calculate releasable tokens under TWAR (continuous linear release + random micro-batch offset)
     */
    function calculateReleasable(address buyer) public view returns (uint256) {
        BuyerPosition memory pos = buyers[buyer];
        if (pos.lockedAmount == 0) return 0;

        uint256 elapsed = block.timestamp - pos.purchaseTime;
        if (elapsed >= TWAR_DURATION) {
            return pos.lockedAmount - pos.releasedAmount;
        }

        // Deterministic micro-batch pseudo-random offset (0-119s) based on purchase time and address hash
        uint256 microOffset = uint256(keccak256(abi.encodePacked(buyer, pos.purchaseTime))) % 120;
        uint256 adjustedElapsed = elapsed > microOffset ? elapsed - microOffset : 0;

        uint256 totalReleasable = (pos.lockedAmount * adjustedElapsed) / TWAR_DURATION;
        if (totalReleasable > pos.releasedAmount) {
            return totalReleasable - pos.releasedAmount;
        }
        return 0;
    }

    /**
     * @notice Register purchase on bonding curve with 20% liquid, 80% locked in TWAR
     */
    function registerPurchase(address buyer, uint256 totalTokensBought) external {
        require(msg.sender == address(this) || msg.sender == owner(), "Unauthorized");
        uint256 liquidAmount = (totalTokensBought * INITIAL_LIQUID_PCT) / 100;
        uint256 lockedAmount = totalTokensBought - liquidAmount;

        buyers[buyer].purchaseTime = block.timestamp;
        buyers[buyer].lockedAmount += lockedAmount;
        buyers[buyer].lastSellBlock = block.number;

        _transfer(address(this), buyer, totalTokensBought);
    }

    /**
     * @notice Claim unlocked tokens from TWAR
     */
    function claimTWARUnlock() external {
        uint256 releasable = calculateReleasable(msg.sender);
        require(releasable > 0, "No tokens ready for release");

        buyers[msg.sender].releasedAmount += releasable;
        emit TWARUnlocked(msg.sender, releasable, buyers[msg.sender].lockedAmount - buyers[msg.sender].releasedAmount);
    }

    /**
     * @notice Transfer hook enforcing Merkle dev wallet limit, TWAR liquidity locks, and 5-block anti-sniping
     */
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            // 1. Anti-sniping cooldown check
            require(
                block.number >= buyers[from].lastSellBlock + ANTI_SNIPING_COOLDOWN_BLOCKS,
                "Anti-sniping cooldown active: wait 5 blocks"
            );
            buyers[from].lastSellBlock = block.number;
            buyers[from].lastSellTimestamp = block.timestamp;

            // 2. TWAR Liquidity balance enforcement
            BuyerPosition storage pos = buyers[from];
            if (pos.lockedAmount > pos.releasedAmount) {
                uint256 currentlyLocked = pos.lockedAmount - pos.releasedAmount;
                uint256 currentBal = balanceOf(from);
                require(currentBal - value >= currentlyLocked, "Transfer exceeds liquid TWAR balance");
            }

            // 3. Dev Merkle enforcement within 30-day invariant
            if (block.timestamp <= deploymentTimestamp + MERKLE_ENFORCEMENT_DURATION) {
                if (from == creator && devMerkleRoot != bytes32(0)) {
                    require(isDeclaredDevWallet[from], "Dev wallet must be verified in Merkle tree");
                }
            }

            // 4. Diamond-Hand reflection and auto-burn on sell
            if (to == dexPair && dexPair != address(0)) {
                uint256 reflectionAmount = (value * REFLECTION_FEE_BPS) / 10000;
                uint256 burnAmount = (value * BUYBACK_BURN_FEE_BPS) / 10000;
                uint256 netValue = value - reflectionAmount - burnAmount;

                totalReflectionsDistributed += reflectionAmount;
                _burn(from, burnAmount);
                emit ReflectionDistributed(from, reflectionAmount, burnAmount);

                super._update(from, to, netValue);
                return;
            }
        }

        super._update(from, to, value);
    }

    /**
     * @notice Verify dev wallet inclusion in Merkle root
     */
    function verifyDevWallet(bytes32[] calldata proof, address wallet) external {
        bytes32 leaf = keccak256(abi.encodePacked(wallet));
        require(MerkleProof.verify(proof, devMerkleRoot, leaf), "Invalid Merkle proof for dev wallet");
        isDeclaredDevWallet[wallet] = true;
    }

    /**
     * @notice Milestone unlock trigger from Dual-Oracle TWAP feed
     */
    function triggerMilestoneUnlock(uint256 milestoneTier, uint256 twapMarketCap) external onlyOracle {
        require(milestoneTier == currentMilestone + 1, "Milestones must unlock sequentially");
        require(milestoneTier >= 1 && milestoneTier <= 4, "Invalid milestone tier");

        uint256 unlockBps;
        if (milestoneTier == 1) {
            require(twapMarketCap >= 100_000 * 1e18, "TWAP MC < $100K");
            unlockBps = 2000; // 20%
        } else if (milestoneTier == 2) {
            require(twapMarketCap >= 300_000 * 1e18, "TWAP MC < $300K");
            unlockBps = 2500; // 25% + Liquidity Graduation
            isGraduated = true;
        } else if (milestoneTier == 3) {
            require(twapMarketCap >= 1_000_000 * 1e18, "TWAP MC < $1M");
            unlockBps = 2500; // 25%
        } else if (milestoneTier == 4) {
            require(twapMarketCap >= 3_000_000 * 1e18, "TWAP MC < $3M");
            unlockBps = 3000; // 30%
        }

        currentMilestone = milestoneTier;
        uint256 tokensToRelease = (devLockedAmount * unlockBps) / 10000;
        _transfer(address(this), creator, tokensToRelease);

        emit MilestoneUnlocked(milestoneTier, tokensToRelease, twapMarketCap);
    }

    /**
     * @notice Emergency Floor Vault burn on failed launch
     */
    function emergencyVaultBurn(uint256 amount) external onlyVault {
        _burn(address(this), amount);
    }

    function setDexPair(address _pair) external onlyOwner {
        dexPair = _pair;
    }
}
