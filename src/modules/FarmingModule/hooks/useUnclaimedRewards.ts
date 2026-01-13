import { useAccount } from "wagmi";
import { useClients } from "@/hooks/graphql/useClients";
import { useUnclaimedRewardsQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";

export function useUnclaimedRewards() {
    const { address: account } = useAccount();

    const { farmingClient } = useClients();

    const { data: unclaimedRewards, loading } = useUnclaimedRewardsQuery({
        variables: {
            owner: account as Address,
        },
        client: farmingClient,
        skip: !account,
        pollInterval: 10_000,
    });

    console.log("[UNCLAIMED REWARDS]", unclaimedRewards?.rewards);

    return {
        unclaimedRewards,
        loading,
    };
}
