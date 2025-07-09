import { useAccount } from "wagmi";
import { useClients } from "../graphql/useClients";
import { useUnclaimedRewardsQuery } from "@/graphql/generated/graphql";

export function useUnclaimedRewards() {

    const { address: account } = useAccount();

    const { farmingClient } = useClients();

    const { data: unclaimedRewards, loading } = useUnclaimedRewardsQuery({
        variables: {
            owner: account,
        },
        client: farmingClient,
        skip: !account,
    });

    return {
        unclaimedRewards,
        loading
    }

}