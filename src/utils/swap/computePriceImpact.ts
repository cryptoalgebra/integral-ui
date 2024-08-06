import { CurrencyAmount, Percent, Token } from "@cryptoalgebra/circuit-sdk"

export const ONE_HUNDRED_PERCENT = new Percent('1')

export function computeFiatValuePriceImpact(
    fiatValueInput: CurrencyAmount<Token> | undefined | null,
    fiatValueOutput: CurrencyAmount<Token> | undefined | null
): Percent | undefined {
    if (!fiatValueOutput || !fiatValueInput) return undefined

    if (!fiatValueInput.currency.equals(fiatValueOutput.currency)) return undefined

    if (BigInt(fiatValueInput.quotient.toString()) === 0n) return undefined

    const pct = ONE_HUNDRED_PERCENT.subtract(fiatValueOutput.divide(fiatValueInput))

    return new Percent(pct.numerator, pct.denominator)
}
