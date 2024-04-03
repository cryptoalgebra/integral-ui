import { algebraQuoterV2ABI } from '@/abis';
import { ALGEBRA_QUOTER_V2 } from '@/constants/addresses';
import {
    Currency,
    CurrencyAmount,
    encodeRouteToPath,
} from '@cryptoalgebra/integral-sdk';
import { useMemo } from 'react';
import { useContractReads } from 'wagmi';
import { useAllRoutes } from './useAllRoutes';

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
}) {
    const { routes, loading: routesLoading } = useAllRoutes(
        exactInput ? amountIn?.currency : currencyIn,
        !exactInput ? amountOut?.currency : currencyOut
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

    const functionName = exactInput ? 'quoteExactInput' : 'quoteExactOutput';

    const {
        data: quotesResults,
        isLoading,
        refetch,
    } = useContractReads({
        contracts: quoteInputs.map((quote: any) => ({
            address: ALGEBRA_QUOTER_V2,
            abi: algebraQuoterV2ABI,
            functionName: functionName,
            args: quote,
        })),
        watch: true,
        cacheTime: 5_000
    });

    return {
        data: quotesResults,
        isLoading: isLoading || routesLoading,
        refetch,
    };
}
