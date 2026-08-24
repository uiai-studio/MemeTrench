// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

interface IPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint256 publishTime;
    }
    function getPriceUnsafe(bytes32 id) external view returns (Price memory price);
    function getPriceNoOlderThan(bytes32 id, uint256 age) external view returns (Price memory price);
}

/**
 * @title DualOracleConsumer (v2.1 Omniguard EVM Dual-Oracle Invariant Enforcer)
 * @notice Cross-validates Primary (Chainlink) and Secondary (Pyth / RedStone) price feeds.
 * @dev Enforces 2.0% max divergence threshold and halts milestone unlocks if circuit breaker trips.
 */
contract DualOracleConsumer is Ownable {
    AggregatorV3Interface public immutable chainlinkFeed;
    IPyth public immutable pythContract;
    bytes32 public immutable pythPriceFeedId;

    uint256 public constant MAX_DIVERGENCE_BPS = 200; // 2.00% (200 bps)
    uint256 public constant MAX_PRICE_STALENESS = 300; // 5 minutes max staleness

    bool public circuitBreakerTriggered;
    uint256 public lastPrimaryPriceUsd;
    uint256 public lastSecondaryPriceUsd;
    uint256 public lastDivergenceBps;
    uint256 public lastUpdateTimestamp;

    event OraclePriceUpdated(
        uint256 primaryPriceUsd,
        uint256 secondaryPriceUsd,
        uint256 divergenceBps,
        bool circuitBreakerActive,
        uint256 timestamp
    );
    event CircuitBreakerTripped(uint256 divergenceBps, string reason);
    event CircuitBreakerReset(address indexed admin);

    constructor(
        address _chainlinkFeed,
        address _pythContract,
        bytes32 _pythPriceFeedId
    ) Ownable(msg.sender) {
        chainlinkFeed = AggregatorV3Interface(_chainlinkFeed);
        pythContract = IPyth(_pythContract);
        pythPriceFeedId = _pythPriceFeedId;
    }

    /**
     * @notice Fetch both oracles, compute divergence, and evaluate circuit breaker
     * @return primaryPrice 18 decimals USD price from Chainlink
     * @return secondaryPrice 18 decimals USD price from Pyth
     * @return divergenceBps Difference in basis points (100 = 1%)
     * @return isHealthy True if within 2.0% threshold and feeds are fresh
     */
    function getValidatedPrices() public returns (
        uint256 primaryPrice,
        uint256 secondaryPrice,
        uint256 divergenceBps,
        bool isHealthy
    ) {
        // 1. Fetch Chainlink Primary
        (, int256 clAnswer, , uint256 clUpdatedAt, ) = chainlinkFeed.latestRoundData();
        require(clAnswer > 0, "Invalid Chainlink price");
        require(block.timestamp - clUpdatedAt <= MAX_PRICE_STALENESS, "Chainlink price stale");
        
        uint8 clDecimals = chainlinkFeed.decimals();
        primaryPrice = uint256(clAnswer) * (10 ** (18 - clDecimals));

        // 2. Fetch Pyth Secondary
        IPyth.Price memory pythPrice = pythContract.getPriceNoOlderThan(pythPriceFeedId, MAX_PRICE_STALENESS);
        require(pythPrice.price > 0, "Invalid Pyth price");
        
        if (pythPrice.expo < 0) {
            uint32 absExpo = uint32(-pythPrice.expo);
            secondaryPrice = (uint256(uint64(pythPrice.price)) * 1e18) / (10 ** absExpo);
        } else {
            secondaryPrice = uint256(uint64(pythPrice.price)) * 1e18 * (10 ** uint32(pythPrice.expo));
        }

        // 3. Compute Absolute Divergence in Basis Points
        uint256 diff = primaryPrice > secondaryPrice 
            ? primaryPrice - secondaryPrice 
            : secondaryPrice - primaryPrice;
        
        divergenceBps = (diff * 10000) / primaryPrice;

        lastPrimaryPriceUsd = primaryPrice;
        lastSecondaryPriceUsd = secondaryPrice;
        lastDivergenceBps = divergenceBps;
        lastUpdateTimestamp = block.timestamp;

        if (divergenceBps > MAX_DIVERGENCE_BPS) {
            circuitBreakerTriggered = true;
            isHealthy = false;
            emit CircuitBreakerTripped(divergenceBps, "Oracle divergence exceeds 2.0% safety limit");
        } else {
            circuitBreakerTriggered = false;
            isHealthy = true;
        }

        emit OraclePriceUpdated(primaryPrice, secondaryPrice, divergenceBps, circuitBreakerTriggered, block.timestamp);
        return (primaryPrice, secondaryPrice, divergenceBps, isHealthy);
    }

    function resetCircuitBreaker() external onlyOwner {
        circuitBreakerTriggered = false;
        emit CircuitBreakerReset(msg.sender);
    }
}
