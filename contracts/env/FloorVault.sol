// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITrancheToken {
    function emergencyVaultBurn(uint256 amount) external;
    function devLockedAmount() external view returns (uint256);
}

/**
 * @title FloorVault (v2.1 Omniguard Soft-Landing Floor Insurance)
 * @notice Enforces 72-hour downside floor insurance with $80k-$100k buffer zone,
 * live community DAO extension vote, and pro-rata investor refund.
 */
contract FloorVault is Ownable {
    address public immutable tokenAddress;
    address public immutable creator;
    address public daoTreasury;

    uint256 public constant LOCK_DURATION = 72 hours;
    uint256 public constant EXTENSION_DURATION = 24 hours;
    uint256 public constant DANGER_ZONE_MC_MIN = 80_000 * 1e18; // $80,000 in wei
    uint256 public constant SUCCESS_MC_MIN = 100_000 * 1e18;     // $100,000 in wei

    uint256 public launchTimestamp;
    uint256 public expiryTimestamp;
    bool public isExtended;
    bool public isSettled;

    // DAO Community Extension Voting in Danger Zone
    uint256 public extensionYesVotes;
    uint256 public extensionNoVotes;
    mapping(address => bool) public hasVotedExtension;

    // Buyer contributions for pro-rata refunds
    mapping(address => uint256) public buyerNativeDeposited;
    address[] public buyerList;
    uint256 public totalNativeDeposited;

    event ExtensionTriggered(uint256 newExpiryTimestamp, string reason);
    event SettlementExecuted(string outcome, uint256 totalRefunded, uint256 totalDaoConversion);
    event RefundClaimed(address indexed buyer, uint256 refundAmount);
    event VoteCast(address indexed voter, bool isYes, uint256 weight);

    constructor(address _tokenAddress, address _creator) Ownable(_creator) {
        tokenAddress = _tokenAddress;
        creator = _creator;
        launchTimestamp = block.timestamp;
        expiryTimestamp = block.timestamp + LOCK_DURATION;
    }

    receive() external payable {
        totalNativeDeposited += msg.value;
    }

    function recordBuyerDeposit(address buyer, uint256 amount) external {
        require(msg.sender == tokenAddress || msg.sender == owner(), "Unauthorized");
        if (buyerNativeDeposited[buyer] == 0) {
            buyerList.push(buyer);
        }
        buyerNativeDeposited[buyer] += amount;
    }

    /**
     * @notice Cast community vote during $80K–$100K Danger Zone buffer
     */
    function voteExtension(bool support) external {
        require(block.timestamp >= expiryTimestamp - 6 hours, "Voting opens 6h before expiry");
        require(!hasVotedExtension[msg.sender], "Already voted");
        require(buyerNativeDeposited[msg.sender] > 0, "Only buyers can vote");

        hasVotedExtension[msg.sender] = true;
        uint256 weight = buyerNativeDeposited[msg.sender];

        if (support) {
            extensionYesVotes += weight;
        } else {
            extensionNoVotes += weight;
        }

        emit VoteCast(msg.sender, support, weight);
    }

    /**
     * @notice Execute Soft-Landing resolution based on 72h TWAP Market Cap
     */
    function executeResolution(uint256 twapMarketCap) external {
        require(!isSettled, "Vault already settled");
        require(block.timestamp >= expiryTimestamp, "72h timer active");

        // Scenario A: Market Cap >= $100K -> Project Growth Unlocked
        if (twapMarketCap >= SUCCESS_MC_MIN) {
            isSettled = true;
            uint256 balance = address(this).balance;
            payable(creator).transfer(balance);
            emit SettlementExecuted("SUCCESS_PROJECT_GROWTH", 0, balance);
            return;
        }

        // Scenario B: Danger Zone ($80K <= MC < $100K) -> Auto 24h extension + DAO check
        if (twapMarketCap >= DANGER_ZONE_MC_MIN && !isExtended) {
            if (extensionYesVotes >= extensionNoVotes) {
                isExtended = true;
                expiryTimestamp += EXTENSION_DURATION;
                emit ExtensionTriggered(expiryTimestamp, "DANGER_ZONE_DAO_APPROVED_EXTENSION");
                return;
            }
        }

        // Scenario C: MC < $80K (or failed extension) -> 50% Refund + 50% DAO Treasury + Dev Burn
        isSettled = true;
        uint256 totalVault = address(this).balance;
        uint256 refundPool = totalVault / 2;
        uint256 daoShare = totalVault - refundPool;

        // Burn all locked dev tokens on-chain
        uint256 devTokens = ITrancheToken(tokenAddress).devLockedAmount();
        if (devTokens > 0) {
            ITrancheToken(tokenAddress).emergencyVaultBurn(devTokens);
        }

        // Transfer 50% to Treasury DAO for relaunch funding
        if (daoTreasury != address(0) && daoShare > 0) {
            payable(daoTreasury).transfer(daoShare);
        }

        emit SettlementExecuted("SOFT_LANDING_50PCT_REFUND", refundPool, daoShare);
    }

    /**
     * @notice Individual pro-rata refund claim
     */
    function claimRefund() external {
        require(isSettled, "Settlement not reached");
        uint256 deposited = buyerNativeDeposited[msg.sender];
        require(deposited > 0, "No deposit to refund");

        buyerNativeDeposited[msg.sender] = 0;
        // 50% pro-rata refund
        uint256 refundAmount = deposited / 2;
        payable(msg.sender).transfer(refundAmount);

        emit RefundClaimed(msg.sender, refundAmount);
    }

    function setDaoTreasury(address _dao) external onlyOwner {
        daoTreasury = _dao;
    }
}
