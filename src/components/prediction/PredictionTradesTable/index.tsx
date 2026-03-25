import { TradeType } from "@/graphql/generated/graphql";
import { PredictionTrade } from "@/types/prediction";
import { cn } from "@/utils";
import { formatDate } from "@/utils/common/formatDate";
import { useAppKitNetwork } from "@reown/appkit/react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const formatNumber = (value: string, decimals = 6) => {
  return Number(value) / 10 ** decimals;
};

const getTypeLabel = (type: TradeType) => {
  if (type === "BuyYes") return "Buy Yes";
  if (type === "BuyNo") return "Buy No";
  if (type === "SellYes") return "Sell Yes";
  if (type === "SellNo") return "Sell No";
  return type;
};

const getOutcome = (outcome: number, side: string, type: TradeType) => {
  if (["SellNo", "SellYes"].includes(type)) return { label: "Sold", color: "text-gray-400" }
  if (outcome === 0) return { label: "Waiting", color: "text-gray-400" };
  if (
    (outcome === 1 && side === "lower" && type === "BuyYes") ||
    (outcome === 2 && side === "lower" && type === "BuyNo") ||
    (outcome === 1 && side === "greater" && type === "BuyYes") ||
    (outcome === 2 && side === "greater" && type === "BuyNo")
  ) return { label: "Win", color: "text-green-300" };
  return { label: "Lose", color: "text-rose-300" };
};

interface IPredictionTradesTable {
  trades: PredictionTrade[];
}

export default function PredictionTradesTable({ trades }: IPredictionTradesTable) {

   const { caipNetwork: chain } = useAppKitNetwork();
  
  return (
    <div className="w-full">

      <div className="grid grid-cols-[60px_1fr_1fr_1.5fr_1fr_40px] px-4 py-3 text-sm text-gray-400 border-b border-gray-800">
        <div className="text-left">Side</div>
        <div>You Gave</div>
        <div>You Got</div>
        <div>Time</div>
        <div>Outcome</div>
        <div></div>
      </div>

      <div className="divide-y divide-gray-800">
        {trades.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-500">
            No trades yet
          </div>
        )}

        {trades.map((trade) => {
          const outcome = getOutcome(trade.market.outcome, trade.market.condition, trade.type);
          // const mark = formatNumber(trade.market.mark).toFixed(0)

          return (
            <div
              key={trade.id}
              className="grid grid-cols-[60px_1fr_1fr_1.5fr_1fr_40px] px-4 py-3 text-sm items-center hover:bg-black/10 transition"
            >
              {/* <div
                className={
                  cn(
                    "inline-flex items-center gap-1",
                    trade.market.condition === "greater"
                    ? "text-green-300"
                    : "text-rose-300")
                }
              >
                <span>{trade.market.condition === 'lower' ? <ArrowDown size={16} /> : <ArrowUp size={16} /> }</span>
                <span>{mark}</span>
              </div> */}
              <div
                className={
                  cn(
                    "text-left",
                    ["BuyYes", "SellYes"].includes(trade.type)
                    ? "text-lime-400"
                    : "text-orange-400")
                }
              >
                <span>{getTypeLabel(trade.type)}</span>
              </div>

              <div>
                {formatNumber(trade.cost).toFixed(2)} USDC
              </div>

              <div>
                {formatNumber(trade.shares).toFixed(2)} USDC
              </div>

              <div className="text-gray-400">
                {formatDate(new Date(+trade.timestamp * 1000), new Date())}
              </div>

              <div className={`font-medium ${outcome?.color}`}>
                {outcome?.label}
              </div>

              <div className="inline-flex justify-end">
                <Link to={`${chain?.blockExplorers?.default.url}/tx/${trade.txHash}`} target={"_blank"}>
                  <ExternalLink size={16} className="hover:white/70" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}