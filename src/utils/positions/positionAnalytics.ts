import { TokenValue } from '@/hooks/positions/usePositionAnalytics';
import {
  CurrencyAmount,
  type Currency,
  Price,
  TickMath,
  Q96,
  AnyToken,
} from '@cryptoalgebra/integral-sdk';
import JSBI from 'jsbi';
import { parseUnits } from 'viem';

const DAYS_PER_YEAR = 365;
const SECONDS_PER_DAY = 86400;

/**
 * Safely converts a value to a finite number
 */
function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Calculates percentage, returns 0 if total is 0 to avoid division by zero
 */
function toPercent(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * 100;
}

/**
 * Converts currency amount to USD value
 */
function amountToUsd(amount: CurrencyAmount<Currency>, priceUsd: number): number {
  return Number(amount.toSignificant(24)) * priceUsd;
}

/**
 * Adds two TokenValue objects together
 */
function addTokenValues(a: TokenValue, b: TokenValue): TokenValue {
  return {
    usdValue: a.usdValue + b.usdValue,
    value0: a.value0 + b.value0,
    value1: a.value1 + b.value1,
  };
}

/**
 * Subtracts second TokenValue from first
 */
function subtractTokenValues(a: TokenValue, b: TokenValue): TokenValue {
  return {
    usdValue: a.usdValue - b.usdValue,
    value0: a.value0 - b.value0,
    value1: a.value1 - b.value1,
  };
}

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Converts amounts in both tokens to a unified TokenValue with USD equivalent
 */
export function calculateTokenValues(
  amount0Raw: string,
  amount1Raw: string,
  price0In1: Price<Currency, Currency>,
  price1In0: Price<Currency, Currency>,
  price0Usd: number,
  price1Usd: number,
): TokenValue {
  const amount0 = CurrencyAmount.fromRawAmount(price0In1.baseCurrency, amount0Raw);
  const amount1 = CurrencyAmount.fromRawAmount(price1In0.baseCurrency, amount1Raw);

  // Convert both amounts to each token's terms
  const valueInToken0 = price1In0.quote(amount1).add(amount0).toSignificant(24);
  const valueInToken1 = price0In1.quote(amount0).add(amount1).toSignificant(24);

  // Calculate USD value
  const usdValue = amountToUsd(amount0, price0Usd) + amountToUsd(amount1, price1Usd);

  return {
    usdValue: toNumber(usdValue),
    value0: toNumber(valueInToken0),
    value1: toNumber(valueInToken1),
  };
}

/**
 * Calculates Profit and Loss (PnL)
 *
 * PnL = (Current Position Value + Collected Fees + Withdrawn + Pending Fees) - Initial Investment
 */
export function calculatePnl(
  currentAmount: TokenValue,
  collectedFees: TokenValue,
  withdrawnAmount: TokenValue,
  pendingFees: TokenValue,
  initialAmount: TokenValue,
): TokenValue {
  const totalValue = [currentAmount, collectedFees, withdrawnAmount, pendingFees].reduce(
    addTokenValues,
    { usdValue: 0, value0: 0, value1: 0 },
  );

  return subtractTokenValues(totalValue, initialAmount);
}

/**
 * Calculates Return on Investment (ROI) as a percentage
 *
 * ROI = (PnL / Initial Investment) * 100
 */
export function calculateROI(pnl: TokenValue, initialAmount: TokenValue): TokenValue {
  return {
    usdValue: toPercent(pnl.usdValue, initialAmount.usdValue),
    value0: toPercent(pnl.value0, initialAmount.value0),
    value1: toPercent(pnl.value1, initialAmount.value1),
  };
}

/**
 * Calculates Realized APR based on earned fees
 *
 * Realized APR = (Total Fees Earned / Initial Investment) * (365 / position_age)
 *
 * This gives a more accurate picture of actual returns from fees,
 * separate from price changes / IL.
 */
export function calculateRealizedAPR(
  collectedFees: TokenValue,
  pendingFees: TokenValue,
  initialAmount: TokenValue,
  positionAgeInDays: number,
): TokenValue {
  if (positionAgeInDays === 0 || initialAmount.usdValue === 0) {
    return { usdValue: 0, value0: 0, value1: 0 };
  }

  const totalFees = addTokenValues(collectedFees, pendingFees);
  const annualizationFactor = DAYS_PER_YEAR / positionAgeInDays;

  // Realized APR = (fees / initial) * 100 * (365 / days)
  return {
    usdValue: toPercent(totalFees.usdValue, initialAmount.usdValue) * annualizationFactor,
    value0: toPercent(totalFees.value0, initialAmount.value0) * annualizationFactor,
    value1: toPercent(totalFees.value1, initialAmount.value1) * annualizationFactor,
  };
}

