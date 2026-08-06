import { quoterV2ABI, QUOTER_V2 } from "config";
import { Currency, CurrencyAmount, encodeRouteToPath, Route } from "@cryptoalgebra/integral-sdk";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount, useChainId, usePublicClient } from "wagmi";

type QuoteResult = [
    bigint[], // amountOutList
    bigint[], // amountInList
    bigint[], // sqrtPriceX96AfterList
    number[], // initializedTicksCrossedList
    bigint, // gasEstimate
    number[], // feeList
];

export function useQuotesResults({
    exactInput,
    amountIn,
    amountOut,
    routes,
}: {
    exactInput: boolean;
    amountIn?: CurrencyAmount<Currency>;
    amountOut?: CurrencyAmount<Currency>;
    routes: Route<Currency, Currency>[];
}): {
    data: (QuoteResult | undefined)[];
    isLoading: boolean;
    refetch: () => void;
} {
    const { address: walletAddress } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const quoterAddress = QUOTER_V2[chainId];
    const amount = exactInput ? amountIn : amountOut;

    const quoteInputs = useMemo(
        () => routes.map((route) => [encodeRouteToPath(route, !exactInput), amount?.quotient ?? 0n] as const),
        [amount, exactInput, routes],
    );
    const quoteKey = useMemo(
        () => quoteInputs.map(([path, quoteAmount]) => `${path}:${quoteAmount.toString()}`),
        [quoteInputs],
    );

    const functionName = exactInput ? "quoteExactInput" : "quoteExactOutput";
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["direct-quotes", chainId, quoterAddress, walletAddress, functionName, quoteKey],
        queryFn: async () => {
            if (!publicClient || !quoterAddress) return [];

            return Promise.all(
                quoteInputs.map(async (quote): Promise<QuoteResult | undefined> => {
                    try {
                        const simulation = exactInput
                            ? await publicClient.simulateContract({
                                  account: walletAddress,
                                  address: quoterAddress,
                                  abi: quoterV2ABI,
                                  functionName: "quoteExactInput",
                                  args: quote,
                              })
                            : await publicClient.simulateContract({
                                  account: walletAddress,
                                  address: quoterAddress,
                                  abi: quoterV2ABI,
                                  functionName: "quoteExactOutput",
                                  args: quote,
                              });

                        return simulation.result as QuoteResult;
                    } catch {
                        return undefined;
                    }
                }),
            );
        },
        enabled: Boolean(publicClient && quoterAddress && amount && quoteInputs.length > 0),
    });

    return {
        data: data ?? [],
        isLoading,
        refetch: () => void refetch(),
    };
}
