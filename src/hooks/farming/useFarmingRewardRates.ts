import { useAlgebraVirtualPoolRewardRates } from "@/generated";
import { Farming } from "@/types/farming-info";
import { formatUnits } from "viem";
import { formatAmount } from "@/utils/common/formatAmount";

export function useFarmingRewardRates(farming: Farming) {
    const { data: rates } = useAlgebraVirtualPoolRewardRates({
        address: farming.farming.virtualPool,
    });

    const [rewardRate, bonusRewardRate] = rates || [0n, 0n];

    const rewardRatePerDay = Number(formatUnits(rewardRate, farming.rewardToken.decimals)) * 60 * 60 * 24;

    const bonusRewardRatePerDay = Number(formatUnits(bonusRewardRate, farming.bonusRewardToken?.decimals)) * 60 * 60 * 24;

    return {
        rewardRatePerDay: formatAmount(rewardRatePerDay.toString(), 2),
        bonusRewardRatePerDay: formatAmount(bonusRewardRatePerDay.toString(), 2),
    };
}
