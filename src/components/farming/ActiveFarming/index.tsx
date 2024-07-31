import { useEffect } from "react";
import { SelectPositionFarmModal } from "@/components/modals/SelectPositionFarmModal";
import { Deposit } from "@/graphql/generated/graphql";
import { Farming } from "@/types/farming-info";
import { Button } from "@/components/ui/button";
import CardInfo from "@/components/common/CardInfo";
import { FormattedPosition } from "@/types/formatted-position";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useAccount } from "wagmi";
import { useFarmHarvestAll } from "@/hooks/farming/useFarmHarvest";
import Loader from "@/components/common/Loader";
import { ADDRESS_ZERO } from "@cryptoalgebra/scribe-sdk";
import { useFarmingAPR } from "@/hooks/farming/useFarmingAPR";
import { useFarmingUserTVL } from "@/hooks/farming/useFarmingUserTVL";
import { useFarmingRewardRates } from "@/hooks/farming/useFarmingRewardRates";
import { useFarmingRewardsEarned } from "@/hooks/farming/useFarmingRewardsEarned";

interface ActiveFarmingProps {
    farming: Farming;
    deposits: Deposit[];
    positionsData: FormattedPosition[];
}

const ActiveFarming = ({ farming, deposits, positionsData }: ActiveFarmingProps) => {
    const { address: account } = useAccount();

    const APR = useFarmingAPR({ farmingId: farming.farming.id });

    const userTVL = useFarmingUserTVL({ deposits, positionsData });

    const { rewardRatePerDay, bonusRewardRatePerDay, sumOfRewardRates } = useFarmingRewardRates(farming);

    const { rewardEarned, bonusRewardEarned, totalEarned, totalEarnedUSD, refetch } = useFarmingRewardsEarned({
        farming,
        deposits,
    });

    const rewardTokenCurrency = useCurrency(farming.farming.rewardToken);
    const bonusRewardTokenCurrency = useCurrency(farming.farming.bonusRewardToken);

    const isSameReward = farming.farming.rewardToken.toLowerCase() === farming.farming.bonusRewardToken.toLowerCase();
    const isSingleReward = farming.farming.bonusRewardToken.toLowerCase() === ADDRESS_ZERO || farming.farming.bonusRewardToken === null;

    const { isLoading, onHarvestAll, isSuccess } = useFarmHarvestAll(
        {
            rewardToken: farming.farming.rewardToken,
            bonusRewardToken: farming.farming.bonusRewardToken,
            pool: farming.farming.pool,
            nonce: farming.farming.nonce,
            account: account ?? ADDRESS_ZERO,
        },
        deposits
    );

    const handleHarvestAll = async () => {
        if (isLoading || !onHarvestAll) return;
        onHarvestAll();
    };

    useEffect(() => {
        if (!isSuccess) return;
        refetch();
    }, [isSuccess]);

    return (
        <div className="flex items-center justify-center min-h-[377px] pb-2 bg-card border border-card-border/60 rounded-3xl mt-8">
            <div className="flex flex-col w-full max-sm:p-6 p-8 gap-8">
                <div className="flex max-sm:flex-col w-full gap-8">
                    <div className="flex max-xs:flex-col w-full gap-8">
                        <CardInfo className="w-1/2 max-xs:w-full" title="APR">
                            <p className="text-green-300">{APR}%</p>
                        </CardInfo>
                        <CardInfo className="w-1/2 max-xs:w-full" title="TVL">
                            <p className="text-purple-300">${userTVL}</p>
                        </CardInfo>
                    </div>

                    <CardInfo
                        additional={
                            totalEarned !== "0"
                                ? isSameReward
                                    ? `${totalEarned} ${farming.rewardToken.symbol}`
                                    : isSingleReward
                                    ? `${rewardEarned} ${farming.rewardToken.symbol}`
                                    : `${rewardEarned} ${farming.rewardToken.symbol} + ${bonusRewardEarned} ${farming.bonusRewardToken?.symbol}`
                                : ""
                        }
                        className="w-full"
                        title="EARNED"
                    >
                        <p className="text-cyan-300">${totalEarnedUSD}</p>
                    </CardInfo>
                </div>

                <CardInfo title="Rewards">
                    <div className="flex gap-12 min-h-12">
                        <div className="flex gap-4 items-center">
                            {isSameReward ? (
                                <>
                                    <CurrencyLogo size={32} currency={rewardTokenCurrency} />
                                    <p>{`${sumOfRewardRates} ${farming.rewardToken.symbol} / day`}</p>
                                </>
                            ) : (
                                <div className="flex w-full gap-4 max-md:flex-col">
                                    <div className="flex w-fit h-fit gap-4 items-center">
                                        <CurrencyLogo className="h-fit" size={32} currency={rewardTokenCurrency} />
                                        <p>{`${rewardRatePerDay} ${farming.rewardToken.symbol} / day`}</p>
                                    </div>
                                    {!isSingleReward && (
                                        <div className="flex w-fit h-fit gap-4 items-center">
                                            <CurrencyLogo className="h-fit" size={32} currency={bonusRewardTokenCurrency} />
                                            <p>{`${bonusRewardRatePerDay} ${farming.bonusRewardToken?.symbol} / day`}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardInfo>

                <div className="w-full flex gap-8">
                    <Button disabled={totalEarned === "0" || isLoading} onClick={handleHarvestAll} className="w-1/2">
                        {isLoading ? <Loader /> : "Collect Rewards"}
                    </Button>
                    <SelectPositionFarmModal
                        isHarvestLoading={isLoading}
                        positions={deposits}
                        farming={farming}
                        positionsData={positionsData}
                    />
                </div>
            </div>
        </div>
    );
};

export default ActiveFarming;
