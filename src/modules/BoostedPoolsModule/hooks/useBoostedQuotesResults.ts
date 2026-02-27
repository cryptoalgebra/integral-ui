import useSWR from "swr";
import { useChainId, usePublicClient } from "wagmi";
import { OMEGA_QUOTER } from "config";
import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useAllRoutes } from "@/hooks/swap/useAllRoutes";
import { Address } from "viem";
import { OmegaQuoter } from "@cryptoalgebra/integral-omega-router-sdk";

export function useBoostedQuotesResults({
    exactInput,
    amountIn,
    amountOut,
    currencyIn,
    currencyOut,
}: {
    exactInput: boolean;
    amountIn?: CurrencyAmount<Currency>;
    amountOut?: CurrencyAmount<Currency>;
    currencyIn?: Currency;
    currencyOut?: Currency;
}) {
    const chainId = useChainId();
    const client = usePublicClient();
    const quoterAddress = OMEGA_QUOTER[chainId] as Address;

    const { boostedRoutes, loading: routesLoading } = useAllRoutes(
        exactInput ? amountIn?.currency : currencyIn,
        exactInput ? currencyOut : amountOut?.currency
    );

    const amount = exactInput ? amountIn : amountOut;
    const enabled = !routesLoading && boostedRoutes.length > 0 && !!amount && !!quoterAddress && !!client;

    const { data, isLoading, mutate } = useSWR(
        enabled ? ["boostedQuotes", chainId, boostedRoutes.length, amount?.quotient.toString(), exactInput] : null,
        async () => {
            if (!client || !amount) return [];

            const quoter = new OmegaQuoter(client, quoterAddress);
            try {
                const results = await quoter.batchQuote(boostedRoutes, amount, exactInput);
                return results;
            } catch (error) {
                console.error("[useBoostedQuotesResults] Batch quote error:", error);
                return [];
            }
        }
    );

    return {
        data: data ?? [],
        isLoading: isLoading || routesLoading,
        refetch: mutate,
    };
}
