import { TOKENS } from "config";
import { useNativePriceQuery, useSingleTokenQuery } from "@/graphql/generated/graphql";
import { Currency, CurrencyAmount, Price, tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { useClients } from "../graphql/useClients";

export function useUSDCPrice(currency: Currency | undefined) {
    const { infoClient } = useClients();
    const chainId = useChainId();

    const { data: bundles } = useNativePriceQuery({
        client: infoClient,
    });

    const { data: token } = useSingleTokenQuery({
        variables: {
            tokenId: currency ? currency.wrapped.address.toLowerCase() : "",
        },
        skip: !currency,
        client: infoClient,
    });

    return useMemo(() => {
        if (!currency) {
            return {
                price: undefined,
                formatted: 0,
            };
        }

        // USDC itself — 1:1 price
        if (TOKENS[chainId].USDC.address.toLowerCase() === currency.wrapped.address.toLowerCase()) {
            return {
                price: new Price(TOKENS[chainId].USDC, TOKENS[chainId].USDC, "1", "1"),
                formatted: 1,
            };
        }

        let derivedMatic: string | undefined;
        let maticPriceUSD: number | undefined;

        if (bundles?.bundles?.[0] && token?.token?.derivedMatic) {
            maticPriceUSD = Number(bundles.bundles[0].maticPriceUSD);
            derivedMatic = token.token.derivedMatic;
        } else {
            return {
                price: undefined,
                formatted: 0,
            };
        }

        if (!derivedMatic || !maticPriceUSD) {
            return {
                price: undefined,
                formatted: 0,
            };
        }

        const tokenUSDValue = Number(derivedMatic) * maticPriceUSD;

        const usdAmount = tryParseAmount(tokenUSDValue.toFixed(currency.decimals), currency);

        if (usdAmount) {
            return {
                price: new Price(currency, TOKENS[chainId].USDC, usdAmount.denominator, usdAmount.numerator),
                formatted: Number(usdAmount.toSignificant()),
            };
        }

        return {
            price: undefined,
            formatted: 0,
        };
    }, [currency, bundles?.bundles, chainId, token?.token?.derivedMatic]);
}

export function useUSDCValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
    const { price, formatted } = useUSDCPrice(currencyAmount?.currency);

    return useMemo(() => {
        if (!price || !currencyAmount)
            return {
                price: null,
                formatted: null,
            };

        try {
            return {
                price: price.quote(currencyAmount),
                formatted: Number(currencyAmount.toSignificant()) * formatted,
            };
        } catch {
            return {
                price: null,
                formatted: null,
            };
        }
    }, [currencyAmount, price]);
}
