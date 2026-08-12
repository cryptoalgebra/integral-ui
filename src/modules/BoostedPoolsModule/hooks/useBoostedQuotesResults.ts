import useSWR from "swr";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { OMEGA_QUOTER } from "config";
import { BoostedRoute, BoostedRouteStepType, Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";
import { OmegaQuoter } from "@cryptoalgebra/integral-omega-router-sdk";

export function useBoostedQuotesResults({
    exactInput,
    amountIn,
    amountOut,
    routes,
}: {
    exactInput: boolean;
    amountIn?: CurrencyAmount<Currency>;
    amountOut?: CurrencyAmount<Currency>;
    routes: BoostedRoute<Currency, Currency>[];
}) {
    const chainId = useChainId();
    const { address: walletAddress } = useAccount();
    const client = usePublicClient();
    const quoterAddress = OMEGA_QUOTER[chainId] as Address;
    const routesKey = routes
        .map((route) =>
            route.steps
                .map((step) =>
                    step.type === BoostedRouteStepType.SWAP
                        ? `${step.type}:${step.pool.deployer}:${step.pool.token0.address}:${step.pool.token1.address}`
                        : `${step.type}:${step.tokenIn.wrapped.address}:${step.tokenOut.wrapped.address}`,
                )
                .join(">"),
        )
        .join("|");

    const amount = exactInput ? amountIn : amountOut;
    const enabled = routes.length > 0 && !!amount && !!quoterAddress && !!client;

    const { data, isLoading, mutate } = useSWR(
        enabled ? ["boostedQuotes", chainId, walletAddress, routesKey, amount?.quotient.toString(), exactInput] : null,
        async () => {
            if (!client || !amount) return [];

            const quoter = new OmegaQuoter(client, quoterAddress);
            try {
                const results = await quoter.batchQuote(routes, amount, exactInput);
                return results;
            } catch (error) {
                console.error("[useBoostedQuotesResults] Batch quote error:", error);
                return [];
            }
        },
    );

    return {
        data: data ?? [],
        isLoading,
        refetch: mutate,
    };
}
