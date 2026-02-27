import { formatAmount } from "@/utils/common/formatAmount";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useVotingData } from "../../hooks";
import { getTimeUntilTimestamp } from "../../utils";
import { useFormattedVotingPools } from "../../hooks/useFormattedVotingPools";
import { formatUnits } from "viem";
import { TOKENS } from "config/tokens";
import { DEFAULT_CHAIN_ID } from "config/default-chain";

export const VotingTotalStats = () => {
    const [time, setTime] = useState("");
    const { data: votingData, isLoading: votingDataLoading, refetch } = useVotingData();
    const { data: formattedVotingPools, isLoading: formattedVotingPoolsLoading } = useFormattedVotingPools();

    const totalRewardsUSD = formattedVotingPools.reduce((acc, pool) => acc + pool.totalRewardsUSD, 0);

    const totalVotes = votingData ? Number(votingData.totalVotes) : 0;
    const totalAvailableVotes = votingData ? Number(votingData.totalAvailableVotes) : 0;

    const amountVotedThisEpoch = totalAvailableVotes > 0 ? (totalVotes / totalAvailableVotes) * 100 : 0;

    const totalEmissionsThisEpoch = votingData ? formatUnits(votingData.totalEmissions, TOKENS[DEFAULT_CHAIN_ID].TOKEN.decimals) : 0;

    const isLoading = votingDataLoading || formattedVotingPoolsLoading;

    useEffect(() => {
        const interval = setInterval(() => {
            const { days, hours, minutes, seconds } = getTimeUntilTimestamp(votingData?.currentPeriodEnd || 0n);
            let display = "";
            if (days > 0) display += `${days}d `;
            if (days > 0 || hours > 0) display += `${hours}h `;
            display += `${minutes}m ${seconds}s`;

            if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                refetch();
                clearInterval(interval);
            }

            setTime(display.trim());
        }, 1000);
        return () => clearInterval(interval);
    }, [votingData?.currentPeriodEnd, refetch]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-white">
            <div className="flex flex-1 items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 md:flex-col md:items-start md:justify-start md:px-6 md:py-4">
                <div className="whitespace-nowrap text-[16px] md:text-[14px]">Votes Cast</div>
                {!isLoading ? (
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="text-title ml-auto text-[24px] font-semibold md:ml-0 md:text-[28px]">
                            {formatAmount(amountVotedThisEpoch, 4)}%
                        </div>
                    </div>
                ) : (
                    <div className="flex min-h-[42px] items-center">
                        <Skeleton className="w-26 m-auto h-6" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 md:flex-col md:items-start md:justify-start md:px-6 md:py-4">
                <div className="whitespace-nowrap text-[16px] md:text-[14px]">Next Epoch Emissions</div>
                {!isLoading ? (
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="text-title ml-auto text-[24px] font-semibold md:ml-0 md:text-[28px]">
                            {formatAmount(totalEmissionsThisEpoch, 2)} TOKEN
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

            <div className="flex flex-1 items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3 md:flex-col md:items-start md:justify-start md:px-6 md:py-4">
                <div className="whitespace-nowrap text-[16px] md:text-[14px]">
                    <span>Voting </span>
                    <span className="max-md:hidden">for epoch {votingData ? `#${Number(votingData.epoch)}` : ""} </span>
                    <span>ends in</span>
                </div>

                {!isLoading && time ? (
                    <div className="flex w-full flex-col items-center md:flex-row">
                        <div className="text-title ml-auto text-[24px] font-semibold md:ml-0 md:text-[28px]">{time}</div>
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
