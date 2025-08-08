import { useAccount } from "wagmi";
import { useMemo } from "react";
import { useClients } from "@/hooks/graphql/useClients";
import { useDepositsQuery, useEternalFarmingsQuery, useSinglePoolQuery, useSingleTokenQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";

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

    const { data: rewardToken } = useSingleTokenQuery({
        skip: !activeFarming,
        variables: {
            tokenId: activeFarming?.rewardToken || "",
        },
        client: infoClient,
    });

    const { data: bonusRewardToken } = useSingleTokenQuery({
        skip: !activeFarming || !activeFarming?.bonusRewardToken,
        variables: {
            tokenId: activeFarming?.bonusRewardToken || "",
        },
        client: infoClient,
    });

    const { data: deposits, loading: areDepositsLoading } = useDepositsQuery({
        variables: {
            owner: account,
            pool: poolId,
        },
        client: farmingClient,
        skip: !poolInfo,
    });

    const farmingInfo = useMemo(() => {
        if (!farmings?.eternalFarmings) return;
        if (!poolInfo) return;
        if (!rewardToken) return;
        if (!bonusRewardToken) return;
        if (!activeFarming || !rewardToken.token) {
            console.debug("Active farming not found");
            return null;
        }
        return {
            farming: activeFarming,
            rewardToken: rewardToken.token,
            bonusRewardToken: bonusRewardToken.token ?? null,
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
