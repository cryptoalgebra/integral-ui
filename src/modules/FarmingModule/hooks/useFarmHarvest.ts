import { FARMING_CENTER } from "config";
import { useChainId } from "@/hooks/common/useChainId";
import { Address, encodeFunctionData } from "viem";
import { Deposit } from "@/graphql/generated/graphql";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useWriteFarmingCenterMulticall } from "@/generated";
import { farmingCenterABI } from "config";
import { getRewardsCalldata, getUnclaimedRewardsCalldata } from "../utils";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";

export function useFarmHarvest({
    tokenId,
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    account }: {
    tokenId: bigint;
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
    nonce: bigint;
    account: Address;
}) {
    const chainId = useChainId();

    const calldata = getRewardsCalldata({
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
        tokenId,
        account });

    const config =
        account && tokenId
            ? {
                  address: FARMING_CENTER[chainId],
                  functionName: "multicall",
                  args: [calldata] as const }
            : undefined;

    const { data, writeContractAsync: onHarvest, isPending } = useWriteFarmingCenterMulticall();

    const { isLoading, isSuccess } = useTransactionAwait(data, {
        title: `Harvest Position #${tokenId}`,
        tokenId: tokenId.toString(),
        type: TransactionType.FARM });

    return {
        isLoading: isLoading || isPending,
        isSuccess,
        onHarvest: () => config && onHarvest(config) };
}

export function useFarmHarvestUnclaimed({ rewards, account }: { rewards: Address[]; account: Address }) {
    const calldata = getUnclaimedRewardsCalldata({
        rewards,
        account });

    const config = account
        ? {
              abi: farmingCenterABI,
              functionName: "multicall",
              args: [calldata] as [Address[]],
              account }
        : null;

    const { data, writeContractAsync: onHarvest, isPending } = useWriteFarmingCenterMulticall();

    const { isLoading, isSuccess } = useTransactionAwait(data, {
        title: `Farm Harvest Unclaimed`,
        type: TransactionType.FARM });

    return {
        isLoading: isLoading || isPending,
        isSuccess,
        onHarvestUnclaimed: () => config && onHarvest(config) };
}

export function useFarmHarvestAll(
    {
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
        account }: {
        rewardToken: Address;
        bonusRewardToken: Address;
        pool: Address;
        nonce: bigint;
        account: Address;
    },
    deposits: Deposit[]
) {
    const chainId = useChainId();
    const calldatas: Address[] = [];

    deposits.forEach((deposit) => {
        if (deposit.eternalFarming !== null) {
            const rewardsCalldata = getRewardsCalldata({
                rewardToken,
                bonusRewardToken,
                pool,
                nonce,
                tokenId: BigInt(deposit.id),
                account });

            const calldata = encodeFunctionData({
                abi: farmingCenterABI,
                functionName: "multicall",
                args: [rewardsCalldata] });
            calldatas.push(calldata);
        }
    });

    const config = {
        address: FARMING_CENTER[chainId],
        args: [calldatas] as const };

    const { data, writeContractAsync: onHarvestAll, isPending } = useWriteFarmingCenterMulticall();

    const { isLoading, isSuccess } = useTransactionAwait(data, {
        title: `Harvest All Positions`,
        type: TransactionType.FARM,
        tokenId: "0" });

    return {
        isLoading: isLoading || isPending,
        isSuccess,
        onHarvestAll: () => config && onHarvestAll(config) };
}
