import { useDerivedSwapInfo } from "@/state/swapStore";
import { SwapChartPair, SwapChartPairType, SwapChartSpan, SwapChartSpanType, SwapChartView, SwapChartViewType } from "@/types/swap-chart";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { useSwapChart } from "@/hooks/swap/useSwapChart";
import { BarChartHorizontalIcon, CandlestickChartIcon, ChevronDownIcon, LineChartIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/common/formatCurrency";
import { Address } from "wagmi";
import { formatUSD } from "@/utils/common/formatUSD";
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/common/Loader";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import MarketDepthChart from "../MarketDepthChart";

const getTokenTitle = (chartPair: SwapChartPairType, currencyA: Currency, currencyB: Currency) => {

    switch (chartPair) {
        case SwapChartPair.AB:
            return [
                <div className="flex">
                    <CurrencyLogo currency={currencyA} size={30} />
                    <CurrencyLogo currency={currencyB} size={30} style={{ marginLeft: '-8px' }} />
                </div>,
                `${currencyA.symbol} / ${currencyB.symbol}`,
            ];
        case SwapChartPair.BA:
            return [
                <div className="flex">
                    <CurrencyLogo currency={currencyB} size={30} />
                    <CurrencyLogo currency={currencyA} size={30} style={{ marginLeft: '-8px' }} />
                </div>,
                `${currencyB.symbol} / ${currencyA.symbol}`,
            ];
        case SwapChartPair.A:
            return [
                <CurrencyLogo currency={currencyA} size={30} />,
                `${currencyA.symbol}`
            ];
        case SwapChartPair.B:
            return [
                <CurrencyLogo currency={currencyB} size={30} />,
                `${currencyB.symbol}`
            ];
    }
}

const mainnetPoolsMapping: { [key: Address]: Address } = {
    ['0x89406233d4290f405eabb6f320fd648276b8b5b7']: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    ['0x9367e79bbc401cec2545b4671a80892a26ae1cd9']: '0x9a772018fbd77fcd2d25657e5c547baff3fd7d16',
    ['0x9f032424a5a4b0effb7fe4912f3e325c105345bc']: '0x3416cf6c708da44db2624d63ea0aaef7113527c6'
}

const mainnetTokensMapping: { [key: Address]: Address } = {
    ['0x20b28b1e4665fff290650586ad76e977eab90c5d']: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ['0x49a390a3dfd2d01389f799965f3af5961f87d228']: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    ['0x5aefba317baba46eaf98fd6f381d07673bca6467']: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    ['0xbc892d5f23d3733cff8986d011ca8ff1249d16ca']: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
}

const SwapChart = () => {

    const chartRef = useRef<HTMLDivElement>(null);

    const [chartType, setChartType] = useState<SwapChartViewType>(SwapChartView.LINE);
    const [chartSpan, setChartSpan] = useState<SwapChartSpanType>(SwapChartSpan.DAY);
    const [chartPair, setChartPair] = useState<SwapChartPairType>(SwapChartPair.AB);

    const { currencies, poolAddress: poolId } = useDerivedSwapInfo();

    const [tokenA, tokenB] = [currencies.INPUT?.wrapped, currencies.OUTPUT?.wrapped];

    const [chartCreated, setChart] = useState<any | undefined>();
    const [series, setSeries] = useState<LightWeightCharts.ISeriesApi<"Area" | "Candlestick"> | undefined>();

    const [displayValue, setDisplayValued] = useState<string>()
    const [displayDate, setDisplayDate] = useState(new Date().toLocaleDateString())

    const [chartData, setChartData] = useState<any | undefined>();

    const { fetchPoolPriceData, fetchTokenPriceData } = useSwapChart();

    const poolAddress = poolId ? mainnetPoolsMapping[poolId] : '';
    const tokenAddress = chartPair === SwapChartPair.A && tokenA ? mainnetTokensMapping[tokenA.address.toLowerCase() as Address] : tokenB ? mainnetTokensMapping[tokenB.address.toLowerCase() as Address] : '';

    const [isMarketDepthOpen, setIsMarketDepthOpen] = useState(false)
    const [isPoolSwitcherOpen, setIsPoolSwitcherOpen] = useState(false)


    useEffect(() => {
        setChart(undefined);

        if ((chartPair === SwapChartPair.AB || chartPair === SwapChartPair.BA) && !poolAddress) return

        if ((chartPair === SwapChartPair.A || chartPair === SwapChartPair.B) && !tokenAddress) return

        let fetchFn: () => Promise<any>;

        if (chartPair === SwapChartPair.AB || chartPair === SwapChartPair.BA) {
            fetchFn = fetchPoolPriceData.bind(null, poolAddress, chartSpan);
        } else {
            fetchFn = fetchTokenPriceData.bind(null, tokenAddress, chartSpan);
        }

        fetchFn().then((res) => {
            if (!res.data || res.error) return;

            setChartData(res.data);
        });
    }, [chartSpan, chartPair, poolAddress, tokenAddress, poolAddress]);

    const formattedData = useMemo(() => {
        if (!chartData || !tokenA || !tokenB) return;

        if (chartType === SwapChartView.CANDLES) {
            const isSorted = chartPair === SwapChartPair.AB;

            return chartData.map((d: any) => {
                return {
                    time: d.periodStartUnix,
                    open: parseFloat(isSorted ? d.open : String(1 / (d.open || 1))),
                    close: parseFloat(isSorted ? d.close : String(1 / (d.close || 1))),
                    high: parseFloat(isSorted ? d.high : String(1 / (d.high || 1))),
                    low: parseFloat(isSorted ? d.low : String(1 / (d.low || 1))),
                };
            });
        }

        if (chartPair === SwapChartPair.AB || chartPair === SwapChartPair.BA) {
            const [token0Price] = chartPair === SwapChartPair.AB ? ["token0Price", "token1Price"] : ["token1Price", "token0Price"];
            return chartData.map((d: any) => {
                return {
                    time: d.periodStartUnix,
                    value: +d[token0Price],
                };
            });
        }

        return chartData.map((d: any) => {
            return {
                time: d.periodStartUnix,
                value: Number(d.priceUSD),
            };
        });
    }, [chartType, chartData, tokenA, tokenB]);

    const handleResize = useCallback(() => {
        if (chartCreated && chartRef?.current?.parentElement) {
            chartCreated.resize(chartRef.current.offsetWidth - 32, chartRef.current.offsetHeight);
            chartCreated.timeScale().fitContent();
            chartCreated.timeScale().scrollToPosition(0, false);
        }
    }, [chartCreated, chartRef, chartRef]);

    const isClient = typeof window === "object";
    useEffect(() => {
        if (!isClient) {
            return;
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isClient, chartRef, handleResize]);

    useLayoutEffect(() => {
        if (!chartRef.current || !formattedData) return;

        if (chartRef.current.hasChildNodes()) chartRef.current.innerHTML = "";

        const chart = LightWeightCharts.createChart(chartRef.current, {
            width: chartRef.current.parentElement?.clientWidth,
            height: chartRef.current.parentElement?.clientHeight || 300,
            layout: {
                background: {
                    color: 'transparent'
                },
                textColor: "black",
            },
            grid: {
                vertLines: {
                    color: "rgba(197, 203, 206, 0.0)",
                },
                horzLines: {
                    color: "rgba(197, 203, 206, 0.0)",
                },
            },
            crosshair: {
                mode: LightWeightCharts.CrosshairMode.Magnet,
            },
            rightPriceScale: {
                visible: false,
                borderColor: "transparent",
            },
            timeScale: {
                visible: false,
                borderColor: "transparent",
            },
            handleScale: {
                mouseWheel: false,
            },
            handleScroll: {
                pressedMouseMove: false,
                vertTouchDrag: false,
                horzTouchDrag: false
            }
        });

        let series;

        if (chartType === SwapChartView.CANDLES) {
            series = chart?.addCandlestickSeries({
                upColor: "#00b124",
                downColor: "#F55755",
                borderDownColor: "#F55755",
                borderUpColor: "#00b124",
                wickDownColor: "#F55755",
                wickUpColor: "#00b124",
            });
        } else {
            series = chart?.addAreaSeries({
                topColor: "rgba(39, 151, 255, 0.6)",
                bottomColor: "rgba(39, 151, 255, 0)",
                lineColor: "rgba(39, 151, 255, 1)",
            });
        }

        series?.setData(formattedData);

        chart.timeScale().fitContent();

        setChart(chart);
        setSeries(series);
    }, [chartRef, chartType, formattedData]);

    const currentValue = useMemo(() => {
        if (!formattedData) return ''

        const value = formattedData[formattedData.length - 1].value;

        if (chartPair === SwapChartPair.AB || chartPair === SwapChartPair.BA) {
            return formatCurrency.format(value)
        }

        return formatUSD.format(value)
    }, [formattedData, chartPair])

    const displayValueCurrency = chartPair === SwapChartPair.AB ? currencies.OUTPUT?.symbol : chartPair === SwapChartPair.BA ? currencies.INPUT?.symbol : chartPair === SwapChartPair.A || chartPair === SwapChartPair.B ? '' : ''

    const crosshairMoveHandler = useCallback((param: any) => {
        if (param.point) {
            const formatter = chartPair === SwapChartPair.AB || chartPair === SwapChartPair.BA ? formatCurrency : formatUSD
            setDisplayValued(formatter.format(param.seriesData.get(series).value))
            setDisplayDate(new Date(param.time * 1000).toLocaleDateString())
        } else {
            setDisplayDate(new Date().toLocaleDateString())
            setDisplayValued(currentValue)
        }
    }, [series, currentValue, chartPair])

    useEffect(() => {
        if (!chartCreated) return
        chartCreated.subscribeCrosshairMove(crosshairMoveHandler)
        return () => chartCreated.unsubscribeCrosshairMove(crosshairMoveHandler)
    }, [chartCreated])

    useEffect(() => {
        setDisplayValued(currentValue)
    }, [currentValue])

    const [pairImage, pairTitle] = useMemo(() => {
        if (!currencies.INPUT || !currencies.OUTPUT) return [
            <Loader size={16} />,
            'Loading...'
        ];

        return getTokenTitle(chartPair, currencies.INPUT, currencies.OUTPUT)

    }, [currencies, chartPair]);

    const pairSelectorList = useMemo(() => {

        if (!currencies.INPUT || !currencies.OUTPUT) return

        return Object.keys(SwapChartPair).filter(v => v !== chartPair).map((pair: any) => ({
            pair,
            title: getTokenTitle(pair, currencies.INPUT!, currencies.OUTPUT!)
        }))
    }, [currencies.INPUT, currencies.OUTPUT, chartPair])

    return (<div className="flex flex-col gap-6 w-full h-full relative">

        <MarketDepthChart currencyA={tokenA} currencyB={tokenB} poolAddress={poolId} isOpen={isMarketDepthOpen} close={() => setIsMarketDepthOpen(false)} />

        <div className="flex flex-col md:flex-row gap-4 justify-between">

            <Popover open={isPoolSwitcherOpen}>
                <PopoverTrigger
                    onMouseDown={() => setIsPoolSwitcherOpen(v => !v)}
                    className="flex items-center justify-between w-fit min-w-[240px] py-2 px-4 rounded-3xl bg-card border border-card-border hover:bg-card-hover duration-200">
                    <div className="flex items-center gap-4 font-semibold">
                        <span className="flex">{pairImage}</span>
                        <span>{pairTitle}</span>
                    </div>
                    <div>
                        <ChevronDownIcon size={20} className={`duration-300 ${isPoolSwitcherOpen ? 'rotate-180' : ''}`} />
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    onPointerDownOutside={() => setTimeout(() => setIsPoolSwitcherOpen(false), 0)}
                    className="bg-card rounded-3xl border border-card-border">
                    <div className="flex flex-col gap-2 text-white">
                        {
                            pairSelectorList?.map((item) => <div
                                key={`chart-pair-selector-item-${item.pair}`}
                                className="flex items-center gap-2 min-h-[40px] text-white font-semibold p-2 px-4 rounded-2xl cursor-pointer hover:bg-card-hover duration-200"
                                onClick={() => {
                                    setChartPair(item.pair)
                                    setIsPoolSwitcherOpen(false)
                                }}>{item.title}</div>)
                        }
                    </div>
                </PopoverContent>
            </Popover>
            <div className="flex gap-4 w-fit p-2 bg-card border border-card-border rounded-3xl">
                <div className="flex gap-2">
                    <Button variant={chartSpan === SwapChartSpan.DAY ? 'iconActive' : 'icon'} size={'icon'} onClick={() => setChartSpan(SwapChartSpan.DAY)}>
                        1D
                    </Button>
                    <Button variant={chartSpan === SwapChartSpan.WEEK ? 'iconActive' : 'icon'} size={'icon'} onClick={() => setChartSpan(SwapChartSpan.WEEK)}>
                        1W
                    </Button>
                    <Button variant={chartSpan === SwapChartSpan.MONTH ? 'iconActive' : 'icon'} size={'icon'} onClick={() => setChartSpan(SwapChartSpan.MONTH)}>
                        1M
                    </Button>
                </div>
                <div className="self-center w-[1px] h-3/6 border border-card-border/40"></div>
                <div className="flex gap-2">
                    <Button variant={chartType === SwapChartView.LINE ? 'iconActive' : 'icon'} size={'icon'} onClick={() => setChartType(SwapChartView.LINE)}>
                        <LineChartIcon size={20} />
                    </Button>
                    <HoverCard>
                        <HoverCardTrigger>
                            <Button variant={chartType === SwapChartView.CANDLES ? 'iconActive' : 'icon'} size={'icon'} onClick={() => setChartType(SwapChartView.CANDLES)} disabled>
                                <CandlestickChartIcon size={20} />
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <div className="font-bold">Candlestick chart</div>
                            <div>Coming Soon</div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
                <div className="self-center w-[1px] h-3/6 border border-card-border/40"></div>
                <HoverCard>
                    <HoverCardTrigger>
                        <Button variant={isMarketDepthOpen ? 'iconActive' : 'icon'} size={'icon'} onClick={() => setIsMarketDepthOpen(v => !v)}>
                            <BarChartHorizontalIcon size={20} />
                        </Button>
                    </HoverCardTrigger>
                    <HoverCardContent>
                        <div className="font-bold">Market Depth</div>
                    </HoverCardContent>
                </HoverCard>
            </div>
        </div>
        <div className={`flex items-center justify-center relative w-full h-[300px]`}>

            <div className="flex items-center justify-center w-full h-full" ref={chartRef}></div>

            <div className="absolute right-0 top-0 flex flex-col items-end w-full text-3xl text-right">
                {chartCreated ? <>
                    <div className="text-3xl font-bold">
                        <span>{displayValue ? displayValue : currentValue ? currentValue : <Loader size={18} />}</span>
                        <span className="ml-2">{displayValueCurrency && displayValueCurrency}</span>
                    </div>
                    <div className="text-[#b7b7b7] text-sm">
                        {displayValue ? displayDate : null}
                    </div>
                </> : <>
                    <Skeleton className="w-[150px] h-[38px] bg-card" />
                    <Skeleton className="w-[60px] h-[18px] bg-card mt-[2px]" />
                </>}
            </div>
            
            {!chartCreated ? (
                <div className="flex items-center justify-center absolute w-full h-full">
                    <Loader />
                </div>
            ) : null}

        </div>
    </div>
    );

}

export default SwapChart;