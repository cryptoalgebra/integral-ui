import LiquidityChart from "@/components/create-position/LiquidityChart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SecurityState } from "@/hooks/pools/usePool";
import { Currency, CurrencyAmount, Pool } from "@cryptoalgebra/integral-sdk";
import { useAppKit } from "@reown/appkit/react";
import { Address } from "viem";
import { NAVHookVaultState } from "../types";
import { NAVHookAddLiquidityModal } from "./NAVHookAddLiquidityModal";
import { NAVHookTokenValueCard } from "./NAVHookTokenValueCard";
import { NAVHookWithdrawLiquidityModal } from "./NAVHookWithdrawLiquidityModal";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { formatAmount } from "@/utils/common/formatAmount";

interface NAVHookMyLiquidityProps {
    poolId: Address | undefined;
    pool: Pool | null;
    token0: Currency | undefined;
    token1: Currency | undefined;
    vaultState: NAVHookVaultState;
    account: Address | undefined;
    poolStatus: number | undefined | null;
}

export function NAVHookMyLiquidity({ poolId, pool, token0, token1, vaultState, account, poolStatus }: NAVHookMyLiquidityProps) {
    const { open } = useAppKit();
    const currentPrice = pool ? Number(pool.token0Price.toSignificant(8)) : undefined;
    const enableActions = poolStatus === SecurityState.ENABLED;

    const { userAmount0, userAmount1 } = vaultState;
    const { formatted: amount0Usd } = useUSDCValue(token0 && CurrencyAmount.fromRawAmount(token0, userAmount0.toString()));
    const { formatted: amount1Usd } = useUSDCValue(token1 && CurrencyAmount.fromRawAmount(token1, userAmount1.toString()));
    const depositAmounUsd = Number(amount0Usd || 0) + Number(amount1Usd || 0);

    const renderActions = () => {
        if (!account) {
            return (
                <Button variant="primary" className="w-full" onClick={() => open()}>
                    Connect Wallet
                </Button>
            );
        }

        if (!enableActions) {
            return (
                <Button variant="primary" className="w-full" disabled>
                    Pool actions disabled
                </Button>
            );
        }

        if (!vaultState.hasPosition) {
            return <NAVHookAddLiquidityModal poolId={poolId} onSuccess={vaultState.refetch} triggerClassName="w-full" />;
        }

        return (
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <NAVHookAddLiquidityModal poolId={poolId} onSuccess={vaultState.refetch} triggerClassName="w-full" />
                <NAVHookWithdrawLiquidityModal poolId={poolId} onSuccess={vaultState.refetch} triggerClassName="w-full" />
            </div>
        );
    };

    return (
        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-card-border bg-card text-left">
            <div className="flex flex-col gap-4 p-5">
                <h2 className="text-lg font-semibold text-text-100">My Liquidity</h2>

                <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-card-dark/40 p-3">
                    {vaultState.hasPosition ? (
                        <>
                            {pool && token0 && token1 ? (
                                <LiquidityChart
                                    currencyA={token0}
                                    currencyB={token1}
                                    pool={pool}
                                    currentPrice={currentPrice}
                                    priceLower={undefined}
                                    priceUpper={undefined}
                                />
                            ) : (
                                <Skeleton className="h-[240px] w-full rounded-xl bg-card-light" />
                            )}
                        </>
                    ) : (
                        <p className="text-center text-sm font-medium text-text-300">You have no liquidity in this pool</p>
                    )}
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-6 border-t border-card-border p-5">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-text-100">Deposit Balance</h3>

                    <div className="text-xs font-semibold text-text-300 py-2 px-3 bg-card-light rounded-full">
                        ${formatAmount(depositAmounUsd, 2)}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center">
                    <NAVHookTokenValueCard currency={token0} amountRaw={vaultState.userAmount0} />
                    <span className="hidden text-xl font-semibold text-text-300 xl:block">+</span>
                    <NAVHookTokenValueCard currency={token1} amountRaw={vaultState.userAmount1} />
                </div>
                {renderActions()}
            </div>
        </section>
    );
}
