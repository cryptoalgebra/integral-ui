import { Pool } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";
import { useCurrency } from "../common/useCurrency";
import { useMemo } from "react";
import { useCustomPoolDeployerQuery } from "@/graphql/generated/graphql";
import { useClients } from "../graphql/useClients";
import {
    useReadAlgebraPoolGlobalState,
    useReadAlgebraPoolLiquidity,
    useReadAlgebraPoolTickSpacing,
    useReadAlgebraPoolToken0,
    useReadAlgebraPoolToken1,
    useReadSecurityRegistryGetPoolStatus,
} from "@/generated";

export const PoolState = {
    LOADING: "LOADING",
    NOT_EXISTS: "NOT_EXISTS",
    EXISTS: "EXISTS",
    INVALID: "INVALID",
} as const;

export const SecurityState = {
    ENABLED: 0,
    BURN_ONLY: 1,
    DISABLED: 2
} as const;

export type PoolStateType = typeof PoolState[keyof typeof PoolState];
export type SecurityStateType = typeof SecurityState[keyof typeof SecurityState];

export function usePool(address: Address | undefined): [PoolStateType, Pool | null, number | null | undefined ] {
    const { data: tickSpacing, isLoading: isTickSpacingLoading, isError: isTickSpacingError } = useReadAlgebraPoolTickSpacing({
        address,
    });
    const {
        data: globalState,
        isLoading: isGlobalStateLoading,
        isError: isGlobalStateError,
    } = useReadAlgebraPoolGlobalState({
        address,
    });
    const {
        data: liquidity,
        isLoading: isLiquidityLoading,
        isError: isLiquidityError,
    } = useReadAlgebraPoolLiquidity({
        address,
    });

    const {
        data: token0Address,
        isLoading: isLoadingToken0,
        isError: isToken0Error,
    } = useReadAlgebraPoolToken0({
        address,
    });
    const {
        data: token1Address,
        isLoading: isLoadingToken1,
        isError: isToken1Error,
    } = useReadAlgebraPoolToken1({
        address,
    });

    const { data: poolSecurityStatus, isLoading: isPoolSecutiryStatusLoading } = useReadSecurityRegistryGetPoolStatus({
        args: address ? [address] : undefined,
    });

    const { infoClient } = useClients();

    const {
        data: poolDeployer,
        loading: isPoolDeployerLoading,
        error: isPoolDeployerError,
    } = useCustomPoolDeployerQuery({
        variables: {
            poolId: address?.toLowerCase() || "",
        },
        client: infoClient,
    });

    const token0 = useCurrency(token0Address);
    const token1 = useCurrency(token1Address);

    const isPoolError =
        isTickSpacingError || isGlobalStateError || isLiquidityError || isToken0Error || isToken1Error || isPoolDeployerError || !address;

    const isPoolLoading =
        isTickSpacingLoading || isGlobalStateLoading || isLiquidityLoading || isLoadingToken0 || isLoadingToken1 || isPoolDeployerLoading;
    const isTokensLoading = !token0 || !token1;

    return useMemo(() => {
        if ((isPoolLoading || isTokensLoading || isPoolSecutiryStatusLoading) && !isPoolError) return [PoolState.LOADING, null, null];

        if (!tickSpacing || !globalState || liquidity === undefined) return [PoolState.NOT_EXISTS, null, null];

        if (globalState[0] === 0n || !token0 || !token1 || !poolDeployer?.pool) return [PoolState.NOT_EXISTS, null, null];

        try {
            return [
                PoolState.EXISTS,
                new Pool(
                    token0.wrapped,
                    token1.wrapped,
                    globalState[2],
                    globalState[0].toString(),
                    poolDeployer.pool.deployer,
                    Number(liquidity),
                    globalState[1],
                    tickSpacing
                ),
                poolSecurityStatus
            ];
        } catch (error) {
            return [PoolState.NOT_EXISTS, null, null];
        }
    }, [token0, token1, globalState, liquidity, tickSpacing, poolDeployer, poolSecurityStatus, isPoolSecutiryStatusLoading, isPoolError, isPoolLoading, isTokensLoading]);
}
