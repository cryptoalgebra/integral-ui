import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { BoostedToken } from "sdk-updates/boostedToken";
import { useMemo } from "react";
import { usePublicClient } from "wagmi";
import useSWR from "swr";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

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
    const client = usePublicClient();

    const swrKey = useMemo(() => {
        if (!inputAmount || !poolToken || !client) return null;

        if (!(poolToken instanceof BoostedToken)) return null;

        return ["boosted-conversion", direction, poolToken.address, inputAmount.quotient.toString()];
    }, [inputAmount, poolToken, direction, client]);

    const fetcher = async () => {
        if (!client || !poolToken || !inputAmount) return null;

        const boostedToken = poolToken as BoostedToken;
        const amount = BigInt(inputAmount.quotient.toString());

        if (direction === "underlying-to-boosted") {
            const boostedShares = await boostedToken.previewDeposit(client, amount);
            return {
                outputAmount: boostedShares.toString(),
                rate: Number(boostedShares) / Number(amount),
                outputCurrency: boostedToken,
            };
        } else {
            const underlyingAmount = await boostedToken.previewRedeem(client, amount);
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

        if (!(poolToken instanceof BoostedToken)) {
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