/**
 * Calculates Impermanent Loss (IL)
 *
 * IL compares the value if tokens were simply held vs providing liquidity.
 *
 * Hold Value (in token1 terms) = initial_amount0 * current_price + initial_amount1
 * Current Value (in token1 terms) = current_amount0 * current_price + current_amount1
 * IL = Current Value - Hold Value
 *
 * Negative IL means loss compared to holding, positive means gain.
 */
export function calculateIL(
  initialAmount0: CurrencyAmount<Currency>,
  initialAmount1: CurrencyAmount<Currency>,
  currentAmount0: CurrencyAmount<Currency>,
  currentAmount1: CurrencyAmount<Currency>,
  withdrawnAmount0: CurrencyAmount<Currency>,
  withdrawnAmount1: CurrencyAmount<Currency>,
  price0In1: Price<Currency, Currency>,
  price0Usd: number,
  price1Usd: number,
): TokenValue {
  const totalAmount0 = currentAmount0.add(withdrawnAmount0);
  const totalAmount1 = currentAmount1.add(withdrawnAmount1);

  // Calculate in Token1 terms (quote Token0 in Token1)
  const holdValueInToken1 = price0In1.quote(initialAmount0).add(initialAmount1);
  const currentValueInToken1 = price0In1.quote(totalAmount0).add(totalAmount1);
  const ilInToken1 = currentValueInToken1.subtract(holdValueInToken1);

  // Calculate in Token0 terms
  const price1In0 = price0In1.invert();
  const holdValueInToken0 = price1In0.quote(initialAmount1).add(initialAmount0);
  const currentValueInToken0 = price1In0.quote(totalAmount1).add(totalAmount0);
  const ilInToken0 = currentValueInToken0.subtract(holdValueInToken0);

  // Calculate USD values
  const holdValueUsd =
    amountToUsd(initialAmount0, price0Usd) + amountToUsd(initialAmount1, price1Usd);
  const currentValueUsd =
    amountToUsd(totalAmount0, price0Usd) + amountToUsd(totalAmount1, price1Usd);
  const ilUsd = currentValueUsd - holdValueUsd;

  return {
    usdValue: ilUsd,
    value0: toNumber(ilInToken0.toSignificant(24)),
    value1: toNumber(ilInToken1.toSignificant(24)),
  };
}

/**
 * Calculates position age in days from creation timestamp
 */
export function calculatePositionAge(
  creationTimestamp: string | number | null | undefined,
): number {
  if (!creationTimestamp) return 0;

  const creationTime = Number(creationTimestamp);
  const now = Math.floor(Date.now() / 1000);
  const ageInSeconds = now - creationTime;

  return Math.max(0, ageInSeconds / SECONDS_PER_DAY);
}

export function calculateInitialAmountsFromMint(
  token0: AnyToken,
  token1: AnyToken,
  mintTx: {
    amount: string;
    amount0: string;
    amount1: string;
    timestamp: string;
    tickLower: string;
    tickUpper: string;
    amountUSD?: string | null;
  },
) {
  const sqrtPriceX96Lower = TickMath.getSqrtRatioAtTick(Number(mintTx.tickLower));

  const liquidity = JSBI.BigInt(mintTx.amount.toString());
  const amount0 = CurrencyAmount.fromRawAmount(
    token0,
    parseUnits(mintTx.amount0, token0.decimals).toString(),
  );
  const amount1 = CurrencyAmount.fromRawAmount(
    token1,
    parseUnits(mintTx.amount1, token1.decimals).toString(),
  );

  const term = JSBI.divide(JSBI.multiply(amount1.quotient, Q96), liquidity);
  const sqrtPriceX96 = JSBI.add(sqrtPriceX96Lower, term);

  const price0In1 = new Price(
    token0,
    token1,
    JSBI.BigInt(2 ** 192),
    JSBI.multiply(sqrtPriceX96, sqrtPriceX96),
  );
  const price1In0 = price0In1.invert();

  const valueInToken0 = price1In0.quote(amount1).add(amount0).toSignificant(24);
  const valueInToken1 = price0In1.quote(amount0).add(amount1).toSignificant(24);

  return {
    usdValue: toNumber(mintTx.amountUSD),
    value0: toNumber(valueInToken0),
    value1: toNumber(valueInToken1),
  };
}
