import { PredictionMarket } from "@/modules/PredictionModule/types/prediction";
import { formatDateDDMM } from "@/utils/common/formatDate";
import { erc20Abi, formatUnits } from "viem";
import { useReadContract } from "wagmi";

export function useMarketStats(market: PredictionMarket | undefined) {
    const { data: tvl } = useReadContract({
        address: market?.collateralToken,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: market ? [market.id] : undefined,
    });

    if (!market)
        return {
            tvl: "",
            volume: "",
            tradingDeadline: 0,
            resolutionDate: 0,
            users: 0,
        };

    return {
        tvl: tvl ? `$${Number(formatUnits(tvl, 6)).toFixed(0)}` : "",
        volume: Number(formatUnits(BigInt(market.totalVolume), 6)).toFixed(0),
        tradingDeadline: formatDateDDMM(market.tradingDeadline),
        resolutionDate: formatDateDDMM(market.plannedResolutionTimestamp),
        users: market.activeUsers,
    };
}
