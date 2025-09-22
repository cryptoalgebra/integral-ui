import { FormattedVotingPool } from "../types/voting";

export function optimizeVotes(votingPoolData: FormattedVotingPool[]) {
    // only take top 10 pools by totalRewardsUSD
    const top10Pools = votingPoolData.sort((a, b) => b.totalRewardsUSD - a.totalRewardsUSD).slice(0, 10);
    const valuePerVote = top10Pools.map((pool) => {
        if (pool.currentVotes === 0)
            return {
                pool: pool.address,
                value: 0,
            };
        else {
            return {
                pool: pool.address,
                value: pool.totalRewardsUSD / pool.currentVotes,
            };
        }
    });

    const sortedValuePerVote = valuePerVote.sort((a, b) => b.value - a.value);
    // distribute votes to pools proportional to their value
    const totalVotes = sortedValuePerVote.reduce((acc, pool) => acc + pool.value, 0);
    // Calculate initial allocation with rounding
    const allocation = sortedValuePerVote.reduce((acc, pool) => {
        acc[pool.pool] = Math.round((pool.value / totalVotes) * 100);
        return acc;
    }, {} as Record<string, number>);

    // Ensure total adds up to 100 by adjusting the largest allocation
    const currentTotal = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    const difference = 100 - currentTotal;

    if (difference !== 0) {
        // Find pool with highest allocation to adjust
        const poolsWithValues = Object.entries(allocation);
        const maxPool = poolsWithValues.reduce((max, [pool, value]) => (value > max.value ? { pool, value } : max), {
            pool: poolsWithValues[0][0],
            value: poolsWithValues[0][1],
        });
        allocation[maxPool.pool] += difference;
    }

    return allocation;
}
