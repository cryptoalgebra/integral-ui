import useSWR from "swr";
import { useChainId, usePublicClient, useReadContracts } from "wagmi";
import { quoterV2ABI, QUOTER_V2 } from "config";
import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useAllRoutes } from "./useAllRoutes";
import { encodeBoostedRouteToPath } from "sdk-updates/encodeBoostedRouteToPath";
import { BoostedToken } from "sdk-updates/boostedToken";
import { isBoostedToken } from "@/utils/pool/isBoostedToken";

type QuoteResult = [
    bigint[], // amountOutList
    bigint[], // amountInList
    bigint[], // sqrtPriceX96AfterList
    number[], // initializedTicksCrossedList
    bigint, // gasEstimate
    number[] // feeList
];

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
}): {
    data: QuoteResult[];
    isLoading: boolean;
    refetch: () => void;
} {
    const chainId = useChainId();
    const client = usePublicClient();
    const { boostedRoutes: routes, loading: routesLoading } = useAllRoutes(
        exactInput ? amountIn?.currency : currencyIn,
        !exactInput ? amountOut?.currency : currencyOut
    );

    const enabled = !!client && !routesLoading && !!routes?.length;

    /**
     * Step 1: Prepare input/output amounts by wrapping/unwrapping if needed
     * For exactInput (USDC → wUSDC → [boosted pool swap] → wWETH → WETH):
     * - We wrap USDC amount to wUSDC using previewDeposit
     * For exactOutput (USDC ← wUSDC ← [boosted pool swap] ← wWETH ← WETH):
     * - We wrap desired WETH output to wWETH using previewDeposit
     */
    const { data: preparedInputs, isLoading: wrapLoading } = useSWR(
        enabled ? ["prepareQuotes", routes, amountIn?.quotient?.toString(), amountOut?.quotient?.toString(), exactInput] : null,
        async () => {
            if (!client) return [];

            const amount = exactInput ? amountIn : amountOut;
            if (!amount?.quotient) return [];

            const prepared = await Promise.all(
                routes.map(async (route) => {
                    try {
                        const pathHex = encodeBoostedRouteToPath(route, !exactInput);
                        let quoteAmount = BigInt(amount.quotient.toString());

                        if (exactInput) {
                            // For exactInput: wrap input token if first pool token is boosted
                            const firstRouteToken = route.tokenPath[1];
                            if (isBoostedToken(firstRouteToken)) {
                                const boostedToken = firstRouteToken as BoostedToken;
                                quoteAmount = await boostedToken.previewDeposit(client, quoteAmount);
                            }
                        } else {
                            // For exactOutput: wrap output token if last pool token is boosted
                            const lastRouteToken = route.tokenPath[route.tokenPath.length - 2];
                            if (isBoostedToken(lastRouteToken)) {
                                const boostedToken = lastRouteToken as BoostedToken;
                                quoteAmount = await boostedToken.previewDeposit(client, quoteAmount);
                            }
                        }

                        return {
                            args: [pathHex, `0x${quoteAmount.toString(16)}`],
                            route,
                        };
                    } catch (error) {
                        console.error("Error preparing route:", error);
                        return null;
                    }
                })
            );

            return prepared.filter(Boolean);
        },
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    /**
     * Step 2: Get quotes from QuoterV2 using wrapped amounts
     */
    const { data: quotesData, isLoading: quotesLoading, refetch } = useReadContracts({
        contracts:
            preparedInputs?.map((input) => ({
                address: QUOTER_V2[chainId],
                abi: quoterV2ABI,
                functionName: exactInput ? "quoteExactInput" : "quoteExactOutput",
                args: input?.args,
            })) ?? [],
        query: { enabled: !!preparedInputs?.length },
    });

    /**
     * Step 3: Process quotes and unwrap amounts if needed
     * For exactInput: unwrap output amount (wWETH → WETH)
     * For exactOutput: unwrap input amount (wUSDC → USDC)
     */
    const { data: processedQuotes, isLoading: unwrapLoading } = useSWR(
        quotesData && preparedInputs ? ["processQuotes", quotesData, preparedInputs, exactInput] : null,
        async () => {
            if (!client || !quotesData || !preparedInputs) return [];

            return Promise.all(
                quotesData.map(async (quoteResult, i) => {
                    try {
                        if (!quoteResult?.result || !preparedInputs[i]) return null;

                        const route = preparedInputs[i]!.route;
                        const quote = (quoteResult.result as unknown) as QuoteResult;

                        if (exactInput) {
                            // For exactInput: unwrap output amounts
                            let [amountOutList] = quote;
                            const restResults = quote.slice(1);

                            const lastRouteToken = route.tokenPath[route.tokenPath.length - 2];
                            if (isBoostedToken(lastRouteToken)) {
                                const boostedOut = lastRouteToken as BoostedToken;
                                // Unwrap only the LAST element in amountOutList (final output)
                                const lastAmountOut = amountOutList[amountOutList.length - 1];
                                const unwrapped = await boostedOut.previewRedeem(client, lastAmountOut);
                                console.log("unwrapped output", unwrapped, "for", lastAmountOut, "on", boostedOut.symbol);

                                // Replace last element with unwrapped amount
                                amountOutList = [...amountOutList.slice(0, -1), unwrapped];
                            }

                            return [amountOutList, ...restResults];
                        } else {
                            // For exactOutput: unwrap input amounts
                            const [amountOutList, amountInList] = quote;
                            const restResults = quote.slice(2);

                            let unwrappedAmountInList = amountInList;
                            const firstRouteToken = route.tokenPath[1];
                            if (isBoostedToken(firstRouteToken)) {
                                const boostedIn = firstRouteToken as BoostedToken;
                                // Unwrap only the LAST element in amountInList (final input required)
                                const lastAmountIn = amountInList[amountInList.length - 1];
                                const unwrapped = await boostedIn.previewRedeem(client, lastAmountIn);
                                console.log("unwrapped input", unwrapped, "for", lastAmountIn, "on", boostedIn.symbol);

                                // Replace last element with unwrapped amount
                                unwrappedAmountInList = [...amountInList.slice(0, -1), unwrapped];
                            }

                            return [amountOutList, unwrappedAmountInList, ...restResults];
                        }
                    } catch (error) {
                        console.error("Error processing quote result:", error);
                        return null;
                    }
                })
            );
        },
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    return {
        data: (processedQuotes?.filter(Boolean) as QuoteResult[]) || [],
        isLoading: wrapLoading || quotesLoading || unwrapLoading,
        refetch,
    };
}
