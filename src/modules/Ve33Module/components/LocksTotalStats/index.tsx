import { formatAmount } from "@/utils/common/formatAmount";
import { Skeleton } from "@/components/ui/skeleton";
import { useVeTOKENRewards, useVeTOKENs } from "../../hooks";
import { useMemo } from "react";
import { formatUnits } from "viem";

export const LocksTotalStats = () => {
    const { veTOKENs } = useVeTOKENs();
    const { data: veTOKENRewards, isLoading } = useVeTOKENRewards();

    const { totalBalanceVeTOKEN, votingRewardsUSD, rebaseRewardsUSD, totalRewardsUSD } = useMemo(() => {
        const veTOKENsBalance = veTOKENs?.reduce((acc, reward) => acc + reward.balance, 0n) || 0n;
        const totalBalanceVeTOKEN = formatUnits(veTOKENsBalance, 18);

        const votingRewardsUSD =
            veTOKENRewards?.reduce(
                (acc, reward) =>
                    acc +
                    reward.votingRewardList.reduce(
                        (acc, votingReward) =>
                            acc + votingReward.rewardTokenList.reduce((acc, rewardToken) => acc + rewardToken.amountUsd, 0),
                        0
                    ),
                0
            ) || 0;

        const rebaseRewardsUSD = veTOKENRewards?.reduce((acc, reward) => acc + reward.rebaseAmountUsd, 0) || 0;

        const totalRewardsUSD = votingRewardsUSD + rebaseRewardsUSD;

        return {
            votingRewardsUSD,
            rebaseRewardsUSD,
            totalRewardsUSD,
            totalBalanceVeTOKEN,
        };
    }, [veTOKENRewards, veTOKENs]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pb-3 w-full text-white">
            <div className="flex flex-1 items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 md:flex-col md:items-start md:justify-start md:px-6 md:py-4">
                <div className="whitespace-nowrap text-[16px] md:text-[14px]">Total balance</div>
                {!isLoading ? (
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="text-title ml-auto text-[24px] font-semibold md:ml-0 md:text-[28px]">
                            {formatAmount(totalBalanceVeTOKEN, 2)} veTOKEN
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[42px] items-center">
                        <Skeleton className="w-26 m-auto h-6" />
                    </div>
                )}
            </div>
            <div className="flex flex-1 items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 md:flex-col md:items-start md:justify-start md:px-6 md:py-4">
                <div className="whitespace-nowrap text-[16px] md:text-[14px]">Rebase Rewards</div>
                {!isLoading ? (
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="text-title ml-auto text-[24px] font-semibold md:ml-0 md:text-[28px]">
                            ${formatAmount(rebaseRewardsUSD, 2)}
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[42px] items-center">
                        <Skeleton className="w-26 m-auto h-6" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 md:flex-col md:items-start md:justify-start md:px-6 md:py-4">
                <div className="whitespace-nowrap text-[16px] md:text-[14px]">Voting Rewards</div>
                {!isLoading ? (
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="text-title ml-auto text-[24px] font-semibold md:ml-0 md:text-[28px]">
                            ${formatAmount(votingRewardsUSD, 2)}
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[42px] items-center">
                        <Skeleton className="w-26 m-auto h-6" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 md:flex-col md:items-start md:justify-start md:px-6 md:py-4">
                <div className="whitespace-nowrap text-[16px] md:text-[14px]">Total Rewards</div>
                {!isLoading ? (
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="text-title ml-auto text-[24px] text-primary-200 font-semibold md:ml-0 md:text-[28px]">
                            ${formatAmount(totalRewardsUSD, 2)}
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[42px] items-center">
                        <Skeleton className="w-26 m-auto h-6" />
                    </div>
                )}
            </div>
        </div>
    );
};
