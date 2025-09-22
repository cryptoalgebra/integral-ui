import { useReadVeAlgbBalanceOf, useReadVoterGetCurrentPeriod, veAlgbAbi, voterAbi } from "@/generated";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { Address } from "viem";
import { VeALGB } from "../types";
import { VE_ALGB, VOTER } from "config/contract-addresses";

export interface VeAlgbsType {
    isLoading: boolean;
    veALGBs: VeALGB[];
    refetch: () => void;
}
export function useVeALGBs(filterOutEmpty: boolean = true): VeAlgbsType {
    const { address } = useAccount();
    const chainId = useChainId();
    const { data: balanceOf, refetch: refetchBalanceOf } = useReadVeAlgbBalanceOf({
        args: [address as Address],
    });
    const numberOfVeALGBs = balanceOf ? Number(balanceOf) : 0;
    const { data: currentEpoch } = useReadVoterGetCurrentPeriod();
    const nextEpoch = currentEpoch ? Number(currentEpoch) + 1 : 0;

    const { data: tokenIdList, isLoading: isTokenIdListLoading, refetch: refetchTokenIdList } = useReadContracts({
        contracts:
            numberOfVeALGBs == 0
                ? []
                : new Array(numberOfVeALGBs).fill(0).map((_, index) => ({
                      address: VE_ALGB[chainId],
                      abi: veAlgbAbi,
                      functionName: "tokenOfOwnerByIndex",
                      args: [address as Address, index],
                  })),
    });
    const tokenList = (tokenIdList as any)?.map((tokenId: any) => tokenId.result) as bigint[];
    const { data: lockedList, isLoading: isLockedListLoading, refetch: refetchLockedList } = useReadContracts({
        contracts:
            tokenList?.map((tokenId: bigint) => ({
                address: VE_ALGB[chainId],
                abi: veAlgbAbi,
                functionName: "locked",
                args: [tokenId],
            })) || [],
    });

    const { data: balanceList, isLoading: isBalanceListLoading, refetch: refetchBalanceList } = useReadContracts({
        contracts:
            tokenList?.map((tokenId: bigint) => ({
                address: VE_ALGB[chainId],
                abi: veAlgbAbi,
                functionName: "balanceOfNFT",
                args: [tokenId],
            })) || [],
    });

    const { data: votedThisEpochList, refetch: refetchVotedThisEpochList } = useReadContracts({
        contracts:
            tokenList?.map((tokenId: bigint) => ({
                address: VOTER[chainId],
                abi: voterAbi,
                functionName: "checkPeriodVoted",
                args: [nextEpoch, tokenId],
            })) || [],
    });

    const veALGBs = tokenList?.map((tokenId, index) => {
        const lockedRes = (lockedList as any)?.[index]?.result;

        let lockedAmount: bigint | undefined = undefined;
        let lockedEnd: bigint | undefined = undefined;

        if (lockedRes) {
            if (Array.isArray(lockedRes)) {
                lockedAmount = lockedRes?.[0] as bigint;
                lockedEnd = lockedRes?.[1] as bigint;
            } else if (typeof lockedRes === "object") {
                lockedAmount = (lockedRes as any).amount as bigint | undefined;
                lockedEnd = (lockedRes as any).end as bigint | undefined;
            } else if (typeof lockedRes === "bigint") {
                lockedAmount = lockedRes as bigint;
            }
        }

        const balance = (balanceList as any)?.[index]?.result as bigint | undefined;
        const votedThisEpoch = (votedThisEpochList as any)?.[index]?.result as boolean | undefined;

        return {
            tokenId,
            lockedAmount: lockedAmount ?? 0n,
            lockedEnd: lockedEnd ?? 0n,
            balance: balance ?? 0n,
            votedThisEpoch: votedThisEpoch ?? false,
        } as VeALGB;
    });
    return {
        veALGBs: veALGBs?.filter((veALGB: any) => (filterOutEmpty ? Number(veALGB.lockedAmount) > 0 : true)) ?? [],
        isLoading: isTokenIdListLoading || isLockedListLoading || isBalanceListLoading,
        refetch: () => {
            refetchVotedThisEpochList();
            refetchBalanceOf();
            refetchTokenIdList();
            refetchLockedList();
            refetchBalanceList();
        },
    };
}
