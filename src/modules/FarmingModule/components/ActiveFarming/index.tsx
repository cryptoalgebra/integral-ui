import { Farming } from "../../../../types/farming-info";
import { Button } from "@/components/ui/button";
import { Address, formatUnits } from "viem";
import { FormattedPosition } from "@/types/formatted-position";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useAccount } from "wagmi";
import { useFarmHarvestAll } from "../../hooks/useFarmHarvest";
import Loader from "@/components/common/Loader";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useFarmingAPR, useFarmingRewardsEarned } from "../../hooks";
import { isSameRewards } from "../../utils";
import { SelectPositionFarmModal } from "..";
import { CardInfo } from "../CardInfo";
import { formatAmount } from "@/utils";
import { useCurrency } from "@/hooks/common/useCurrency";
import { Deposit } from "@/graphql/generated/graphql";

interface ActiveFarmingProps {
    farming: Farming;
    deposits: Deposit[] | [];
    positionsData: FormattedPosition[];
}

export const ActiveFarming = ({ farming, deposits, positionsData }: ActiveFarmingProps) => {
    const { address: account } = useAccount();

    const rewardTokenCurrency = useCurrency(farming.farming.rewardToken as Address);
    const bonusRewardTokenCurrency = useCurrency(farming.farming.bonusRewardToken as Address);

    const depositsForActiveFarming = deposits.filter((d) => farming.farming.id.toLowerCase() === d.eternalFarming?.toLowerCase());

    const {
        formattedRewardEarned,
        formattedBonusRewardEarned,
        rewardEarnedUSD,
        bonusRewardEarnedUSD,
        totalRewardsEarnedUSD,
    } = useFarmingRewardsEarned(farming.farming, depositsForActiveFarming);

    const APR = useFarmingAPR({ farmingId: farming.farming.id });

    const isSameReward = isSameRewards(farming.farming.rewardToken as Address, farming.farming.bonusRewardToken as Address);

    const TVL = positionsData.filter((d) => d.onFarming).reduce((acc, curr) => acc + curr.liquidityUSD, 0);

    const formattedTVL = formatAmount(TVL, 2);

    const rewardRatePerDay = Number(formatUnits(BigInt(farming.farming.rewardRate), Number(farming.rewardToken.decimals))) * 60 * 60 * 24;

    const bonusRewardRatePerDay =
        Number(formatUnits(BigInt(farming.farming.bonusRewardRate), Number(farming.bonusRewardToken?.decimals || 18))) * 60 * 60 * 24;

    const { isLoading, onHarvestAll } = useFarmHarvestAll(
        {
            rewardToken: farming.farming.rewardToken as Address,
            bonusRewardToken: farming.farming.bonusRewardToken as Address,
            pool: farming.farming.pool as Address,
            nonce: BigInt(farming.farming.nonce),
            account: account ?? ADDRESS_ZERO,
        },
        depositsForActiveFarming
    );

    const handleHarvestAll = async () => {
        if (isLoading || !onHarvestAll) return;
        onHarvestAll();
    };

    return (
        <div className="flex items-center flex-col justify-center bg-card border border-card-border/60 rounded-xl mt-3 md:p-6 md:gap-6 gap-3 p-3">
            <div className="flex flex-col gap-3 w-full">
                <h3 className="md:text-2xl text-xl font-bold text-left">Active Farming</h3>
            </div>
            <div className="flex flex-col w-full gap-3">
                <div className="flex max-sm:flex-col w-full gap-3">
                    <div className="flex max-xs:flex-col w-full gap-3">
                        <CardInfo className="w-1/2 max-xs:w-full" title="APR">
                            <p className="text-green-300">{APR || 0}%</p>
                        </CardInfo>
                        <CardInfo className="w-1/2 max-xs:w-full" title="TVL">
                            <p className="text-purple-300">${formattedTVL}</p>
                        </CardInfo>
                    </div>

                    <CardInfo
                        additional={
                            isSameReward
                                ? `${formatAmount(formattedRewardEarned + formattedBonusRewardEarned, 2)} ${farming.rewardToken.symbol}`
                                : `${formatAmount(formattedRewardEarned, 2)} ${farming.rewardToken.symbol} + ${formatAmount(
                                      formattedBonusRewardEarned,
                                      2
                                  )} ${farming.bonusRewardToken?.symbol}`
                        }
                        className="w-full"
                        title="EARNED"
                    >
                        <p className="text-cyan-300">${totalRewardsEarnedUSD}</p>
                    </CardInfo>
                </div>

                <CardInfo title="Rewards">
                    <div className="flex gap-12 min-h-12">
                        <div className="flex gap-4 items-center">
                            {isSameReward ? (
                                <>
                                    <CurrencyLogo size={32} currency={rewardTokenCurrency} />
                                    <p>{`${formatAmount(rewardRatePerDay + bonusRewardRatePerDay, 2)} ${
                                        farming.rewardToken.symbol
                                    } / day`}</p>
                                </>
                            ) : (
                                <div className="flex w-full gap-4 max-md:flex-col">
                                    <div className="flex w-fit h-fit gap-4 items-center">
                                        <CurrencyLogo className="h-fit" size={32} currency={rewardTokenCurrency} />
                                        <p>{`${formatAmount(rewardRatePerDay, 2)} ${farming.rewardToken.symbol} / day`}</p>
                                    </div>
                                    {bonusRewardRatePerDay > 0 && (
                                        <div className="flex w-fit h-fit gap-4 items-center">
                                            <CurrencyLogo className="h-fit" size={32} currency={bonusRewardTokenCurrency} />
                                            <p>{`${formatAmount(bonusRewardRatePerDay, 2)} ${farming.bonusRewardToken?.symbol} / day`}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardInfo>

                <div className="w-full flex gap-3">
                    <Button
                        variant={"primary"}
                        disabled={(!rewardEarnedUSD && !bonusRewardEarnedUSD) || isLoading}
                        onClick={handleHarvestAll}
                        className="w-1/2"
                    >
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
