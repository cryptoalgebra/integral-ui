import { useAccount } from "wagmi";
import { useMemo } from "react";
import { useClients } from "@/hooks/graphql/useClients";
import { useDepositsQuery, useEternalFarmingsQuery, useSinglePoolQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useCurrency } from "@/hooks/common/useCurrency";
import { Farming } from "@/types/farming-info";

export function useActiveFarming({ poolId }: { poolId: Address }) {
    const { address: account } = useAccount();

    const { infoClient, farmingClient } = useClients();

    const { data: poolInfo } = useSinglePoolQuery({
        variables: {
            poolId,
        },
        client: infoClient,
    });

    const { data: farmings, loading: isFarmingLoading } = useEternalFarmingsQuery({
        variables: {
            pool: poolId,
        },
        client: farmingClient,
        skip: !poolInfo,
    });

    const activeFarming = farmings?.eternalFarmings.filter((farming) => !farming.isDeactivated)[0];

    const rewardToken = useCurrency(activeFarming?.rewardToken as Address);
    const bonusRewardToken = useCurrency(activeFarming?.bonusRewardToken as Address);

    const { data: deposits, loading: areDepositsLoading } = useDepositsQuery({
        variables: {
            owner: account,
            pool: poolId,
        },
        client: farmingClient,
        skip: !poolInfo,
    });

    const farmingInfo: Farming | undefined = useMemo(() => {
        if (!farmings?.eternalFarmings) return;
        if (!poolInfo) return;
        if (!activeFarming || !rewardToken) {
            console.warn("Active farming not found");
            return;
        }
        return {
            farming: activeFarming,
            rewardToken: rewardToken.wrapped,
            bonusRewardToken: bonusRewardToken?.wrapped ?? null,
            pool: poolInfo.pool,
        };
    }, [activeFarming, bonusRewardToken, farmings?.eternalFarmings, poolInfo, rewardToken]);

    return {
        farmingInfo,
        deposits,
        isFarmingLoading,
        areDepositsLoading,
    };
}
