import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { EternalFarming } from "@/graphql/generated/graphql";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useFarmUnstake } from "@/hooks/farming/useFarmStake";
import { useFarmingDepositRewardsEarned } from "@/hooks/farming/useFarmingDepositRewardsEarned";
import { FormattedPosition } from "@/types/formatted-position";
import { ADDRESS_ZERO } from "@cryptoalgebra/circuit-sdk";
import { useAccount } from "wagmi";

interface ClosedFarmingCardProps {
    positionInEndedFarming: EternalFarming;
    selectedPosition: FormattedPosition;
}

const ClosedFarmingCard = ({ positionInEndedFarming, selectedPosition }: ClosedFarmingCardProps) => {
    const { address: account } = useAccount();

    const rewardTokenCurrency = useCurrency(positionInEndedFarming.rewardToken, true);
    const bonusRewardTokenCurrency = useCurrency(positionInEndedFarming.bonusRewardToken, true);

    const farmingArgs = {
        tokenId: BigInt(selectedPosition.id),
        rewardToken: positionInEndedFarming.rewardToken,
        bonusRewardToken: positionInEndedFarming.bonusRewardToken,
        pool: positionInEndedFarming.pool,
        nonce: positionInEndedFarming.nonce,
        account: account ?? ADDRESS_ZERO,
    };

    const { rewardEarned, bonusRewardEarned, rewardEarnedUSD, bonusRewardEarnedUSD, totalEarned, totalEarnedUSD } =
        useFarmingDepositRewardsEarned({
            farming: positionInEndedFarming,
            positionId: BigInt(selectedPosition.id),
        });

    const isSameReward = positionInEndedFarming.rewardToken.toLowerCase() === positionInEndedFarming.bonusRewardToken.toLowerCase();
    const isSingleReward =
        positionInEndedFarming.bonusRewardToken.toLowerCase() === ADDRESS_ZERO.toLowerCase() ||
        positionInEndedFarming.bonusRewardToken === null;

    const { onUnstake, isLoading: isUnstaking } = useFarmUnstake(farmingArgs);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between bg-card-dark p-4 rounded-xl">
                <div className="text-left">
                    <HoverCard>
                        <HoverCardTrigger>
                            <div className="font-bold text-xs">EARNED REWARDS</div>
                            <div className="font-semibold text-2xl">
                                <span className="text-cyan-300 drop-shadow-cyan">${totalEarnedUSD}</span>
                            </div>
                        </HoverCardTrigger>
                        {totalEarned !== "0" && (
                            <HoverCardContent className="flex flex-col gap-2">
                                {isSameReward ? (
                                    <span>
                                        {totalEarned} {rewardTokenCurrency?.symbol} ≈ ${totalEarnedUSD}
                                    </span>
                                ) : isSingleReward ? (
                                    <span>
                                        {rewardEarned} {rewardTokenCurrency?.symbol} ≈ ${rewardEarnedUSD}
                                    </span>
                                ) : (
                                    <>
                                        <span>
                                            {rewardEarned} {rewardTokenCurrency?.symbol} ≈ ${rewardEarnedUSD}
                                        </span>
                                        <span>
                                            {bonusRewardEarned} {bonusRewardTokenCurrency?.symbol} ≈ ${bonusRewardEarnedUSD}
                                        </span>
                                    </>
                                )}
                            </HoverCardContent>
                        )}
                    </HoverCard>
                </div>
                <Button className="border" size={"md"} disabled variant={"ghost"}>
                    Ended
                </Button>
            </div>
            <Button onClick={onUnstake} disabled={isUnstaking}>
                {isUnstaking ? <Loader /> : "Exit from farming"}
            </Button>
        </div>
    );
};

export default ClosedFarmingCard;
