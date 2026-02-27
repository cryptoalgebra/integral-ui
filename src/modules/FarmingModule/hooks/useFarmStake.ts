import { FARMING_CENTER } from "config";
import { Address, encodeFunctionData } from "viem";
import { MaxUint128 } from "@cryptoalgebra/integral-sdk";
import { useFarmCheckApprove } from "./useFarmCheckApprove";
import { useEffect, useState } from "react";
import { Deposit } from "@/graphql/generated/graphql";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useChainId } from "wagmi";
import { useWriteFarmingCenterEnterFarming, useWriteFarmingCenterMulticall } from "@/generated";
import { farmingCenterABI } from "config/abis";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { useClients } from "@/hooks/graphql/useClients";

export function useFarmStake({
    tokenId,
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
}: {
    tokenId: bigint;
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
    nonce: bigint;
}) {
    const chainId = useChainId();

    const { farmingClient } = useClients();

    const { approved } = useFarmCheckApprove(tokenId);

    const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);

    const address = tokenId && approved ? FARMING_CENTER[chainId] : undefined;

    const config = address
        ? {
              address,
              functionName: "enterFarming",
              args: [
                  {
                      rewardToken,
                      bonusRewardToken,
                      pool,
                      nonce,
                  },
                  tokenId,
              ] as const,
          }
        : undefined;

    const { data: data, writeContractAsync: onStake, isPending } = useWriteFarmingCenterEnterFarming();

    const { isLoading, isSuccess } = useTransactionAwait(data, {
        title: `Stake Position #${tokenId}`,
        tokenId: tokenId.toString(),
        type: TransactionType.FARM,
    });

    useEffect(() => {
        if (!isSuccess) return;

        setIsQueryLoading(true);
        const interval: NodeJS.Timeout = setInterval(
            () =>
                farmingClient.refetchQueries({
                    include: ["Deposits"],
                    onQueryUpdated: (query, { result: diff }) => {
                        const currentPos = diff.deposits.find((deposit: Deposit) => deposit.id.toString() === tokenId.toString());
                        if (!currentPos) return;

                        if (currentPos.eternalFarming !== null) {
                            setIsQueryLoading(false);
                            clearInterval(interval);
                        } else {
                            query.refetch().then();
                        }
                    },
                }),
            2000
        );

        return () => clearInterval(interval);
    }, [isSuccess]);

    return {
        isLoading: isQueryLoading || isLoading || isPending,
        isSuccess,
        onStake: () => config && onStake(config),
    };
}

export function useFarmUnstake({
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
    const chainId = useChainId();

    const { farmingClient } = useClients();

    const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);

    const exitFarmingCalldata = encodeFunctionData({
        abi: farmingCenterABI,
        functionName: "exitFarming",
        args: [
            {
                rewardToken,
                bonusRewardToken,
                pool,
                nonce,
            },
            tokenId,
        ],
    });

    const rewardClaimCalldata = encodeFunctionData({
        abi: farmingCenterABI,
        functionName: "claimReward",
        args: [rewardToken, account, BigInt(MaxUint128)],
    });

    const bonusRewardClaimCalldata = encodeFunctionData({
        abi: farmingCenterABI,
        functionName: "claimReward",
        args: [bonusRewardToken, account, BigInt(MaxUint128)],
    });

    const calldatas = [exitFarmingCalldata, rewardClaimCalldata, bonusRewardClaimCalldata];

    const config =
        account && tokenId
            ? {
                  address: FARMING_CENTER[chainId],
                  args: [calldatas] as const,
              }
            : undefined;

    const { data, writeContractAsync: onUnstake, isPending } = useWriteFarmingCenterMulticall();

    const { isLoading, isSuccess } = useTransactionAwait(data, {
        title: `Unstake Position #${tokenId}`,
        tokenId: tokenId.toString(),
        type: TransactionType.FARM,
    });

    useEffect(() => {
        if (!isSuccess) return;

        setIsQueryLoading(true);
        const interval: NodeJS.Timeout = setInterval(
            () =>
                farmingClient.refetchQueries({
                    include: ["Deposits"],
                    onQueryUpdated: (query, { result: diff }) => {
                        const currentPos = diff.deposits.find((deposit: Deposit) => deposit.id.toString() === tokenId.toString());
                        if (!currentPos) return;

                        if (currentPos.eternalFarming === null) {
                            setIsQueryLoading(false);
                            clearInterval(interval);
                        } else {
                            query.refetch().then();
                        }
                    },
                }),
            2000
        );

        return () => clearInterval(interval);
    }, [isSuccess]);

    return {
        isLoading: isLoading || isQueryLoading || isPending,
        isSuccess,
        onUnstake: () => config && onUnstake(config),
    };
}
