import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { formatAmount } from "@/utils";
import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatUnits } from "viem";
import { NAVHookVaultState } from "../types";

interface NAVHookReservesPanelProps {
    token0: Currency | undefined;
    token1: Currency | undefined;
    vaultState: NAVHookVaultState;
}

function ReserveRatioBar({
    token0,
    token1,
    token0Share,
    token1Share,
}: {
    token0: Currency | undefined;
    token1: Currency | undefined;
    token0Share: number;
    token1Share: number;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex h-2 overflow-hidden rounded-full bg-card-dark">
                <div className="bg-primary transition-all duration-300" style={{ width: `${token0Share}%` }} />
                <div className="bg-accent transition-all duration-300" style={{ width: `${token1Share}%` }} />
            </div>
            <div className="flex justify-between gap-2 text-xs text-text-300">
                <div className="flex items-center gap-2">
                    <CurrencyLogo currency={token0} size={20} />
                    <span className="font-medium text-text-100">{formatAmount(token0Share, 2)}%</span>
                </div>
                <div className="flex items-center gap-2">
                    <CurrencyLogo currency={token1} size={20} />
                    <span className="font-medium text-text-100">{formatAmount(token1Share, 2)}%</span>
                </div>
            </div>
        </div>
    );
}

function ReserveRow({ token, amountRaw }: { token: Currency | undefined; amountRaw: bigint }) {
    const amount = useMemo(() => (token ? CurrencyAmount.fromRawAmount(token, amountRaw.toString()) : undefined), [amountRaw, token]);
    const { formatted: amountUSD } = useUSDCValue(amount);
    const tokenExplorePath = token?.wrapped.address ? `/explore/token/${token.wrapped.address}` : undefined;

    return (
        <div className="flex items-center justify-between gap-3 rounded-full bg-card-light px-3 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
                <CurrencyLogo currency={token} size={26} />
                {tokenExplorePath ? (
                    <Link
                        className="truncate text-sm font-semibold text-text-100 transition-colors hover:text-primary"
                        to={tokenExplorePath}
                    >
                        {token?.symbol}
                    </Link>
                ) : (
                    <span className="truncate text-sm font-semibold text-text-100">{token?.symbol || "Token"}</span>
                )}
            </div>
            <span className="text-right text-sm font-semibold text-text-100">
                {token ? formatAmount(formatUnits(amountRaw, token.decimals), 4) : <Skeleton className="h-5 w-20 bg-card-light" />}{" "}
                <span className="text-xs font-medium text-text-300">${formatAmount(amountUSD || 0, 2)}</span>
            </span>
        </div>
    );
}

export function NAVHookReservesPanel({ token0, token1, vaultState }: NAVHookReservesPanelProps) {
    const amount0 = useMemo(() => (token0 ? CurrencyAmount.fromRawAmount(token0, vaultState.total0.toString()) : undefined), [
        token0,
        vaultState.total0,
    ]);
    const amount1 = useMemo(() => (token1 ? CurrencyAmount.fromRawAmount(token1, vaultState.total1.toString()) : undefined), [
        token1,
        vaultState.total1,
    ]);
    const { formatted: amount0USD } = useUSDCValue(amount0);
    const { formatted: amount1USD } = useUSDCValue(amount1);

    const { token0Share, token1Share, totalUSD } = useMemo(() => {
        const reserve0USD = Number(amount0USD || 0);
        const reserve1USD = Number(amount1USD || 0);
        const totalReserveUSD = reserve0USD + reserve1USD;

        if (totalReserveUSD > 0) {
            const nextToken0Share = (reserve0USD / totalReserveUSD) * 100;
            return {
                token0Share: nextToken0Share,
                token1Share: 100 - nextToken0Share,
                totalUSD: totalReserveUSD,
            };
        }

        const reserve0Amount = token0 ? Number(formatUnits(vaultState.total0, token0.decimals)) : 0;
        const reserve1Amount = token1 ? Number(formatUnits(vaultState.total1, token1.decimals)) : 0;
        const totalReserveAmount = reserve0Amount + reserve1Amount;

        if (!Number.isFinite(totalReserveAmount) || totalReserveAmount <= 0) {
            return { token0Share: 0, token1Share: 0, totalUSD: 0 };
        }

        const nextToken0Share = (reserve0Amount / totalReserveAmount) * 100;
        return {
            token0Share: nextToken0Share,
            token1Share: 100 - nextToken0Share,
            totalUSD: 0,
        };
    }, [amount0USD, amount1USD, token0, token1, vaultState.total0, vaultState.total1]);

    return (
        <section className="flex h-fit flex-col gap-4 rounded-xl border border-card-border bg-card p-5 text-left">
            <div className="flex items-end justify-between gap-4">
                <p className="text-lg font-semibold text-text-100">Reserves</p>
                <div className="text-xs font-semibold text-text-300 py-2 px-3 bg-card-light rounded-full">${formatAmount(totalUSD, 2)}</div>
            </div>

            <div className="flex flex-col gap-2">
                <ReserveRow token={token0} amountRaw={vaultState.total0} />
                <ReserveRow token={token1} amountRaw={vaultState.total1} />
            </div>

            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-semibold text-text-300">Token Ratio</p>
                <ReserveRatioBar token0={token0} token1={token1} token0Share={token0Share} token1Share={token1Share} />
            </div>
        </section>
    );
}
