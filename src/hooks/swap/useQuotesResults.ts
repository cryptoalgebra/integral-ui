import { quoterV2ABI, QUOTER_V2 } from "config";
import { Currency, CurrencyAmount, encodeRouteToPath, Route } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Hex } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";

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
    const amount = exactInput ? amountIn : amountOut;

    const quoteInputs = useMemo(() => {
        return routes.map((route) => [encodeRouteToPath(route, !exactInput), amount?.quotient ?? 0n] as readonly [Hex, bigint]);
    }, [amount, routes, exactInput]);

    const functionName = exactInput ? "quoteExactInput" : "quoteExactOutput";

    const { data: quotesResults, isLoading, refetch } = useReadContracts({
        account: walletAddress,
        contracts: quoteInputs.map((quote) => ({
            address: QUOTER_V2[chainId],
            abi: quoterV2ABI,
            functionName: functionName,
            args: quote,
        })),
        allowFailure: true,
        query: { enabled: Boolean(amount && quoteInputs.length > 0) },
    });

    return {
        data: (quotesResults?.map((result) =>
            result.status === "success" ? (result.result as unknown as QuoteResult) : undefined,
        ) || []) as (
            | QuoteResult
            | undefined
        )[],
        isLoading,
        refetch,
    };
}
