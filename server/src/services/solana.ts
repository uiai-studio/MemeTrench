import { Token, UserPosition, Trade, MilestonesConfig, CandleData } from '../../../src/types.js';
import { DEFAULT_TOKENS } from '../../../src/mockData.js';

export const SOL_PRICE_USD = 178.50; // Dynamic Pyth / Switchboard reference
export const BNB_PRICE_USD = 590.00;
export const GRADUATION_TARGET_SOL = 85.0; // ~ $300,000 USD graduation target
export const DEV_GOOD_FAITH_BOND_SOL = 2.0;
export const CREATION_FEE_SOL = 0.5;

// Mathematical AMM Formulas
export function calculateBuyTokensOut(
  amountInNative: number,
  virtualNativeReserve: number,
  virtualTokenReserve: number
): { tokensOut: number; newNativeReserve: number; newTokenReserve: number; priceNative: number } {
  // Constant product k = x * y
  const k = virtualNativeReserve * virtualTokenReserve;
  const newNativeReserve = virtualNativeReserve + amountInNative;
  const newTokenReserve = k / newNativeReserve;
  const tokensOut = virtualTokenReserve - newTokenReserve;
  const priceNative = amountInNative / tokensOut;
  return { tokensOut, newNativeReserve, newTokenReserve, priceNative };
}

export function calculateSellSolOut(
  amountInTokens: number,
  virtualNativeReserve: number,
  virtualTokenReserve: number
): { nativeOut: number; newNativeReserve: number; newTokenReserve: number; priceNative: number } {
  const k = virtualNativeReserve * virtualTokenReserve;
  const newTokenReserve = virtualTokenReserve + amountInTokens;
  const newNativeReserve = k / newTokenReserve;
  const nativeOut = virtualNativeReserve - newNativeReserve;
  const priceNative = nativeOut / amountInTokens;
  return { nativeOut, newNativeReserve, newTokenReserve, priceNative };
}

export const INITIAL_TOKENS: Token[] = DEFAULT_TOKENS;
