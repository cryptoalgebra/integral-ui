import CurrencyLogo from "@/components/common/CurrencyLogo";
import PageContainer from "@/components/common/PageContainer";
import LiveChip from "@/components/prediction/LiveChip";
import PredictionInfo from "@/components/prediction/PredictionInfo";
import PredictionSideSelector from "@/components/prediction/PredictionSideSelector";
import SwapChart from "@/components/swap/SwapChart";
import { usePool } from "@/hooks/pools/usePool";
import { useSingleMarket } from "@/hooks/prediction/useSingleMarket";
import { useDerivedSwapInfo } from "@/state/swapStore";
import { cn } from "@/utils";
import { formatDateDDMM } from "@/utils/common/formatDate";
import { ChevronLeft, Clock, DollarSign, Users2, BarChart, PauseCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Address, erc20Abi, formatUnits } from "viem";
import { useReadContract } from "wagmi";

const styles = {
    greater: "text-green-300",
    lower: "text-rose-300"
}

const PredictionMarketPage = () => {

    const { market: marketAddress } = useParams() as { market: Address; };

    const { data: market } = useSingleMarket(marketAddress);

    const [action, setAction] = useState<"buy" | "sell">("buy")

    const [, pool] = usePool(market?.pool)

    const marketCurrency = market ? market.marketToken === 0 ? pool?.token0 : pool?.token1 : undefined;
    const quoteCurrency = market ? market.marketToken === 0 ? pool?.token1 : pool?.token0 : undefined;

    const formattedCondition = quoteCurrency && market ? formatUnits(BigInt(market.mark), quoteCurrency.decimals).split(".")[0] : 0;

    const chartLine = market ? market.condition === "greater" ? { greater: 2392, greaterTimestamp: 1773841272 } :  { lower: 1595, lowerTimestamp: 1773841272 }  : undefined

    const { data: marketTVL } = useReadContract({
        address: market?.collateralToken,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [marketAddress]
    })

    const isOpen = market && Number(market.tradingDeadline) * 1000 > Date.now();

    const derivedSwap = useDerivedSwapInfo();

    return <PageContainer>
        <div className="grid grid-flow-col max-md:flex max-md:flex-col-reverse auto-cols-fr w-fit gap-3 mb-8">

            {market && <div className="flex flex-col md:flex-row md:items-center gap-2">
                <div className="flex items-center gap-2">
                    <Link to={'/prediction'}>
                        <ChevronLeft size={28} />
                    </Link>
                    <div className="inline-flex items-center text-xs md:text-2xl font-semibold">
                        <span className="mr-2">Will</span>
                        <CurrencyLogo currency={marketCurrency} size={26} />
                        <span className="ml-2">{`${marketCurrency?.symbol === "WETH" ? "ETH" : marketCurrency?.symbol} be`}</span>
                        <span className={cn("mx-1", styles[market.condition])}>{`${market.condition} than`}</span>
                        <span className="mr-2">{formattedCondition}</span>
                        <CurrencyLogo currency={quoteCurrency} size={26} />
                        <span className="ml-2">{quoteCurrency?.symbol}?</span>
                    </div>
                </div>
                {isOpen && <LiveChip targetDate={+market.plannedResolutionTimestamp * 1000} />}
            </div>}

        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 w-full md:gap-3 gap-y-3 mb-3">
            <div className="flex flex-col gap-2 col-span-1 w-full">
                <div className="py-2 border border-card-border rounded-lg">
                    <div className="flex font-semibold px-2">
                        <button className={cn("border-b-2 pb-2 px-2 transition", action === "buy" ? "border-primary" : "border-transparent hover:border-white/20")} onClick={() => setAction("buy")}>Buy</button>
                        <button className={cn("border-b-2 pb-2 px-2 transition", action === "sell" ? "border-primary" : "border-transparent hover:border-white/20")} onClick={() => setAction("sell")}>Sell</button>
                    </div>
                    <div className="p-2 pb-0 border-t border-card-border">
                        <PredictionSideSelector
                            market={market}
                            action={action}
                        />
                    </div>
                </div>
                {market && <div className="flex flex-col gap-2 text-sm text-white/60">
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <PauseCircle size={16} />
                            Trading ends:
                        </div>
                        <div>{formatDateDDMM(market.tradingDeadline)}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <Clock size={16} />
                            Market resolves:
                        </div>
                        <div>{formatDateDDMM(market.plannedResolutionTimestamp)}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <DollarSign size={16} />
                            TVL:
                        </div>
                        <div>{marketTVL ? `$${formatUnits(marketTVL, 6)}` : ''}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <BarChart size={16} />
                            Volume:
                        </div>
                        <div>{`$${formatUnits(BigInt(market.totalVolume), 6)}`}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <Users2 size={16} />
                            Users:
                        </div>
                        <div>{0}</div>
                    </div>
                </div>}
            </div>
            <div className="flex flex-col col-span-2 md:max-h-[514px]">
                <SwapChart 
                    derivedSwap={derivedSwap} 
                    prediction={chartLine} />
                { market && <PredictionInfo market={market} /> }
            </div>
        </div>
    </PageContainer>

};

export default PredictionMarketPage;