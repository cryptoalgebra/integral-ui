import { Address } from "viem";
import { KycPoolRequirement } from "../types";
import { usePoolPermissions } from "./usePoolsPermissions";
import { PERMISSIONED_POOL_MODULE_NAME } from "../constants";

export function usePoolKycRequirement(poolAddress: Address | undefined): KycPoolRequirement {
    const { permission, isLoading, isError, refetch } = usePoolPermissions(poolAddress);

    return {
        isKycRequired: Boolean(permission?.isPermissioned),
        canSwap: permission?.canSwap ?? true,
        canAddLiquidity: permission?.canAddLiquidity ?? true,
        deniedSwapTokens: permission?.deniedSwapTokens ?? [],
        deniedLiquidityTokens: permission?.deniedLiquidityTokens ?? [],
        isLoading,
        isError,
        pluginAddress: permission?.pluginAddress,
        activeModules: permission?.hasPermissionModule ? [PERMISSIONED_POOL_MODULE_NAME] : [],
        refetch,
    };
}
