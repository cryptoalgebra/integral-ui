import { useMemo } from "react";
import { isDefined } from "@/utils/common/isDefined";
import { TransactionsTable } from "../TransactionsTable/transactionsTable";
import { transactionsColumns, TX } from "../TransactionsTable/transactionsColumns";
import {
    useBurnTransactionsQuery,
    useCollectTransactionsQuery,
    useMintTransactionsQuery,
    useSwapTransactionsQuery,
} from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { Address } from "viem";

// const weekAgo = (Date.now() - 7 * 24 * 60 * 60).toString();

export function TransactionsList({ tokenId, poolId }: { tokenId?: Address; poolId?: string }) {
    const { infoClient } = useClients();
    const now = useMemo(() => Math.floor(Date.now() / 1000), []);
    const weekAgo = useMemo(() => now - 7 * 24 * 60 * 60, [now]);

    const { data: mints, loading: mintsLoading } = useMintTransactionsQuery({
        variables: {
            where: {
                timestamp_gt: weekAgo.toString(),
                timestamp_lt: now.toString(),
                pool: poolId as string,
            },
        },
        client: infoClient,
    });
    const { data: swaps, loading: swapsLoading } = useSwapTransactionsQuery({
        variables: {
            where: {
                timestamp_gt: weekAgo.toString(),
                timestamp_lt: now.toString(),
                pool: poolId as string,
            },
        },
        client: infoClient,
    });
    const { data: burns, loading: burnsLoading } = useBurnTransactionsQuery({
        variables: {
            where: {
                timestamp_gt: weekAgo.toString(),
                timestamp_lt: now.toString(),
                pool: poolId as string,
            },
        },
        client: infoClient,
    });
    const { data: collects, loading: collectsLoading } = useCollectTransactionsQuery({
        variables: {
            where: {
                timestamp_gt: weekAgo.toString(),
                timestamp_lt: now.toString(),
                pool: poolId as string,
            },
        },
        client: infoClient,
    });

    const sortedTxs: TX[] = useMemo(() => {
        const _mints = mints?.mints || [];
        const _swaps =
            swaps?.swaps?.map((swap) => {
                // if (swap?.toRefund1 === swap?.amount.toString() || swap?.toRefund0 === swap?.amount.toString()) return undefined;
                const zeroToOne = Number(swap.amount0) > Number(swap.amount1);

                return {
                    ...swap,
                    zeroToOne,
                    amount0: Math.abs(Number(swap.amount0)),
                    amount1: Math.abs(Number(swap.amount1)),
                };
            }) || [];
        const _burns = burns?.burns || [];
        const _collects = collects?.collects || [];

        return [..._mints, ..._swaps, ..._burns, ..._collects]
            .filter(isDefined)
            .filter((tx) => {
                // if (bannedJettons.includes(Address.parse(tx.pool?.jetton0.address || ADDRESS_ZERO).toString())) {
                //     return false;
                // }
                // if (bannedJettons.includes(Address.parse(tx.pool?.jetton1.address || ADDRESS_ZERO).toString())) {
                //     return false;
                // }
                if (tokenId) {
                    return tx.pool?.token0.id.toLowerCase() === tokenId || tx.pool?.token1.id.toLowerCase() === tokenId;
                }
                if (poolId) {
                    return tx.pool?.id.toLowerCase() === poolId.toLowerCase();
                }
                return true;
            })
            .sort((a, b) => Number(a?.timestamp) - Number(b?.timestamp))
            .map((tx) => ({
                now: new Date(),
                time: new Date(Number(tx.timestamp) * 1000),
                hash: tx.id.split("#")[0] || "",
                pool: {
                    address: tx.pool?.id || "",
                    token0: {
                        symbol: tx.pool?.token0.symbol || "",
                        address: tx.pool?.token0.id || "",
                        decimals: Number(tx.pool?.token0.decimals || 0),
                    },
                    token1: {
                        symbol: tx.pool?.token1.symbol || "",
                        address: tx.pool?.token1.id || "",
                        decimals: Number(tx.pool?.token1.decimals || 0),
                    },
                },
                zeroToOne: tx.__typename === "Swap" ? tx.zeroToOne : true,
                amount0: Number(tx.amount0) || 0,
                amount1: Number(tx.amount1) || 0,
                wallet: tx.__typename === "Collect" ? tx.owner || "" : (tx as any).origin || "",
                __typename: tx.__typename || "",
            }));
    }, [mints?.mints, swaps?.swaps, burns?.burns, collects?.collects, tokenId, poolId]);

    const isLoading = mintsLoading || swapsLoading || burnsLoading || collectsLoading;

    return (
        <div className="pb-4 bg-card-dark border border-card-border rounded-lg w-full max-w-[1280px] mx-auto">
            <div className="flex w-full flex-col gap-4">
                <TransactionsTable
                    columns={transactionsColumns}
                    data={sortedTxs}
                    defaultSortingID={"time"}
                    showPagination
                    loading={isLoading}
                />
            </div>
        </div>
    );
}
