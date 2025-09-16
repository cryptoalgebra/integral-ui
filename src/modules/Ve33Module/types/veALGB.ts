import { Address } from "viem";
import { RewardToken } from "./voting";

export interface VeALGB {
    tokenId: bigint;
    lockedAmount: bigint;
    lockedEnd: bigint;
    balance: bigint;
    votedThisEpoch: boolean;
}

export interface VeALGBRewards {
    tokenId: bigint;
    votingRewardList: {
        votingReward: Address;
        rewardTokenList: RewardToken[];
    }[];
    rebaseAmount: bigint;
    rebaseAmountUsd: number;
}

export type ExtendedVePosition = VeALGB & VeALGBRewards;
