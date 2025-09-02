import { Currency, CurrencyAmount, Price } from "@cryptoalgebra/custom-pools-sdk";

export function getPositionAPR(
    amount0: CurrencyAmount<Currency>,
    amount1: CurrencyAmount<Currency>,
    feeAmount0: CurrencyAmount<Currency>,
    feeAmount1: CurrencyAmount<Currency>,
    collectedFees0: CurrencyAmount<Currency>,
    collectedFees1: CurrencyAmount<Currency>,
    token0Price: Price<Currency, Currency>,
    creationTime: number
) {
    const activeDays = (Date.now() - creationTime) / (24 * 60 * 60 * 1000);

    if (activeDays <= 0) return 0;

    try {
        const totalAmountInToken1 = token0Price.quote(amount0).add(amount1);
        const totalFeesInToken1 = token0Price.quote(feeAmount0).add(feeAmount1);
        const totalCollectedFeesInToken1 = token0Price.quote(collectedFees0).add(collectedFees1);

        const totalProfit = totalFeesInToken1.add(totalCollectedFeesInToken1);
        const profitRatio = parseFloat(totalProfit.asFraction.divide(totalAmountInToken1.asFraction).toSignificant(24));
        const apr = profitRatio > 0 ? (profitRatio / activeDays) * 365 * 100 : 0;

        return apr;
    } catch (e) {
        console.error(e);
        return 0;
    }
}
