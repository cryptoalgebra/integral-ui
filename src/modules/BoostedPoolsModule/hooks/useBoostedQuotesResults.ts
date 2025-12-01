import useSWR from "swr";
import { useChainId, usePublicClient } from "wagmi";
import { quoterV2ABI, QUOTER_V2 } from "config";
import {
    BoostedToken,
    Currency,
    CurrencyAmount,
    encodeRouteToPath,
    Route,
    BoostedRoute,
    BoostedRouteStep,
    BoostedRouteStepType,
} from "@cryptoalgebra/custom-pools-sdk";
import { useAllRoutes } from "@/hooks/swap/useAllRoutes";
import { readContract } from "viem/actions";

type QuoteResult = [
    bigint[], // amountOutList
    bigint[], // amountInList
    bigint[], // sqrtPriceX96AfterList
    number[], // initializedTicksCrossedList
    bigint, // gasEstimate
    number[] // feeList
];

/**
 * Result of a single step quote calculation
 */
interface StepQuoteResult {
    amountIn: bigint;
    amountOut: bigint;
    sqrtPriceX96After: bigint;
    initializedTicksCrossed: number;
    gasEstimate: bigint;
    fee: number;
}

/**
 * Quote a single step for exactInput direction
 */
async function quoteStepExactInput(step: BoostedRouteStep, amountIn: bigint, chainId: number, client: any): Promise<StepQuoteResult> {
    switch (step.type) {
        case BoostedRouteStepType.WRAP: {
            // ERC4626 deposit: assets → shares
            // previewDeposit(assets) returns shares
            const amountOut = await (step.tokenOut as BoostedToken).previewDeposit(amountIn);

            return {
                amountIn,
                amountOut,
                sqrtPriceX96After: BigInt(0),
                initializedTicksCrossed: 0,
                gasEstimate: BigInt(0),
                fee: 0,
            };
        }

        case BoostedRouteStepType.UNWRAP: {
            // ERC4626 redeem: shares → assets
            // previewRedeem(shares) returns assets
            const amountOut = await (step.tokenIn as BoostedToken).previewRedeem(amountIn);

            return {
                amountIn,
                amountOut,
                sqrtPriceX96After: BigInt(0),
                initializedTicksCrossed: 0,
                gasEstimate: BigInt(0),
                fee: 0,
            };
        }

        case BoostedRouteStepType.SWAP: {
            const pool = step.pool!;
            const singleRoute = new Route([pool], step.tokenIn, step.tokenOut);
            const pathHex = encodeRouteToPath(singleRoute, false);

            const quoteResult = ((await readContract(client, {
                address: QUOTER_V2[chainId],
                abi: quoterV2ABI,
                functionName: "quoteExactInput" as any,
                args: [pathHex, `0x${amountIn.toString(16)}`] as any,
            })) as unknown) as QuoteResult;

            const amountOut = quoteResult[0][0];

            return {
                amountIn,
                amountOut,
                sqrtPriceX96After: quoteResult[2][0],
                initializedTicksCrossed: Number(quoteResult[3][0]),
                gasEstimate: quoteResult[4],
                fee: quoteResult[5][0],
            };
        }

        default:
            throw new Error(`Unknown step type: ${step}`);
    }
}

/**
 * Quote a single step for exactOutput direction
 */
async function quoteStepExactOutput(step: BoostedRouteStep, amountOut: bigint, chainId: number, client: any): Promise<StepQuoteResult> {
    switch (step.type) {
        case BoostedRouteStepType.WRAP: {
            // ERC4626 mint: we want specific shares, need assets
            // previewMint(shares) returns required assets
            const amountIn = await (step.tokenOut as BoostedToken).previewMint(amountOut);

            return {
                amountIn,
                amountOut,
                sqrtPriceX96After: BigInt(0),
                initializedTicksCrossed: 0,
                gasEstimate: BigInt(0),
                fee: 0,
            };
        }

        case BoostedRouteStepType.UNWRAP: {
            // ERC4626 withdraw: we want specific assets, need shares
            // previewWithdraw(assets) returns required shares
            const amountIn = await (step.tokenIn as BoostedToken).previewWithdraw(amountOut);

            return {
                amountIn,
                amountOut,
                sqrtPriceX96After: BigInt(0),
                initializedTicksCrossed: 0,
                gasEstimate: BigInt(0),
                fee: 0,
            };
        }

        case BoostedRouteStepType.SWAP: {
            const pool = step.pool!;
            const singleRoute = new Route([pool], step.tokenIn, step.tokenOut);
            const pathHex = encodeRouteToPath(singleRoute, true);

            const quoteResult = ((await readContract(client, {
                address: QUOTER_V2[chainId],
                abi: quoterV2ABI,
                functionName: "quoteExactOutput" as any,
                args: [pathHex, `0x${amountOut.toString(16)}`] as any,
            })) as unknown) as QuoteResult;

            const amountIn = quoteResult[1][0];

            return {
                amountIn,
                amountOut,
                sqrtPriceX96After: quoteResult[2][0],
                initializedTicksCrossed: Number(quoteResult[3][0]),
                gasEstimate: quoteResult[4],
                fee: quoteResult[5][0],
            };
        }

        default:
            throw new Error(`Unknown step type: ${step}`);
    }
}

