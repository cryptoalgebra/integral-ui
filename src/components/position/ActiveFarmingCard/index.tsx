import { useEffect } from "react";
import { Farming } from "@/types/farming-info";
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { useFarmHarvest } from "@/hooks/farming/useFarmHarvest";
import { useFarmUnstake } from "@/hooks/farming/useFarmStake";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import { Deposit } from "@/graphql/generated/graphql";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useFarmingDepositRewardsEarned } from "@/hooks/farming/useFarmingDepositRewardsEarned";

interface ActiveFarmingCardProps {
    farming: Farming;
    selectedPosition: Deposit;
}

const ActiveFarmingCard = ({ farming, selectedPosition }: ActiveFarmingCardProps) => {
    const { address: account } = useAccount();

    const farmingArgs = {
        tokenId: BigInt(selectedPosition.id),
        rewardToken: farming.farming.rewardToken,
        bonusRewardToken: farming.farming.bonusRewardToken,
        pool: farming.farming.pool,
        nonce: farming.farming.nonce,
        account: account ?? ADDRESS_ZERO,
    };

    const { rewardEarned, bonusRewardEarned, rewardEarnedUSD, bonusRewardEarnedUSD, totalEarned, totalEarnedUSD, refetch } =
        useFarmingDepositRewardsEarned({
            farming: farming.farming,
            positionId: BigInt(selectedPosition.id),
        });

    const isSameReward = farming.farming.rewardToken.toLowerCase() === farming.farming.bonusRewardToken.toLowerCase();
    const isSingleReward =
        farming.farming.bonusRewardToken.toLowerCase() === ADDRESS_ZERO.toLowerCase() || farming.farming.bonusRewardToken === null;

    const { onHarvest, isLoading: isHarvesting, isSuccess: isHarvested } = useFarmHarvest(farmingArgs);

    const { onUnstake, isLoading: isUnstaking } = useFarmUnstake(farmingArgs);

    const handleUnstake = async () => {
        if (!account) return;
        if (!onUnstake) return;
        onUnstake();
    };

    const handleHarvest = async () => {
        if (!account) return;
        if (!onHarvest) return;
        onHarvest();
    };

    useEffect(() => {
        if (!isHarvested) return;
        refetch();
    }, [isHarvested]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between bg-card-dark p-4 rounded-xl">
                <div className="text-left">
                    <HoverCard openDelay={200} closeDelay={200}>
                        <HoverCardTrigger>
                            <div className="font-bold text-xs">EARNED REWARDS</div>
                            <div className="font-semibold text-2xl">
                                <span className="text-cyan-300 drop-shadow-cyan">${totalEarnedUSD}</span>
                            </div>
                        </HoverCardTrigger>
                        {totalEarned === "0" ? null : (
                            <HoverCardContent className="flex flex-col gap-2">
                                {isSameReward ? (
                                    <span>
                                        {totalEarned} {farming.rewardToken.symbol} ≈ ${totalEarnedUSD}
                                    </span>
                                ) : isSingleReward ? (
                                    <span>
                                        {rewardEarned} {farming.rewardToken.symbol} ≈ ${rewardEarnedUSD}
                                    </span>
                                ) : (
                                    <>
                                        <span>
                                            {rewardEarned} {farming.rewardToken.symbol} ≈ ${rewardEarnedUSD}
                                        </span>
                                        <span>
                                            {bonusRewardEarned} {farming.bonusRewardToken?.symbol} ≈ ${bonusRewardEarnedUSD}
                                        </span>
                                    </>
                                )}
                            </HoverCardContent>
                        )}
                    </HoverCard>
                </div>
                <Button size={"md"} disabled={isHarvesting || isUnstaking || totalEarned === "0"} onClick={handleHarvest}>
                    {isHarvesting ? <Loader /> : "Collect"}
                </Button>
            </div>
            <Button onClick={handleUnstake} disabled={isUnstaking || isHarvesting}>
                {isUnstaking ? <Loader /> : "Exit from farming"}
            </Button>
        </div>
    );
};

export default ActiveFarmingCard;
