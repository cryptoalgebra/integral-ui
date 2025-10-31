import useSWR from "swr";
import { useChainId, usePublicClient, useReadContracts } from "wagmi";
import { quoterV2ABI, QUOTER_V2 } from "config";
import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useAllRoutes } from "./useAllRoutes";
import { encodeBoostedRouteToPath } from "sdk-updates/encodeBoostedRouteToPath";
import { BoostedToken } from "sdk-updates/boostedToken";
import { BoostedSwapType, determineSwapType } from "@/utils/boosted/swapTypeUtils";

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
    const amount = exactInput ? amountIn : amountOut;

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: Prepare inputs for each route
    // ═══════════════════════════════════════════════════════════════════
    const { data: prepared, isLoading: prepareLoading } = useSWR(
        enabled && amount ? ["prepare", routes, amount.quotient.toString(), exactInput] : null,
        async () => {
            if (!client) return [];
            const quoteAmount = BigInt(amount!.quotient.toString());

            return Promise.all(
                routes.map(async (route) => {
                    const tokenIn = route.input.wrapped;
                    const tokenOut = route.output.wrapped;
                    const swapType = determineSwapType(tokenIn, tokenOut);

                    try {
                        switch (swapType) {
                            case BoostedSwapType.WRAP_ONLY: {
                                const boostedToken = tokenOut as BoostedToken;
                                const result = exactInput
                                    ? await boostedToken.previewDeposit(client!, quoteAmount)
                                    : await boostedToken.previewRedeem(client!, quoteAmount);
                                return { route, swapType, directResult: result };
                            }

                            case BoostedSwapType.UNWRAP_ONLY: {
                                const boostedToken = tokenIn as BoostedToken;
                                const result = exactInput
                                    ? await boostedToken.previewRedeem(client!, quoteAmount)
                                    : await boostedToken.previewDeposit(client!, quoteAmount);
                                return { route, swapType, directResult: result };
                            }

                            case BoostedSwapType.UNDERLYING_TO_UNDERLYING:
                            case BoostedSwapType.UNDERLYING_TO_BOOSTED: {
                                const pathHex = encodeBoostedRouteToPath(route, !exactInput);
                                let adjustedAmount = quoteAmount;

                                if (exactInput) {
                                    const boostedIn = route.tokenPath[1] as BoostedToken;
                                    adjustedAmount = await boostedIn.previewDeposit(client!, quoteAmount);
                                }

                                return {
                                    route,
                                    swapType,
                                    quoterArgs: [pathHex, `0x${adjustedAmount.toString(16)}`] as [string, string],
                                };
                            }

                            case BoostedSwapType.BOOSTED_TO_UNDERLYING: {
                                const pathHex = encodeBoostedRouteToPath(route, !exactInput);
                                let adjustedAmount = quoteAmount;

                                if (!exactInput) {
                                    const boostedOut = route.tokenPath[route.tokenPath.length - 2] as BoostedToken;
                                    adjustedAmount = await boostedOut.previewDeposit(client!, quoteAmount);
                                }

                                return {
                                    route,
                                    swapType,
                                    quoterArgs: [pathHex, `0x${adjustedAmount.toString(16)}`] as [string, string],
                                };
                            }

                            case BoostedSwapType.BOOSTED_TO_BOOSTED: {
                                const pathHex = encodeBoostedRouteToPath(route, !exactInput);
                                return {
                                    route,
                                    swapType,
                                    quoterArgs: [pathHex, `0x${quoteAmount.toString(16)}`] as [string, string],
                                };
                            }

                            default:
                                return null;
                        }
                    } catch (error) {
                        console.error("Error preparing route:", error);
                        return null;
                    }
                })
            ).then((results) => results.filter((r) => r !== null));
        },
        { revalidateOnFocus: false }
    );

    console.log("prepared", prepared);

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: Get quotes from QuoterV2 (skip direct wrap/unwrap)
    // ═══════════════════════════════════════════════════════════════════
    const { data: quotes, isLoading: quotesLoading, refetch } = useReadContracts({
        contracts:
            prepared
                ?.filter((p) => p.quoterArgs)
                .map((p) => ({
                    address: QUOTER_V2[chainId],
                    abi: quoterV2ABI,
                    functionName: exactInput ? "quoteExactInput" : "quoteExactOutput",
                    args: p.quoterArgs,
                })) ?? [],
        query: { enabled: !!prepared?.some((p) => p.quoterArgs) },
    });

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: Process results
    // ═══════════════════════════════════════════════════════════════════
    const { data: results, isLoading: processLoading } = useSWR(
        prepared ? ["process", prepared, quotes, exactInput] : null,
        async () => {
            if (!client) return [];
            const processed: QuoteResult[] = [];
            let quoterIdx = 0;

            for (const prep of prepared!) {
                const { route, swapType, directResult } = prep;

                try {
                    // Handle direct wrap/unwrap
                    if (directResult !== undefined) {
                        processed.push([
                            exactInput ? [directResult] : [BigInt(amount!.quotient.toString())],
                            exactInput ? [BigInt(amount!.quotient.toString())] : [directResult],
                            [],
                            [],
                            0n,
                            [],
                        ]);
                        continue;
                    }

                    // Handle pool swaps
                    const quoteData = quotes![quoterIdx++];
                    if (!quoteData?.result) continue;

                    const [
                        amountOutList,
                        amountInList,
                        sqrtPriceX96AfterList,
                        initializedTicksCrossedList,
                        gasEstimate,
                        feeList,
                    ] = (quoteData.result as unknown) as QuoteResult;

                    let finalAmountOut = amountOutList;
                    let finalAmountIn = amountInList;

                    switch (swapType) {
                        case BoostedSwapType.UNDERLYING_TO_UNDERLYING:
                        case BoostedSwapType.BOOSTED_TO_UNDERLYING: {
                            if (exactInput) {
                                const boostedOut = route.tokenPath[route.tokenPath.length - 2] as BoostedToken;
                                const unwrapped = await boostedOut.previewRedeem(client!, amountOutList[amountOutList.length - 1]);
                                finalAmountOut = [...amountOutList.slice(0, -1), unwrapped];
                            }
                            break;
                        }

                        case BoostedSwapType.UNDERLYING_TO_BOOSTED: {
                            if (!exactInput) {
                                const boostedIn = route.tokenPath[1] as BoostedToken;
                                const unwrapped = await boostedIn.previewRedeem(client!, amountInList[amountInList.length - 1]);
                                finalAmountIn = [...amountInList.slice(0, -1), unwrapped];
                            }
                            break;
                        }

                        case BoostedSwapType.BOOSTED_TO_BOOSTED:
                            // No unwrap needed
                            break;
                    }

                    processed.push([
                        finalAmountOut,
                        finalAmountIn,
                        sqrtPriceX96AfterList,
                        initializedTicksCrossedList,
                        gasEstimate,
                        feeList,
                    ]);
                } catch (error) {
                    console.error("Error processing quote:", error);
                }
            }

            return processed;
        },
        { revalidateOnFocus: false }
    );

    return {
        data: results || [],
        isLoading: prepareLoading || quotesLoading || processLoading,
        refetch,
    };
}
