import { Farming } from "@/types/farming-info";
import { formatUnits } from "viem";
import { formatAmount } from "@/utils/common/formatAmount";

export function useFarmingRewardRates(farming: Farming) {
    const rewardRate = farming.farming.rewardRate || 0n;
    const bonusRewardRate = farming.farming.bonusRewardRate || 0n;

    const rewardRatePerDay = Number(formatUnits(rewardRate, farming.rewardToken.decimals)) * 60 * 60 * 24;

    const bonusRewardRatePerDay = Number(formatUnits(bonusRewardRate, farming.bonusRewardToken?.decimals)) * 60 * 60 * 24;

    return {
        rewardRatePerDay: formatAmount(rewardRatePerDay.toString(), 4),
        bonusRewardRatePerDay: formatAmount(bonusRewardRatePerDay.toString(), 4),
    };
}
