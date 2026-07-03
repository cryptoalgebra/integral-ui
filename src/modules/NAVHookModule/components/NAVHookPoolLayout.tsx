import { Pool } from "@cryptoalgebra/integral-sdk";
import { PoolStats } from "@/hooks/pools/usePoolStats";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useNAVHookPool, useNAVHookVaultState } from "../hooks";
import { NAVHookMyLiquidity } from "./NAVHookMyLiquidity";
import { NAVHookPoolAttributesPanel } from "./NAVHookPoolAttributesPanel";
import { NAVHookReservesPanel } from "./NAVHookReservesPanel";

interface NAVHookPoolLayoutProps {
    poolId: Address | undefined;
    pool: Pool | null;
    poolStatus: number | undefined | null;
    poolStats: PoolStats;
}

export function NAVHookPoolLayout({ poolId, pool, poolStatus, poolStats }: NAVHookPoolLayoutProps) {
    const { address: account } = useAccount();
    const { token0, token1 } = useNAVHookPool(poolId);
    const vaultState = useNAVHookVaultState(poolId, account);

    return (
        <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
            <NAVHookMyLiquidity
                poolId={poolId}
                pool={pool}
                token0={token0}
                token1={token1}
                vaultState={vaultState}
                account={account}
                poolStatus={poolStatus}
            />
            <div className="flex flex-col gap-3">
                <NAVHookReservesPanel token0={token0} token1={token1} vaultState={vaultState} />
                <NAVHookPoolAttributesPanel pool={pool} token0={token0} token1={token1} poolStats={poolStats} />
            </div>
        </div>
    );
}
