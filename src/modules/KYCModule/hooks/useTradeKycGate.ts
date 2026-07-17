import { usePoolsActiveModules } from "@/hooks/pools/usePoolActiveModules";
import { useMemo } from "react";
import { KycTradeGate } from "../types";
import { getTradePoolAddresses } from "../utils";

const KYC_MODULE_NAME = "KYC Plugin";

export function useTradeKycGate(trade: any): KycTradeGate {
    const poolAddresses = useMemo(() => getTradePoolAddresses(trade), [trade]);
    const { activeModulesByPool, isLoading, isError, refetch } = usePoolsActiveModules(poolAddresses);
    const requiredPoolAddresses = useMemo(
        () =>
            poolAddresses.filter((poolAddress) =>
                activeModulesByPool[poolAddress.toLowerCase()]?.includes(KYC_MODULE_NAME),
            ),
        [activeModulesByPool, poolAddresses],
    );

    return {
        isKycRequired: requiredPoolAddresses.length > 0,
        isLoading,
        isError,
        poolAddresses,
        requiredPoolAddresses,
        refetch,
    };
}
