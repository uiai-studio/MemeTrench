// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TrancheToken.sol";

/**
 * @title TrancheFactory (v2.1 Omniguard Multi-Chain Edition)
 * @notice Factory deployed across BSC, Base, and Ethereum.
 * @dev Supports PancakeSwap v2 on BSC (0x10ED43C718714eb63d5aA57B78B54704E256024E)
 * and Uniswap v2/v3 on Base/Ethereum.
 */
contract TrancheFactory is Ownable {
    address public immutable dexRouter;
    address public treasuryDAO;
    uint256 public constant CREATION_FEE = 0.05 ether; // 0.05 BNB on BSC / 0.015 ETH on Base
    uint256 public constant MAX_DEV_ALLOCATION_BPS = 150; // 1.5% max (150 bps)

    struct LaunchConfig {
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 devAllocation;
        bytes32 devMerkleRoot; // Merkle root of max 6 declared dev wallets
        address oracleFeed;
    }

    event TokenLaunched(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        bytes32 devMerkleRoot,
        uint256 timestamp
    );

    constructor(address _dexRouter, address _treasuryDAO) Ownable(msg.sender) {
        dexRouter = _dexRouter;
        treasuryDAO = _treasuryDAO;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 devAllocation,
        bytes32 devMerkleRoot,
        address oracleFeed
    ) external payable returns (address) {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");
        require(devAllocation <= (totalSupply * MAX_DEV_ALLOCATION_BPS) / 10000, "Dev allocation exceeds 1.5% hardcap");

        // Split creation fee: 50% to Soft-Landing Floor Vault, 50% to Treasury DAO
        uint256 floorVaultShare = msg.value / 2;
        uint256 treasuryShare = msg.value - floorVaultShare;
        payable(treasuryDAO).transfer(treasuryShare);

        TrancheToken token = new TrancheToken(
            name,
            symbol,
            totalSupply,
            devAllocation,
            dexRouter,
            devMerkleRoot,
            oracleFeed,
            msg.sender
        );

        // Send floor vault share to token's floor vault
        payable(token.floorVault()).transfer(floorVaultShare);

        emit TokenLaunched(
            address(token),
            msg.sender,
            name,
            symbol,
            totalSupply,
            devMerkleRoot,
            block.timestamp
        );

        return address(token);
    }

    function setTreasuryDAO(address _newDAO) external onlyOwner {
        treasuryDAO = _newDAO;
    }
}
