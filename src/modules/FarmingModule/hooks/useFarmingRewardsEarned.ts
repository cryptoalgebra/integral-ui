import useSWR from "swr";
import { getFarmingRewards } from "../utils";
import { Deposit, EternalFarming } from "@/graphql/generated/graphql";
import { ADDRESS_ZERO, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { Address, formatUnits } from "viem";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { formatAmount } from "@/utils";

export function useFarmingRewardsEarned(farming: EternalFarming | undefined, deposits: Deposit[]) {
    const rewardTokenCurrency = useCurrency(farming?.rewardToken as Address);
    const bonusRewardTokenCurrency = useCurrency(farming?.bonusRewardToken as Address);

    const depositsForCurrentFarming = deposits.filter((d) => farming?.id.toLowerCase() === d.eternalFarming?.toLowerCase());

    const { data: farmingRewardsEarned } = useSWR(
        ["farmingRewardsEarned", farming?.pool, farming?.nonce, deposits.map((d) => d.id)],
        async () => {
            if (!deposits?.length || !farming?.pool) return null;

            const results = await Promise.all(
                depositsForCurrentFarming.map((deposit) =>
                    getFarmingRewards({
                        rewardToken: farming.rewardToken as Address,
                        bonusRewardToken: (farming.bonusRewardToken || ADDRESS_ZERO) as Address,
                        pool: farming.pool as Address,
                        nonce: BigInt(farming.nonce),
                        tokenId: BigInt(deposit.id),
                    })
                )
            );

            const total = results.reduce(
                (acc, curr) => {
                    acc.reward += curr.reward;
                    acc.bonusReward += curr.bonusReward;
                    return acc;
                },
                { reward: 0n, bonusReward: 0n }
            );

            return total;
        },
        {
            refreshInterval: 10000,
        }
    );

    const { formatted: rewardEarnedUSD } = useUSDCValue(
        rewardTokenCurrency && CurrencyAmount.fromRawAmount(rewardTokenCurrency?.wrapped, farmingRewardsEarned?.reward.toString() || "0")
    );

    const { formatted: bonusRewardEarnedUSD } = useUSDCValue(
        bonusRewardTokenCurrency &&
            CurrencyAmount.fromRawAmount(bonusRewardTokenCurrency?.wrapped, farmingRewardsEarned?.bonusReward.toString() || "0")
    );

    const totalRewardsEarnedUSD = formatAmount((rewardEarnedUSD || 0) + (bonusRewardEarnedUSD || 0), 2);

    const formattedRewardEarned = Number(formatUnits(farmingRewardsEarned?.reward || 0n, rewardTokenCurrency?.decimals || 18));
    const formattedBonusRewardEarned = Number(
        formatUnits(farmingRewardsEarned?.bonusReward || 0n, bonusRewardTokenCurrency?.decimals || 18)
    );

    return {
        rewardEarned: farmingRewardsEarned?.reward,
        formattedRewardEarned,
        bonusRewardEarned: farmingRewardsEarned?.bonusReward,
        formattedBonusRewardEarned,
        rewardEarnedUSD,
        bonusRewardEarnedUSD,
        totalRewardsEarnedUSD,
    };
}
