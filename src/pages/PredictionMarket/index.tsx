import CurrencyLogo from "@/components/common/CurrencyLogo";
import PageContainer from "@/components/common/PageContainer";
import LiveChip from "@/components/prediction/LiveChip";
import PredictionInfo from "@/components/prediction/PredictionInfo";
import PredictionSideSelector from "@/components/prediction/PredictionSideSelector";
import { PredictionChart } from "@/components/prediction/PredictionChart/prediction-chart";
import { usePool } from "@/hooks/pools/usePool";
import { useMarketStats } from "@/hooks/prediction/useMarketStats";
import { useSingleMarket } from "@/hooks/prediction/useSingleMarket";
import { cn } from "@/utils";
import { ChevronLeft, Clock, DollarSign, Users2, BarChart, PauseCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Address, formatUnits } from "viem";
import { useMarketFiveMinuteData } from "@/hooks/prediction/useMarketFiveMinuteData";
import { Chart } from "@/components/common/Chart";
import { CHART_SPAN, POOL_CHART_TYPE } from "@/types/swap-chart";
import { usePoolChartData } from "@/hooks/analytics";
import { Button } from "@/components/ui/button";
import { useUserPositionByMarket } from "@/hooks/prediction/useUserPositionsByMarket";
import { useAccount } from "wagmi";

const styles = {
    greater: "text-green-300",
    lower: "text-rose-300"
}

const PredictionMarketPage = () => {

    const [searchParams] = useSearchParams();
    const returnLink = searchParams.get("from") as "yes" | "no";
    
    const { market: marketAddress } = useParams() as { market: Address; };
    
    const { address: account } = useAccount();

    const { data: market } = useSingleMarket(marketAddress);
    const { data: userPosition } = useUserPositionByMarket(account, marketAddress)

    const [action, setAction] = useState<"buy" | "sell">("buy")

    const [, pool] = usePool(market?.pool)

    const marketCurrency = market ? market.marketToken === 0 ? pool?.token0 : pool?.token1 : undefined;
    const quoteCurrency = market ? market.marketToken === 0 ? pool?.token1 : pool?.token0 : undefined;

    const formattedCondition = quoteCurrency && market
        ? ((value) => value < 1 ? value.toPrecision(4) : value.toFixed(0))(Number(formatUnits(BigInt(market.mark), quoteCurrency.decimals)))
        : 0;

    const { tvl, volume, users, tradingDeadline, resolutionDate } = useMarketStats(market)

    const isLower = market?.condition === "lower";
    const isOpen = market && Number(market.tradingDeadline) * 1000 > Date.now();

    const isOneHourMarket = Boolean(market && Number(market.plannedResolutionTimestamp) - Number(market.createdAt) <= 3600 * 4);

    const [chartType, setChartType] = useState<"price" | "probability">("price")

    const { data: marketFiveMinuteData, loading: isMarketDataLoading } = useMarketFiveMinuteData(market?.id);
    const { chartData, loading: isChartDataLoading } = usePoolChartData(market?.pool, CHART_SPAN.DAY, POOL_CHART_TYPE.PRICE);

    return <PageContainer>
        <div className="grid grid-flow-col max-md:flex max-md:flex-col-reverse auto-cols-fr w-fit gap-3 mb-8">

            {market && <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                    <Link to={{
                        pathname: `/${returnLink || 'prediction'}`,
                    }}>
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
                {isOpen && <LiveChip showDot={isOneHourMarket} targetDate={+market.plannedResolutionTimestamp * 1000} />}
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
                            isOneHourMarket={isOneHourMarket}
                            userPosition={userPosition}
                        />
                    </div>
                </div>
                {market && <div className="flex flex-col gap-2 text-sm text-white/60">
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <PauseCircle size={16} />
                            Trading ends:
                        </div>
                        <div>{tradingDeadline}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <Clock size={16} />
                            Market resolves:
                        </div>
                        <div>{resolutionDate}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <DollarSign size={16} />
                            TVL:
                        </div>
                        <div>{tvl}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <BarChart size={16} />
                            Volume:
                        </div>
                        <div>${volume}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="inline-flex items-center gap-2 font-semibold">
                            <Users2 size={16} />
                            Users:
                        </div>
                        <div>{users}</div>
                    </div>
                    <div className="text-left pt-2 border-t border-card-border">
                        {`Final price will be taken at the resolve time (${resolutionDate}). Prices during the whole market lifespan don't matter.`}
                    </div>
                    <div className="text-left">
                        {`Source of the price is the ${pool?.token0.symbol === 'WETH' ? 'ETH' : pool?.token0.symbol} / ${pool?.token1.symbol} pool.`}
                    </div>
                </div>}
            </div>
            <div className="flex flex-col gap-4 col-span-2 md:max-h-[514px]">
                <div className="flex items-center gap-1 rounded-xl bg-card-dark border border-card-border p-1 ml-auto mr-auto lg:mr-0 w-fit">
                    <Button
                        size={"sm"}
                        onClick={() => setChartType("price")}
                        variant={"icon"}
                        disabled={chartType === "price"}
                        className={cn(
                            "border rounded-xl disabled:opacity-100 hover:bg-text-100/5",
                            chartType === "price" ? "bg-text-100/5 border-text-100/20" : "border-none"
                        )}
                    >
                        Price
                    </Button>
                    <Button
                        size={"sm"}
                        onClick={() => setChartType("probability")}
                        variant={"icon"}
                        disabled={chartType === "probability"}
                        className={cn(
                            "border rounded-xl disabled:opacity-100 hover:bg-text-100/5",
                            chartType === "probability" ? "bg-text-100/5 border-text-100/20" : "border-none"
                        )}
                    >
                        Chance
                    </Button>
                </div>
                {
                    chartType === "price" ? <Chart
                        chartData={chartData}
                        chartSpan={CHART_SPAN.DAY}
                        chartTitle={POOL_CHART_TYPE.PRICE}
                        chartView={"line"}
                        chartType={POOL_CHART_TYPE.PRICE}
                        setChartType={() => { }}
                        setChartSpan={() => { }}
                        height={260}
                        tokenA={marketCurrency?.symbol}
                        tokenB={quoteCurrency?.symbol}
                        isChartDataLoading={isChartDataLoading}
                        showSpanSelector={false}
                        prediction={
                            market ? 
                                isLower ? 
                                    { lower: +formattedCondition } :
                                    { greater: +formattedCondition } :
                            undefined

                        }
                    /> : <PredictionChart
                        pool={pool}
                        lowerMarket={isLower ? market : undefined}
                        greaterMarket={isLower ? undefined : market}
                        lowerData={isLower ? marketFiveMinuteData : []}
                        greaterData={isLower ? [] : marketFiveMinuteData}
                        currentMarket={market?.condition === "lower" ? "lower" : "greater"}
                        changeMarket={() => { }}
                        loading={isMarketDataLoading}
                    />
                }

                {market && <PredictionInfo market={market} />}
            </div>
        </div>
    </PageContainer>

};

export default PredictionMarketPage;