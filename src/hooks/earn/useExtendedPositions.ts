import { usePositions } from "@/hooks/positions/usePositions";
import { simulateNonfungiblePositionManagerCollect } from "@/generated";
import { wagmiConfig } from "@/providers/WagmiProvider";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { formatUnits, maxUint128 } from "viem";
import { useAccount } from "wagmi";
import { ExtendedPool, useExtendedPools } from "../pools/useExtendedPools";
import { Position } from "@cryptoalgebra/integral-sdk";
import { isDefined } from "@/utils";

export enum PositionStatus {
    EARNING,
    OUT_OF_RANGE,
}

export interface ExtendedPosition {
    id: number;
    pool: ExtendedPool;
    position: Position;
    amountUSD: number;
    feesUSD: number;
    apr: number;
    status: PositionStatus;
}

export function useExtendedPositions(): {
    data: ExtendedPosition[];
    pools: ExtendedPool[];
    isLoading: boolean;
    refetch: () => Promise<void>;
} {
    const { address: account } = useAccount();

    const { pools: formattedPools, isLoading: isPoolsLoading } = useExtendedPools();
    const { positions, loading: isPositionsLoading, refetch: refetchPositions } = usePositions();

    const openPositions = useMemo(() => (positions || []).filter((position) => position.liquidity > 0n), [positions]);

    const poolsById = useMemo(() => new Map(formattedPools.map((pool) => [pool.id.toLowerCase(), pool])), [formattedPools]);

    const feesQueryKey = useMemo(() => {
        if (!account || openPositions.length === 0 || formattedPools.length === 0) return null;

        const positionsKey = openPositions.map((position) => `${position.pool.toLowerCase()}-${position.tokenId.toString()}`).join("|");
        const pricesKey = formattedPools.map((pool) => `${pool.id.toLowerCase()}-${pool.token0PriceUSD}-${pool.token1PriceUSD}`).join("|");

        return ["earn-position-fees", account, positionsKey, pricesKey] as const;
    }, [account, openPositions, formattedPools]);

    const { data: extendedPositions, isLoading: isPositionFeesLoading, mutate: mutateExtendedPositions } = useSWR<ExtendedPosition[]>(
        feesQueryKey,
        async () => {
            if (!account) return [];

            const entries = await Promise.all(
                openPositions.map(async (position) => {
                    const pool = poolsById.get(position.pool.toLowerCase());
                    if (!pool) return;

                    try {
                        const { result } = await simulateNonfungiblePositionManagerCollect(wagmiConfig, {
                            args: [
                                {
                                    tokenId: position.tokenId,
                                    recipient: account,
                                    amount0Max: maxUint128,
                                    amount1Max: maxUint128,
                                },
                            ],
                            account,
                        });

                        const token0Decimals = Number(pool.pool.token0.decimals || 18);
                        const token1Decimals = Number(pool.pool.token1.decimals || 18);

                        const feeAmount0 = Number(formatUnits(result[0], token0Decimals));
                        const feeAmount1 = Number(formatUnits(result[1], token1Decimals));

                        const feesUSD = feeAmount0 * pool.token0PriceUSD + feeAmount1 * pool.token1PriceUSD;

                        const positionSDK = new Position({
                            pool: pool.pool,
                            tickLower: Number(position.tickLower),
                            tickUpper: Number(position.tickUpper),
                            liquidity: position.liquidity.toString(),
                        });

                        const amountUSD =
                            Number(positionSDK.amount0.toSignificant(24)) * pool.token0PriceUSD +
                            Number(positionSDK.amount1.toSignificant(24)) * pool.token1PriceUSD;

                        const apr = pool.apr;

                        const isOutOfRange = positionSDK.tickLower > pool.pool.tickCurrent || positionSDK.tickUpper < pool.pool.tickCurrent;

                        return {
                            id: Number(position.tokenId),
                            pool,
                            position: positionSDK,
                            amountUSD,
                            feesUSD,
                            apr,
                            status: isOutOfRange ? PositionStatus.OUT_OF_RANGE : PositionStatus.EARNING,
                        };
                    } catch {
                        return;
                    }
                }),
            );

            return entries.filter(isDefined);
        },
        {
            refreshInterval: 10_000,
            keepPreviousData: true,
        },
    );

    const isLoading = isPoolsLoading || isPositionsLoading || Boolean(account && openPositions.length > 0 && isPositionFeesLoading);

    const refetch = useCallback(async () => {
        await refetchPositions();
        await mutateExtendedPositions();
    }, [refetchPositions, mutateExtendedPositions]);

    return {
        data: extendedPositions || [],
        pools: formattedPools,
        isLoading,
        refetch,
    };
}
