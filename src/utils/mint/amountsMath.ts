import JSBI from "jsbi";
import { TickMath } from "@cryptoalgebra/integral-sdk";

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

export class AmountsMath {
    /**
     * Computes the amount of token0 for a given amount of liquidity and a price range.
     * @param sqrtRatioAX96 A sqrt price representing the first tick boundary.
     * @param sqrtRatioBX96 A sqrt price representing the second tick boundary.
     * @param liquidity The liquidity being valued.
     * @returns The amount of token0.
     */
    public static getAmount0ForLiquidity(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, liquidity: JSBI): JSBI {
        // Ensure sqrtRatioAX96 <= sqrtRatioBX96
        if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
            // eslint-disable-next-line no-param-reassign
            [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
        }

        // Calculate numerator: (liquidity << RESOLUTION) * (sqrtRatioBX96 - sqrtRatioAX96)
        const numerator = JSBI.multiply(
            JSBI.leftShift(liquidity, JSBI.BigInt(96)), // liquidity << 96
            JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96),
        );

        // Calculate denominator: sqrtRatioBX96 * sqrtRatioAX96
        const denominator = JSBI.multiply(sqrtRatioBX96, sqrtRatioAX96);

        // Return amount0 = numerator / denominator
        return JSBI.divide(numerator, denominator);
    }

    public static getAmount1ForLiquidity(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, liquidity: JSBI): JSBI {
        // Ensure sqrtRatioAX96 <= sqrtRatioBX96
        if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
            // eslint-disable-next-line no-param-reassign
            [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
        }

        // Calculate amount1 = (liquidity * (sqrtRatioBX96 - sqrtRatioAX96)) / Q96
        const numerator = JSBI.multiply(liquidity, JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96));
        return JSBI.divide(numerator, Q96);
    }

    public static getAmountsForLiquidity(
        sqrtRatioX96: JSBI,
        sqrtRatioAX96: JSBI,
        sqrtRatioBX96: JSBI,
        liquidity: JSBI,
    ): { amount0: JSBI; amount1: JSBI } {
        // Ensure sqrtRatioAX96 <= sqrtRatioBX96
        if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
            // eslint-disable-next-line no-param-reassign
            [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
        }

        let amount0: JSBI = JSBI.BigInt(0);
        let amount1: JSBI = JSBI.BigInt(0);

        if (JSBI.lessThanOrEqual(sqrtRatioX96, sqrtRatioAX96)) {
            // Current price is below the range: only token0 is needed
            amount0 = this.getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
        } else if (JSBI.lessThan(sqrtRatioX96, sqrtRatioBX96)) {
            // Current price is within the range: both token0 and token1 are needed
            amount0 = this.getAmount0ForLiquidity(sqrtRatioX96, sqrtRatioBX96, liquidity);
            amount1 = this.getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioX96, liquidity);
        } else {
            // Current price is above the range: only token1 is needed
            amount1 = this.getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity);
        }

        return { amount0, amount1 };
    }

    /**
     * Returns the amounts needed to add maximum liquidity, starting with one assets.
     * @param amountA The amount of the first starting token (either token0 or token1).
     * @param zeroForOne Whether the swap is from token0 to token1.
     * @param sqrtPriceRatioX96 The expected price after the swap (sqrt ratio).
     * @param sqrtRatioAX96 The lower sqrt ratio of the range.
     * @param sqrtRatioBX96 The upper sqrt ratio of the range.
     * @param fee Pool fee (30 for 0.3%)
     * @returns An object containing the amounts to mint and the amount to swap.
     */
    public static getAmountsForAmount0(
        amountA: JSBI,
        zeroForOne: boolean,
        sqrtPriceRatioX96: JSBI,
        sqrtRatioAX96: JSBI,
        sqrtRatioBX96: JSBI,
        fee: number, // 3000 for 0.3%
    ): { amount0: JSBI; amount1: JSBI } {
        // Constants
        const ONE_E18 = JSBI.BigInt("1000000000000000000"); // 1e18
        const ONE_E12 = JSBI.BigInt("1000000000000"); // 1e12

        // fee в базовых пунктах 0.3% = 3000
        const FEE_DENOMINATOR = JSBI.BigInt(1_000_000);
        const invFee = JSBI.subtract(FEE_DENOMINATOR, JSBI.BigInt(fee));

        // Get amounts for liquidity at the range ratio
        const { amount0: rangeRatio0, amount1: rangeRatio1 } = this.getAmountsForLiquidity(
            sqrtPriceRatioX96,
            sqrtRatioAX96,
            sqrtRatioBX96,
            ONE_E18,
        );

        // Get amounts for liquidity at the price ratio (full range)
        const { amount0: priceRatio0, amount1: priceRatio1 } = this.getAmountsForLiquidity(
            sqrtPriceRatioX96,
            TickMath.MIN_SQRT_RATIO,
            TickMath.MAX_SQRT_RATIO,
            ONE_E18,
        );

        let amountToSwap: JSBI;

        if (zeroForOne) {
            // Calculate amount0 to swap
            const numerator = JSBI.multiply(JSBI.divide(JSBI.multiply(amountA, rangeRatio1), rangeRatio0), ONE_E18);

            const denominator = JSBI.add(
                JSBI.divide(JSBI.multiply(JSBI.multiply(ONE_E12, invFee), priceRatio1), priceRatio0),
                JSBI.divide(JSBI.multiply(ONE_E18, rangeRatio1), rangeRatio0),
            );

            amountToSwap = JSBI.divide(numerator, denominator);
        } else {
            // Calculate amount1 to swap
            const numerator = JSBI.multiply(JSBI.divide(JSBI.multiply(amountA, rangeRatio0), rangeRatio1), ONE_E18);

            const denominator = JSBI.add(
                JSBI.divide(JSBI.multiply(JSBI.multiply(ONE_E12, invFee), priceRatio0), priceRatio1),
                JSBI.divide(JSBI.multiply(ONE_E18, rangeRatio0), rangeRatio1),
            );

            amountToSwap = JSBI.divide(numerator, denominator);
        }

        let amountToMint0: JSBI;
        let amountToMint1: JSBI;

        if (zeroForOne) {
            const numerator = JSBI.multiply(JSBI.multiply(amountToSwap, priceRatio1), invFee);
            const denominator = JSBI.multiply(priceRatio0, FEE_DENOMINATOR);

            amountToMint0 = JSBI.subtract(amountA, amountToSwap);
            amountToMint1 = JSBI.divide(numerator, denominator);
        } else {
            const numerator = JSBI.multiply(JSBI.multiply(amountToSwap, priceRatio0), invFee);
            const denominator = JSBI.multiply(priceRatio1, FEE_DENOMINATOR);

            amountToMint0 = JSBI.divide(numerator, denominator);
            amountToMint1 = JSBI.subtract(amountA, amountToSwap);
        }

        return {
            amount0: amountToMint0,
            amount1: amountToMint1,
        };
    }
}
