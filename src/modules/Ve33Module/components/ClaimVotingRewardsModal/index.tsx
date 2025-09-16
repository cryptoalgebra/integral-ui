import { Address, formatUnits } from "viem";
import { useWriteContract } from "wagmi";
import { useWriteVoterClaimVotingRewardBatch, votingRewardAbi } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { RewardToken } from "../../types/voting";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/utils";
import Loader from "@/components/common/Loader";
import { useCurrency } from "@/hooks/common/useCurrency";
import CurrencyLogo from "@/components/common/CurrencyLogo";

interface IClaimVotingRewardsModal {
    rewards: {
        votingReward: Address;
        rewardTokenList: readonly RewardToken[];
    }[];
    tokenId?: bigint;
    refetch?: () => void;
}

export const ClaimVotingRewardsModal = ({ rewards, tokenId, refetch }: IClaimVotingRewardsModal) => {
    const totalRewardsUSD = rewards.reduce(
        (acc, reward) => acc + reward.rewardTokenList.reduce((acc, token) => acc + token.amountUsd, 0),
        0
    );
    const { writeContractAsync: writeVotingReward, data: claimData, isPending: isClaimPending } = useWriteContract();
    const { writeContractAsync: claimBatch, data: batchClaimData, isPending: isBatchClaimPending } = useWriteVoterClaimVotingRewardBatch();

    const { isLoading: isClaimLoading } = useTransactionAwait(claimData, {
        title: "Claiming voting reward",
        type: TransactionType.FARM,
        callback: refetch,
    });

    const { isLoading: isBatchClaimLoading } = useTransactionAwait(batchClaimData, {
        title: "Claiming all voting rewards",
        type: TransactionType.FARM,
        callback: refetch,
    });

    const handleIndividualClaim = async (votingRewardAddress: Address) => {
        if (!tokenId) return;

        try {
            await writeVotingReward({
                address: votingRewardAddress,
                abi: votingRewardAbi,
                functionName: "getRewardForTokenId",
                args: [tokenId],
            });
        } catch (error) {
            console.error("Error claiming individual reward:", error);
        }
    };

    const handleBatchClaim = async () => {
        if (!tokenId || !rewards) return;

        try {
            const votingRewardAddresses = rewards.map((vr) => vr.votingReward);
            await claimBatch({
                args: [votingRewardAddresses, tokenId],
            });
        } catch (error) {
            console.error("Error claiming batch rewards:", error);
        }
    };

    if (!totalRewardsUSD) return <span>$0</span>;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size={"sm"}>
                    View ${formatAmount(totalRewardsUSD, 2)}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] rounded-xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="font-bold select-none mt-2 max-md:mx-auto">Available Voting Rewards</DialogTitle>
                </DialogHeader>

                <RewardsList
                    rewards={rewards}
                    onClaim={handleIndividualClaim}
                    onClaimAll={handleBatchClaim}
                    isClaimLoading={isClaimLoading || isClaimPending}
                    isBatchClaimLoading={isBatchClaimLoading || isBatchClaimPending}
                />
            </DialogContent>
        </Dialog>
    );
};

const RewardsList = ({
    rewards,
    onClaim,
    onClaimAll,
    isClaimLoading,
    isBatchClaimLoading,
}: {
    rewards: {
        votingReward: Address;
        rewardTokenList: readonly RewardToken[];
    }[];
    onClaim: (votingRewardAddress: Address) => void;
    onClaimAll: () => void;
    isClaimLoading?: boolean;
    isBatchClaimLoading?: boolean;
}) => {
    return (
        <div className="w-full flex flex-col gap-3">
            {rewards.map((rewardContract) => (
                <VotingRewardRow
                    key={rewardContract.votingReward}
                    rewardContract={rewardContract}
                    onClaim={onClaim}
                    isLoading={isClaimLoading}
                />
            ))}
            {rewards.length > 1 && (
                <Button variant="primary" size="sm" className="w-full" onClick={onClaimAll} disabled={isBatchClaimLoading}>
                    {isBatchClaimLoading ? <Loader /> : "Claim All"}
                </Button>
            )}
        </div>
    );
};

const VotingRewardRow = ({
    rewardContract,
    onClaim,
    isLoading,
}: {
    rewardContract: {
        votingReward: Address;
        rewardTokenList: readonly RewardToken[];
    };
    onClaim: (votingRewardAddress: Address) => void;
    isLoading?: boolean;
}) => {
    const rewards = rewardContract.rewardTokenList;
    if (rewards.length === 0) return null;

    const totalUSDValue = rewards.reduce((acc, token) => acc + token.amountUsd, 0);

    return (
        <div className="flex flex-col gap-2 items-center p-3 w-full rounded-lg bg-card-dark">
            {rewards.map((reward) => (
                <TokenRewardRow key={reward.address} reward={reward} />
            ))}

            <Button
                onClick={() => onClaim(rewardContract.votingReward)}
                variant="primary"
                size="sm"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading ? <Loader /> : `Claim $${formatAmount(totalUSDValue, 2)}`}
            </Button>
        </div>
    );
};

const TokenRewardRow = ({ reward }: { reward: RewardToken }) => {
    const currency = useCurrency(reward.address as Address, true);
    const formattedAmount = formatAmount(Number(formatUnits(reward.amount, reward.decimals)), 4);

    return (
        <div className="flex items-center gap-2 w-full justify-between">
            <div className="flex w-fit items-center gap-2">
                <CurrencyLogo currency={currency} size={20} />
                <span>{currency?.symbol}</span>
            </div>
            <span>{formattedAmount}</span>
        </div>
    );
};
