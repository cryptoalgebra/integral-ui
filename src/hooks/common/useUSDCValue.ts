import { STABLECOINS } from "@/constants/tokens"
import { useNativePriceQuery, useSingleTokenQuery } from "@/graphql/generated/graphql"
import { Currency, CurrencyAmount, Price, tryParseAmount } from "@cryptoalgebra/circuit-sdk"
import { useMemo } from "react"

export function useUSDCPrice(currency: Currency | undefined) {

    const { data: bundles } = useNativePriceQuery()

    const { data: token } = useSingleTokenQuery({
        variables: {
            tokenId: currency ? currency.wrapped.address.toLowerCase() : ''
        }
    })

    return useMemo(() => {

        if (!currency || !bundles?.bundles?.[0] || !token?.token) return {
            price: undefined,
            formatted: 0
        }

        if (STABLECOINS.USDT.address.toLowerCase() === currency.wrapped.address.toLowerCase()) return {
            price: new Price(STABLECOINS.USDT, STABLECOINS.USDT, '1', '1'),
            formatted: 1
        }

        const tokenUSDValue = Number(token.token.derivedMatic) * Number(bundles.bundles[0].maticPriceUSD)

        const usdAmount = tryParseAmount(tokenUSDValue.toString(), currency)

        if (usdAmount) {
            return {
                price: new Price(currency, STABLECOINS.USDT, usdAmount.denominator, usdAmount.numerator),
                formatted: Number(usdAmount.toSignificant())
            }
        }

        return {
            price: undefined,
            formatted: 0
        }

    }, [currency, bundles, token])

}

export function useUSDCValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {

    const { price, formatted } = useUSDCPrice(currencyAmount?.currency)

    return useMemo(() => {

        if (!price || !currencyAmount) return {
            price: null,
            formatted: null
        }

        try {
            return {
                price: price.quote(currencyAmount),
                formatted: Number(currencyAmount.toSignificant()) * formatted
            }
        } catch {
            return {
                price: null,
                formatted: null
            }
        }

    }, [currencyAmount, price])

}
