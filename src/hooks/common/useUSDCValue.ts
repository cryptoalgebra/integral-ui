import { STABLECOINS } from "@/constants/tokens"
import { useNativePriceQuery, useSingleTokenQuery } from "@/graphql/generated/graphql"
import { Currency, CurrencyAmount, tryParseAmount } from "@cryptoalgebra/integral-sdk"
import { useMemo } from "react"

export function useUSDCPrice(currency: Currency | undefined) {

    const { data: bundles } = useNativePriceQuery()

    const { data: token } = useSingleTokenQuery({
        variables: {
            tokenId: currency ? currency.wrapped.address.toLowerCase() : ''
        }
    })

    return useMemo(() => {

        if (!currency || !bundles?.bundles?.[0] || !token?.token) return undefined

        if (STABLECOINS.USDC.address.toLowerCase() === currency.wrapped.address.toLowerCase()) return 1

        const tokenUSDValue = Number(token.token.derivedMatic) * Number(bundles.bundles[0].maticPriceUSD)

        const usdAmount = tryParseAmount(tokenUSDValue.toString(), currency)

        console.log('tokenUSDValue', usdAmount?.toSignificant())

        if (usdAmount) {
            return Number(usdAmount.toSignificant())
        }

        return undefined

    }, [currency, bundles, token])

}

export function useUSDCValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {

    const price = useUSDCPrice(currencyAmount?.currency)

    return useMemo(() => {

        if (!price || !currencyAmount) return null

        try {
            return Number(currencyAmount.toSignificant()) * price;
        } catch {
            return null
        }

    }, [currencyAmount, price])

}