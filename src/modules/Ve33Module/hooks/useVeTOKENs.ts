import { useReadVotingEscrowBalanceOf, useReadVoterGetCurrentPeriod, votingEscrowAbi, voterAbi } from "@/generated";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { Address } from "viem";
import { VeTOKEN } from "../types";
import { VOTING_ESCROW, VOTER } from "config/contract-addresses";

export interface VeTOKENSType {
    isLoading: boolean;
    veTOKENs: VeTOKEN[];
    refetch: () => void;
}
export function useVeTOKENs(filterOutEmpty: boolean = true): VeTOKENSType {
    const { address } = useAccount();
    const chainId = useChainId();
    const { data: balanceOf, refetch: refetchBalanceOf } = useReadVotingEscrowBalanceOf({
        args: [address as Address],
    });
    const numberOfVeTOKENs = balanceOf ? Number(balanceOf) : 0;
    const { data: currentEpoch } = useReadVoterGetCurrentPeriod();
    const nextEpoch = currentEpoch ? Number(currentEpoch) + 1 : 0;

    const { data: tokenIdList, isLoading: isTokenIdListLoading, refetch: refetchTokenIdList } = useReadContracts({
        contracts:
            numberOfVeTOKENs == 0
                ? []
                : new Array(numberOfVeTOKENs).fill(0).map((_, index) => ({
                      address: VOTING_ESCROW[chainId],
                      abi: votingEscrowAbi,
                      functionName: "tokenOfOwnerByIndex",
                      args: [address as Address, index],
                  })),
    });
    const tokenList = (tokenIdList as any)?.map((tokenId: any) => tokenId.result) as bigint[];
    const { data: lockedList, isLoading: isLockedListLoading, refetch: refetchLockedList } = useReadContracts({
        contracts:
            tokenList?.map((tokenId: bigint) => ({
                address: VOTING_ESCROW[chainId],
                abi: votingEscrowAbi,
                functionName: "locked",
                args: [tokenId],
            })) || [],
    });

    const { data: balanceList, isLoading: isBalanceListLoading, refetch: refetchBalanceList } = useReadContracts({
        contracts:
            tokenList?.map((tokenId: bigint) => ({
                address: VOTING_ESCROW[chainId],
                abi: votingEscrowAbi,
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

    const veTOKENs = tokenList?.map((tokenId, index) => {
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
        } as VeTOKEN;
    });
    return {
        veTOKENs: veTOKENs?.filter((veTOKEN: any) => (filterOutEmpty ? Number(veTOKEN.lockedAmount) > 0 : true)) ?? [],
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