/**
 * Calculates quote for exactInput direction (forward through steps)
 */
async function calculateExactInputQuote(
    route: BoostedRoute<Currency, Currency>,
    amount: bigint,
    chainId: number,
    client: any
): Promise<QuoteResult> {
    const steps = route.steps;

    const amountOutList: bigint[] = [];
    const amountInList: bigint[] = [];
    const sqrtPriceX96AfterList: bigint[] = [];
    const initializedTicksCrossedList: number[] = [];
    let totalGasEstimate = BigInt(0);
    const feeList: number[] = [];

    let currentAmount = amount;

    // Process steps forward
    for (const step of steps) {
        const result = await quoteStepExactInput(step, currentAmount, chainId, client);

        amountInList.push(result.amountIn);
        amountOutList.push(result.amountOut);
        sqrtPriceX96AfterList.push(result.sqrtPriceX96After);
        initializedTicksCrossedList.push(result.initializedTicksCrossed);
        totalGasEstimate += result.gasEstimate;
        feeList.push(result.fee);

        currentAmount = result.amountOut;
    }

    return [amountOutList, amountInList, sqrtPriceX96AfterList, initializedTicksCrossedList, totalGasEstimate, feeList];
}

/**
 * Calculates quote for exactOutput direction (backward through steps)
 */
async function calculateExactOutputQuote(
    route: BoostedRoute<Currency, Currency>,
    amount: bigint,
    chainId: number,
    client: any
): Promise<QuoteResult> {
    const steps = route.steps;

    const amountOutList: bigint[] = [];
    const amountInList: bigint[] = [];
    const sqrtPriceX96AfterList: bigint[] = [];
    const initializedTicksCrossedList: number[] = [];
    let totalGasEstimate = BigInt(0);
    const feeList: number[] = [];

    let currentAmount = amount;

    // Process steps backward (from last to first)
    for (let i = steps.length - 1; i >= 0; i--) {
        const step = steps[i];
        const result = await quoteStepExactOutput(step, currentAmount, chainId, client);

        amountInList.push(result.amountIn);
        amountOutList.push(result.amountOut);
        sqrtPriceX96AfterList.push(result.sqrtPriceX96After);
        initializedTicksCrossedList.push(result.initializedTicksCrossed);
        totalGasEstimate += result.gasEstimate;
        feeList.push(result.fee);

        currentAmount = result.amountIn;
    }

    return [amountOutList, amountInList, sqrtPriceX96AfterList, initializedTicksCrossedList, totalGasEstimate, feeList];
}

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
    const { boostedRoutes: routes, loading: routesLoading } = useAllRoutes(
        exactInput ? amountIn?.currency : currencyIn,
        !exactInput ? amountOut?.currency : currencyOut,
        exactInput
    );

    const enabled = !routesLoading && !!routes?.length;
    const amount = exactInput ? amountIn : amountOut;

    const client = usePublicClient();

    const { data, isLoading, mutate: refetch } = useSWR(["boostedQuotes", routes, amount, exactInput, enabled], async () => {
        if (!routes || !amount || !client || !enabled) {
            return [];
        }

        const amountRaw = BigInt(amount.quotient.toString());

        const quotesPromises = routes.map(async (route, i) => {
            try {
                return exactInput
                    ? await calculateExactInputQuote(route, amountRaw, chainId, client)
                    : await calculateExactOutputQuote(route, amountRaw, chainId, client);
            } catch (error) {
                console.error(`[BoostedQuotes] Error calculating quote for route ${i}:`, error);
                return null;
            }
        });

        const results = await Promise.all(quotesPromises);
        return results.filter((r): r is QuoteResult => r !== null);
    });

    if (data) {
        console.log("[BOOSTED_QUOTES]:", data);
    }

    return {
        data: data ?? [],
        isLoading,
        refetch,
    };
}
