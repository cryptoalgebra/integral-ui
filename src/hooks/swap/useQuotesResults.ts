import { quoterV2ABI, QUOTER_V2 } from "config";
import { Currency, CurrencyAmount, encodeRouteToPath } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";
import { useAllRoutes } from "./useAllRoutes";

type QuoteResult = [
    bigint[], // amountOutList
    bigint[], // amountInList
    bigint[], // sqrtPriceX96AfterList
    number[], // initializedTicksCrossedList
    bigint, // gasEstimate
    number[] // feeList
];

export function useQuotesResults({
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
}): {
    data: QuoteResult[];
    isLoading: boolean;
    refetch: () => void;
} {
    const chainId = useChainId();
    const { normalRoutes: routes, loading: routesLoading } = useAllRoutes(
        exactInput ? amountIn?.currency : currencyIn,
        !exactInput ? amountOut?.currency : currencyOut,
        exactInput
    );

    const quoteInputs = useMemo(() => {
        return routes.map((route) => [
            encodeRouteToPath(route, !exactInput),
            exactInput
                ? amountIn
                    ? `0x${amountIn.quotient.toString(16)}`
                    : undefined
                : amountOut
                ? `0x${amountOut.quotient.toString(16)}`
                : undefined,
        ]);
    }, [amountIn, amountOut, routes, exactInput]);

    const functionName = exactInput ? "quoteExactInput" : "quoteExactOutput";

    const { data: quotesResults, isLoading, refetch } = useReadContracts({
        contracts: quoteInputs.map((quote: any) => ({
            address: QUOTER_V2[chainId],
            abi: quoterV2ABI,
            functionName: functionName,
            args: quote,
        })),
    });

    if (quotesResults?.length) {
        console.log("[COMPUTED QUOTES]", quotesResults);
    }

    return {
        data: (quotesResults?.map((d) => d?.result) as unknown) as QuoteResult[],
        isLoading: isLoading || routesLoading,
        refetch,
    };
}
