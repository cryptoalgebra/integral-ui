import useSWR from "swr";
import { EternalFarming } from "@/graphql/generated/graphql";
import { CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { Address, formatUnits } from "viem";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { formatAmount } from "@/utils";
import { getUserFarmingRewards } from "@cryptoalgebra/alm-sdk";
import { UserALMVault } from "./useUserALMVaults";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { useAccount } from "wagmi";

export function useALMFarmingRewardsEarned(farming: EternalFarming | undefined, almPosition: UserALMVault) {
    const { address: account } = useAccount();
    const jsonProvider = useEthersProvider();
    const rewardTokenCurrency = useCurrency(farming?.rewardToken as Address);
    const bonusRewardTokenCurrency = useCurrency(farming?.bonusRewardToken as Address);

    const { data: userFarmingRewards } = useSWR(
        account && jsonProvider ? ["farmingRewardsALMEarned", farming?.pool, farming?.nonce, jsonProvider] : null,
        () => getUserFarmingRewards(account!, almPosition.vault.id, jsonProvider!),
        {
            refreshInterval: 10000,
        }
    );

    const farmingRewardsEarned = {
        reward: userFarmingRewards?.get(farming?.rewardToken as Address)?.toBigInt() || 0n,
        bonusReward: userFarmingRewards?.get(farming?.bonusRewardToken as Address)?.toBigInt() || 0n,
    };

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
