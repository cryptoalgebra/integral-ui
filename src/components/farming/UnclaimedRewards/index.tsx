import { ADDRESS_ZERO } from "@cryptoalgebra/sdk";

import { formatUnits } from "viem";
import { Address, useAccount } from "wagmi";

import CurrencyLogo from "@/components/common/CurrencyLogo";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";

import { Reward } from "@/graphql/generated/graphql";

import { useCurrency } from "@/hooks/common/useCurrency";
import { useFarmHarvestUnclaimed } from "@/hooks/farming/useFarmHarvest";

import { formatAmount } from "@/utils/common/formatAmount";


interface UnclaimedRewardsProps {
    unclaimedRewards: Reward[];
}

const UnclaimedRewards = ({ unclaimedRewards }: UnclaimedRewardsProps) => {

    const { address: account } = useAccount()

    const { isLoading, onHarvestUnclaimed } = useFarmHarvestUnclaimed(
        {
            rewards: unclaimedRewards.map((reward) => reward.rewardAddress),
            account: account ?? ADDRESS_ZERO,
        }
    );

    const handleHarvestUnclaimed = async () => {
        if (isLoading || !onHarvestUnclaimed) return;
        onHarvestUnclaimed();
    };

    return <div className="flex flex-col gap-8 bg-card border border-card-border/60 rounded-3xl mt-8 p-8">
        <div className="flex gap-4">
            {
                unclaimedRewards.map((reward) => (
                    <UnclaimedReward amount={reward.amount} reward={reward.rewardAddress} />
                ))
            }
        </div>
        <Button disabled={isLoading} onClick={handleHarvestUnclaimed} className="w-full">
            {isLoading ? <Loader /> : "Collect Rewards"}
        </Button>
    </div>
}

const UnclaimedReward = ({ amount, reward }: { amount: string, reward: Address }) => {

    const rewardCurrency = useCurrency(reward);
    const unclaimedAmount = formatAmount(formatUnits(BigInt(amount), rewardCurrency?.decimals || 18), 2)

    return <div className="flex items-center gap-2">
        <CurrencyLogo size={32} currency={rewardCurrency} />
        <p>{`${unclaimedAmount} ${rewardCurrency?.symbol || ''}`}</p>
    </div>

}

export default UnclaimedRewards;