import { Address } from "viem";
import { RewardToken } from "./voting";

export interface VeTOKEN {
    tokenId: bigint;
    lockedAmount: bigint;
    lockedEnd: bigint;
    balance: bigint;
    votedThisEpoch: boolean;
}

export interface VeTOKENRewards {
    tokenId: bigint;
    votingRewardList: {
        votingReward: Address;
        rewardTokenList: RewardToken[];
    }[];
    rebaseAmount: bigint;
    rebaseAmountUsd: number;
}

export type ExtendedVePosition = VeTOKEN & VeTOKENRewards;
