import { Currency, CurrencyAmount, BoostedToken } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import useSWR from "swr";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { previewDeposit, previewRedeem } from "../utils";

interface ConversionResult {
    inputAmount: CurrencyAmount<Currency> | undefined;
    outputAmount: CurrencyAmount<Currency> | undefined;
    conversionRate: string | undefined;
    isConverting: boolean;
}

type ConversionDirection = "underlying-to-boosted" | "boosted-to-underlying";

export function useBoostedConversion(
    inputAmount: CurrencyAmount<Currency> | undefined,
    poolToken: Currency | undefined,
    direction: ConversionDirection
): ConversionResult {
    const swrKey = useMemo(() => {
        if (!inputAmount || !poolToken) return null;

        if (!poolToken.isBoosted) return null;

        return ["boosted-conversion", direction, poolToken.wrapped.address, inputAmount.quotient.toString()];
    }, [inputAmount, poolToken, direction]);

    const fetcher = async () => {
        if (!poolToken || !inputAmount) return null;

        const boostedToken = poolToken as BoostedToken;
        const amount = BigInt(inputAmount.quotient.toString());

        if (direction === "underlying-to-boosted") {
            const boostedShares = await previewDeposit(boostedToken, amount);
            return {
                outputAmount: boostedShares.toString(),
                rate: Number(boostedShares) / Number(amount),
                outputCurrency: boostedToken,
            };
        } else {
            const underlyingAmount = await previewRedeem(boostedToken, amount);
            return {
                outputAmount: underlyingAmount.toString(),
                rate: Number(underlyingAmount) / Number(amount),
                outputCurrency: unwrappedToken(boostedToken.underlying),
            };
        }
    };

    const { data, isLoading } = useSWR(swrKey, fetcher, {
        dedupingInterval: 2000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
    });

    const result = useMemo<ConversionResult>(() => {
        if (!inputAmount || !poolToken) {
            return {
                inputAmount: undefined,
                outputAmount: undefined,
                conversionRate: undefined,
                isConverting: false,
            };
        }

        if (!poolToken.isBoosted) {
            return {
                inputAmount,
                outputAmount: inputAmount,
                conversionRate: undefined,
                isConverting: false,
            };
        }

        if (isLoading || !data) {
            return {
                inputAmount,
                outputAmount: undefined,
                conversionRate: undefined,
                isConverting: isLoading,
            };
        }

        const convertedAmount = CurrencyAmount.fromRawAmount(data.outputCurrency, data.outputAmount);

        return {
            inputAmount,
            outputAmount: convertedAmount,
            conversionRate: data.rate.toFixed(6),
            isConverting: false,
        };
    }, [inputAmount, poolToken, data, isLoading]);

    return result;
}
