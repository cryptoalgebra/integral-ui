import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

export interface VotingData {
    currentPeriod: bigint;
    nextPeriod: bigint;
    currentPeriodStart: bigint;
    currentPeriodEnd: bigint;
    isVotingOpen: boolean;
    totalVotes: bigint;
    totalAvailableVotes: bigint;
    epoch: bigint;
    totalEmissions: bigint;
}

export interface RewardToken {
    address: Address;
    amount: bigint;
    amountUsd: number;
    decimals: number;
}

export interface AlgebraGauge {
    gauge: Address;
    votingReward: Address;
    vault: Address;
    isAlgebra: boolean;
    isAlive: boolean;
}

export interface VotingPool extends AlgebraGauge {
    pool: Address;
    token0: Token;
    token1: Token;
    poolVotesDeposited: bigint;
    rewardTokenList: RewardToken[];
}

export interface FormattedVotingPool {
    id: string;
    address: Address;
    gauge: Address;
    token0: Token;
    token1: Token;
    poolVotesDeposited: bigint;
    feesUSD: number;
    incentivesUSD: number;
    totalRewardsUSD: number;
    vApr: number;
    isAlive: boolean;
    tvlUSD: number;
}
