import { useMemo } from "react";
import { KycTradeGate } from "../types";
import { getTradePoolAddresses } from "../utils";
import { usePoolsPermissions } from "./usePoolsPermissions";

export function useTradeKycGate(trade: any): KycTradeGate {
    const poolAddresses = useMemo(() => getTradePoolAddresses(trade), [trade]);
    const { permissionsByPool, isLoading, isError, refetch } = usePoolsPermissions(poolAddresses);
    const requiredPoolAddresses = useMemo(
        () => poolAddresses.filter((poolAddress) => permissionsByPool[poolAddress.toLowerCase()]?.isPermissioned),
        [permissionsByPool, poolAddresses],
    );
    const deniedTokenAddresses = useMemo(
        () =>
            [...new Set(requiredPoolAddresses.flatMap((poolAddress) => permissionsByPool[poolAddress.toLowerCase()]?.deniedSwapTokens || []))],
        [permissionsByPool, requiredPoolAddresses],
    );
    const canSwap = requiredPoolAddresses.every(
        (poolAddress) => permissionsByPool[poolAddress.toLowerCase()]?.canSwap !== false,
    );

    return {
        isKycRequired: requiredPoolAddresses.length > 0,
        canSwap,
        isLoading,
        isError,
        poolAddresses,
        requiredPoolAddresses,
        deniedTokenAddresses,
        refetch,
    };
}
