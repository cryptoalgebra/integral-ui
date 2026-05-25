import { useCurrency } from "@/hooks/common/useCurrency";
import { PredictionMarket } from "@/modules/PredictionModule/types/prediction";
import { formatDateDDMM } from "@/utils/common/formatDate";
import { formatUnits } from "viem";

export function useMarketStats(market: PredictionMarket | undefined) {
    const collateralToken = useCurrency(market?.collateralToken);

    if (!market)
        return {
            tvl: "",
            volume: "",
            tradingDeadline: 0,
            resolutionDate: 0,
            users: 0,
        };

    return {
        tvl: market.accountedCollateral
            ? `${Number(formatUnits(BigInt(market.accountedCollateral), collateralToken?.decimals || 6)).toFixed(
                  0,
              )} ${collateralToken?.symbol || ""}`
            : "",
        volume: `${Number(formatUnits(BigInt(market.totalVolume), collateralToken?.decimals || 6)).toFixed(0)} ${collateralToken?.symbol ||
            ""}`,
        tradingDeadline: formatDateDDMM(market.tradingDeadline),
        resolutionDate: formatDateDDMM(market.plannedResolutionTimestamp),
        users: market.activeUsers,
    };
}
