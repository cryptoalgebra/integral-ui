import { useAlgebraVirtualPoolRewardRates } from "@/generated";
import { Farming } from "@/types/farming-info";
import { formatUnits } from "viem";

export function useFarmingRewardRates(farming: Farming) {
    const { data: rates } = useAlgebraVirtualPoolRewardRates({
        address: farming.farming.virtualPool,
    })

    const [rewardRate, bonusRewardRate] = rates || [0n, 0n];

    const rewardRatePerDay =
        Number(
            formatUnits(
                rewardRate,
                farming.rewardToken.decimals
            )
        ) *
        60 *
        60 *
        24;

    const bonusRewardRatePerDay =
        Number(
            formatUnits(
                bonusRewardRate,
                farming.bonusRewardToken?.decimals
            )
        ) *
        60 *
        60 *
        24;

    const formattedRewardRatePerDay = rewardRatePerDay < 0.01 ? '<0.01' : rewardRatePerDay.toFixed(2)
    const formattedBonusRewardRatePerDay = bonusRewardRatePerDay < 0.01 ? '<0.01' : bonusRewardRatePerDay.toFixed(2)

    return { 
        rewardRatePerDay: formattedRewardRatePerDay,
        bonusRewardRatePerDay: formattedBonusRewardRatePerDay
    }
}