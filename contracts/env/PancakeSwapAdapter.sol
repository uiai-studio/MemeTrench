// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IPancakeRouter02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
}

/**
 * @title PancakeSwapAdapter (BSC v2.1 Omniguard Liquidity Migration)
 * @notice Migrates graduating BSC tokens to PancakeSwap v2 and burns LP tokens to 0x000...dead
 */
contract PancakeSwapAdapter {
    // BSC Mainnet PancakeSwap v2 Router
    address public constant PANCAKE_ROUTER_V2 = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    event LiquidityGraduatedToPancake(
        address indexed token,
        address indexed pair,
        uint256 tokenAmount,
        uint256 bnbAmount,
        uint256 lpTokensBurned
    );

    function graduateAndBurnLP(
        address token,
        uint256 tokenAmount
    ) external payable returns (address pairAddress, uint256 lpBurned) {
        require(msg.value > 0, "No BNB provided for LP");
        require(tokenAmount > 0, "No token amount provided");

        IERC20(token).approve(PANCAKE_ROUTER_V2, tokenAmount);

        // Add liquidity with LP recipient set to DEAD_ADDRESS for permanent lock & burn
        (, , uint256 liquidity) = IPancakeRouter02(PANCAKE_ROUTER_V2).addLiquidityETH{value: msg.value}(
            token,
            tokenAmount,
            (tokenAmount * 95) / 100, // 5% slippage tolerance
            (msg.value * 95) / 100,
            DEAD_ADDRESS,             // LP tokens burned immediately
            block.timestamp + 600
        );

        address factory = IPancakeRouter02(PANCAKE_ROUTER_V2).factory();
        address wbnb = IPancakeRouter02(PANCAKE_ROUTER_V2).WETH();
        pairAddress = IPancakeFactory(factory).getPair(token, wbnb);

        emit LiquidityGraduatedToPancake(token, pairAddress, tokenAmount, msg.value, liquidity);
        return (pairAddress, liquidity);
    }
}
