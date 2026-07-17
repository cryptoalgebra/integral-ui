import { usePoolActiveModules } from "@/hooks/pools/usePoolActiveModules";
import { Address } from "viem";
import { KycPoolRequirement } from "../types";

const KYC_MODULE_NAME = "KYC Plugin";

export function usePoolKycRequirement(poolAddress: Address | undefined): KycPoolRequirement {
    const { activeModules, pluginAddress, isLoading, isError, refetch } = usePoolActiveModules(poolAddress);

    return {
        isKycRequired: activeModules.includes(KYC_MODULE_NAME),
        isLoading,
        isError,
        pluginAddress,
        activeModules,
        refetch,
    };
}
