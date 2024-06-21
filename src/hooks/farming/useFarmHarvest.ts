import { FARMING_CENTER } from "@/constants/addresses";
import { farmingCenterABI } from "@/generated";
import { getRewardsCalldata } from "@/utils/farming/getRewardsCalldata";
import { Address, useContractWrite, usePrepareContractWrite } from "wagmi";
import { encodeFunctionData } from "viem";
import { Deposit } from "@/graphql/generated/graphql";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useTransactionAwait } from "../common/useTransactionAwait";

export function useFarmHarvest({
    tokenId,
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    account,
}: {
    tokenId: bigint;
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
    nonce: bigint;
    account: Address;
}) {
    const calldata = getRewardsCalldata({
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
        tokenId,
        account,
    });

    const { config } = usePrepareContractWrite({
        address: account && tokenId ? FARMING_CENTER : undefined,
        abi: farmingCenterABI,
        functionName: "multicall",
        args: [calldata],
    });

    const { data: data, writeAsync: onHarvest } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransactionAwait(data?.hash, {
        title: `Farm Harvest`,
        tokenId: tokenId.toString(),
        type: TransactionType.FARM,
    });

    return {
        isLoading,
        isSuccess,
        onHarvest,
    };
}

export function useFarmHarvestAll(
    {
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
        account,
    }: {
        rewardToken: Address;
        bonusRewardToken: Address;
        pool: Address;
        nonce: bigint;
        account: Address;
    },
    deposits: Deposit[]
) {
    const calldatas: Address[] = [];

    deposits.forEach((deposit) => {
        if (deposit.eternalFarming !== null) {
            const rewardsCalldata = getRewardsCalldata({
                rewardToken,
                bonusRewardToken,
                pool,
                nonce,
                tokenId: BigInt(deposit.id),
                account,
            });

            const calldata = encodeFunctionData({
                abi: farmingCenterABI,
                functionName: "multicall",
                args: [rewardsCalldata],
            });
            calldatas.push(calldata);
        }
    });

    const { config } = usePrepareContractWrite({
        address: FARMING_CENTER,
        abi: farmingCenterABI,
        functionName: "multicall",
        args: [calldatas],
    });

    const { data: data, writeAsync: onHarvestAll } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransactionAwait(data?.hash, {
        title: `Harvest All Positions`,
        type: TransactionType.FARM,
        tokenId: "0",
    });

    return {
        isLoading,
        isSuccess,
        onHarvestAll,
    };
}
