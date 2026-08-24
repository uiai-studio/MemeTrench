// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IUniswapV2Router02 {
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

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
}

/**
 * @title UniswapAdapter (Base & Ethereum v2.1 Omniguard Liquidity Migration)
 * @notice Migrates graduating tokens on Base (Aerodrome / Uniswap) and Ethereum to Uniswap pools,
 * immediately and irreversibly burning LP tokens to 0x000...dead.
 */
contract UniswapAdapter {
    address public immutable dexRouter;
    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    event LiquidityGraduatedToUniswap(
        address indexed token,
        address indexed pair,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 lpTokensBurned
    );

    constructor(address _dexRouter) {
        dexRouter = _dexRouter;
    }

    function graduateAndBurnLP(
        address token,
        uint256 tokenAmount
    ) external payable returns (address pairAddress, uint256 lpBurned) {
        require(msg.value > 0, "No ETH provided for LP");
        require(tokenAmount > 0, "No token amount provided");

        IERC20(token).approve(dexRouter, tokenAmount);

        // Add liquidity with LP recipient set to DEAD_ADDRESS for permanent lock & burn
        (, , uint256 liquidity) = IUniswapV2Router02(dexRouter).addLiquidityETH{value: msg.value}(
            token,
            tokenAmount,
            (tokenAmount * 95) / 100, // 5% slippage tolerance
            (msg.value * 95) / 100,
            DEAD_ADDRESS,             // LP tokens burned immediately
            block.timestamp + 600
        );

        address factory = IUniswapV2Router02(dexRouter).factory();
        address weth = IUniswapV2Router02(dexRouter).WETH();
        pairAddress = IUniswapV2Factory(factory).getPair(token, weth);

        emit LiquidityGraduatedToUniswap(token, pairAddress, tokenAmount, msg.value, liquidity);
        return (pairAddress, liquidity);
    }
}
