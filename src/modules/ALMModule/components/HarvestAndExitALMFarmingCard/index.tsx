import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import { EternalFarming } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatAmount } from "@/utils";
import { useCurrency } from "@/hooks/common/useCurrency";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useALMFarmHarvest, useALMFarmUnstake, UserALMVault } from "../../hooks";
import { useALMFarmingRewardsEarned } from "../../hooks/useALMFarmingRewardsEarned";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";

interface ActiveFarmingCardProps {
    eternalFarming: EternalFarming;
    almPosition: UserALMVault;
    isEnded: boolean;
}

export const HarvestAndExitALMFarmingCard = ({ eternalFarming, almPosition, isEnded }: ActiveFarmingCardProps) => {
    const rewardTokenCurrency = useCurrency(eternalFarming.rewardToken as Address);
    const bonusRewardTokenCurrency = useCurrency(eternalFarming.bonusRewardToken as Address);

    const {
        formattedRewardEarned,
        formattedBonusRewardEarned,
        rewardEarnedUSD,
        bonusRewardEarnedUSD,
        totalRewardsEarnedUSD,
    } = useALMFarmingRewardsEarned(eternalFarming, almPosition);

    const isSameReward =
        eternalFarming.rewardToken.toLowerCase() === eternalFarming.bonusRewardToken.toLowerCase() ||
        eternalFarming.bonusRewardToken === ADDRESS_ZERO;

    const { onUnstake, isLoading: isUnstaking } = useALMFarmUnstake(almPosition);
    const { onHarvest, isLoading: isHarvesting } = useALMFarmHarvest(almPosition);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between bg-card-dark border-t border-card-border pt-4">
                <div className="text-left">
                    <div className="font-bold text-xs text-text-100/75 mb-2">EARNED REWARDS</div>
                    <HoverCard closeDelay={0} openDelay={0}>
                        <HoverCardTrigger>
                            <span className="text-cyan-300  font-semibold text-2xl drop-shadow-cyan border-b border-dotted border-cyan-300 cursor-pointer">
                                ${totalRewardsEarnedUSD}
                            </span>
                        </HoverCardTrigger>
                        <HoverCardContent side="bottom" className="flex flex-col gap-2 p-2">
                            <h4>Tokens</h4>
                            <div className="flex flex-col p-2 gap-2 bg-card-dark rounded-lg">
                                {isSameReward ? (
                                    <div className="flex items-center gap-6 justify-between bg-card-dark">
                                        <div className="flex gap-2 items-center">
                                            <CurrencyLogo className="inline" currency={rewardTokenCurrency} size={20} />
                                            <span>{rewardTokenCurrency?.symbol}</span>
                                        </div>

                                        <div className="flex gap-1 items-end">
                                            <span>{formatAmount(formattedRewardEarned + formattedBonusRewardEarned, 6)}</span>
                                            <span className="opacity-50 text-sm">(${formatAmount(totalRewardsEarnedUSD || 0, 2)})</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-6 justify-between">
                                            <div className="flex gap-2 items-center">
                                                <CurrencyLogo className="inline" currency={rewardTokenCurrency} size={20} />
                                                <span>{rewardTokenCurrency?.symbol}</span>
                                            </div>

                                            <div className="flex gap-1 items-end">
                                                <span>{formatAmount(formattedRewardEarned, 6)}</span>
                                                <span className="opacity-50 text-sm">(${formatAmount(rewardEarnedUSD || 0, 2)})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 justify-between">
                                            <div className="flex gap-2 items-center">
                                                <CurrencyLogo className="inline" currency={bonusRewardTokenCurrency} size={20} />
                                                <span>{bonusRewardTokenCurrency?.symbol}</span>
                                            </div>

                                            <div className="flex gap-1 items-end">
                                                <span>{formatAmount(formattedBonusRewardEarned, 6)}</span>
                                                <span className="opacity-50 text-sm">(${formatAmount(bonusRewardEarnedUSD || 0, 2)})</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
                <Button
                    variant={"primary"}
                    className="min-w-20 w-full max-w-fit"
                    size={"md"}
                    disabled={isHarvesting || isUnstaking}
                    onClick={onHarvest}
                >
                    {isHarvesting ? <Loader /> : "Collect"}
                </Button>
            </div>
            <Button variant={"primary"} onClick={onUnstake} disabled={isUnstaking || isHarvesting}>
                {isUnstaking ? <Loader /> : `Exit from ${isEnded ? "ended" : ""} farming`}
            </Button>
        </div>
    );
};
