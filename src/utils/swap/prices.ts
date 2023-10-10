import { Currency, CurrencyAmount, Fraction, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk"

const ONE_HUNDRED_PERCENT = new Percent('10000', '10000')

const BIPS_BASE = '10000'

const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent('100', BIPS_BASE) // 1%
const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent('300', BIPS_BASE) // 3%
const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent('500', BIPS_BASE) // 5%
const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent('1500', BIPS_BASE) // 15%

// computes realized lp fee as a percent
export function computeRealizedLPFeePercent(
    trade: Trade<Currency, Currency, TradeType>
): Percent {

    let percent = ONE_HUNDRED_PERCENT.subtract(
        trade.route.pools.reduce<Percent>(
            (currentFee: Percent, pool): Percent =>
                currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(new Fraction(pool.fee, 1_000_000))),
            ONE_HUNDRED_PERCENT
        )
    )

    return new Percent(percent.numerator, percent.denominator)
}

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(
    trade?: Trade<Currency, Currency, TradeType> | null
): CurrencyAmount<Currency> | undefined {
    if (trade) {
        const realizedLPFee = computeRealizedLPFeePercent(trade)

        // the amount of the input that accrues to LPs
        return CurrencyAmount.fromRawAmount(trade.inputAmount.currency, trade.inputAmount.multiply(realizedLPFee).quotient)
    }

    return undefined
}

const IMPACT_TIERS = [
    BLOCKED_PRICE_IMPACT_NON_EXPERT,
    ALLOWED_PRICE_IMPACT_HIGH,
    ALLOWED_PRICE_IMPACT_MEDIUM,
    ALLOWED_PRICE_IMPACT_LOW
]

type WarningSeverity = 0 | 1 | 2 | 3 | 4

export function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
    if (!priceImpact) return 4
    let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity
    for (const impactLevel of IMPACT_TIERS) {
        if (impactLevel.lessThan(priceImpact)) return impact
        impact--
    }
    return 0
}
