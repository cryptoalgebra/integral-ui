import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import { Deposit, EternalFarming } from "@/graphql/generated/graphql";
import { useFarmHarvest, useFarmingRewardsEarned, useFarmUnstake } from "../../hooks";
import { Address } from "viem";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatAmount } from "@/utils";
import { isSameRewards } from "../../utils";
import { useCurrency } from "@/hooks/common/useCurrency";
import CurrencyLogo from "@/components/common/CurrencyLogo";

interface ActiveFarmingCardProps {
    eternalFarming: EternalFarming;
    selectedPosition: Deposit;
    isEnded: boolean;
}

export const HarvestAndExitFarmingCard = ({ eternalFarming, selectedPosition, isEnded }: ActiveFarmingCardProps) => {
    const { address: account } = useAccount();
    const chainId = useChainId();

    const rewardTokenCurrency = useCurrency(eternalFarming.rewardToken as Address);
    const bonusRewardTokenCurrency = useCurrency(eternalFarming.bonusRewardToken as Address);

    const {
        formattedRewardEarned,
        formattedBonusRewardEarned,
        rewardEarnedUSD,
        bonusRewardEarnedUSD,
        totalRewardsEarnedUSD,
    } = useFarmingRewardsEarned(eternalFarming, [selectedPosition]);

    const isSameReward = isSameRewards(eternalFarming.rewardToken as Address, eternalFarming.bonusRewardToken as Address);

    const farmingArgs = {
        tokenId: BigInt(selectedPosition.id),
        rewardToken: eternalFarming.rewardToken as Address,
        bonusRewardToken: eternalFarming.bonusRewardToken as Address,
        pool: eternalFarming.pool as Address,
        nonce: BigInt(eternalFarming.nonce),
        account: account ?? ADDRESS_ZERO,
        chainId,
    };

    const { onHarvest, isLoading: isHarvesting } = useFarmHarvest(farmingArgs);

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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex w-full items-center justify-between rounded-xl">
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
                                            <span className="opacity-50 text-sm">(${totalRewardsEarnedUSD})</span>
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
                    size={"md"}
                    className="rounded-xl"
                    disabled={isHarvesting || isUnstaking}
                    onClick={handleHarvest}
                >
                    {isHarvesting ? <Loader /> : "Collect Rewards"}
                </Button>
            </div>
            <Button variant={"destructive"} onClick={handleUnstake} disabled={isUnstaking || isHarvesting}>
                {isUnstaking ? <Loader /> : `Exit from ${isEnded ? "ended" : ""} farming`}
            </Button>
        </div>
    );
};
