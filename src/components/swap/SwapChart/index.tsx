import { useDerivedSwapInfo } from "@/state/swapStore";
import { SwapChartPair, SwapChartPairType, SwapChartSpan, SwapChartSpanType, SwapChartView, SwapChartViewType } from "@/types/swap-chart";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { useSwapChart } from "@/hooks/swap/useSwapChart";

const SwapChart = () => {

    const chartRef = useRef<HTMLDivElement>(null);

    const [chartType, setChartType] = useState<SwapChartViewType>(SwapChartView.CANDLES);
    const [chartSpan, setChartSpan] = useState<SwapChartSpanType>(SwapChartSpan.WEEK);
    const [chartPair, setChartPair] = useState<SwapChartPairType>(SwapChartPair.AB);

    const { currencies } = useDerivedSwapInfo();

    const [tokenA, tokenB] = [currencies.INPUT?.wrapped, currencies.OUTPUT?.wrapped];

    const [chartCreated, setChart] = useState<any | undefined>();
    const [chartData, setChartData] = useState<any | undefined>();

    const { fetchPoolPriceData, fetchTokenPriceData } = useSwapChart();

    const poolAddress = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640";

    // const prevPair = usePrevious(chartPair);

    const tokenAddress = chartPair === SwapChartPair.A ? "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" : "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

    useEffect(() => {
        setChart(undefined);

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
            const [token0Price, token1Price] = chartPair === SwapChartPair.AB ? ["token0Price", "token1Price"] : ["token1Price", "token0Price"];
            return chartData.map((d: any) => {
                return {
                    time: d.periodStartUnix,
                    value: +d[token0Price] / (+d[token1Price] || 1),
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

    // add event listener for resize
    const isClient = typeof window === "object";
    useEffect(() => {
        if (!isClient) {
            return;
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isClient, chartRef, handleResize]); // Empty array ensures that effect is only run on mount and unmount

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
                mode: LightWeightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: "#eaeaea",
            },
            timeScale: {
                borderColor: "#eaeaea",
            },
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
                topColor: "rgba(161, 97, 255, 0.6)",
                bottomColor: "rgba(161, 97, 255, 0.04)",
                lineColor: "rgba(161, 97, 255, 1)",
            });
        }

        series?.setData(formattedData);

        chart.timeScale().fitContent();

        setChart(chart);
    }, [chartRef, chartType, formattedData]);

    const [pairImage, pairTitle] = useMemo(() => {
        if (!tokenA || !tokenB) return [
            undefined, 
            // <Loader stroke="var(--black)" size="16px" />
            'Loading...'
        ];

        switch (chartPair) {
            case SwapChartPair.AB:
                return [
                    <>
                        {/* <CurrencyLogo size="20px" currency={tokenA as WrappedCurrency} />
                        <CurrencyLogo size="20px" currency={tokenB as WrappedCurrency} /> */}
                    </>,
                    `${tokenA.symbol} / ${tokenB.symbol}`,
                ];
            case SwapChartPair.BA:
                return [
                    <>
                        {/* <CurrencyLogo size="20px" currency={tokenB as WrappedCurrency} />
                        <CurrencyLogo size="20px" currency={tokenA as WrappedCurrency} /> */}
                    </>,
                    `${tokenB.symbol} / ${tokenA.symbol}`,
                ];
            case SwapChartPair.A:
                return [
                // <CurrencyLogo size="20px" currency={tokenA as WrappedCurrency} />,
                <></>,
                `${tokenA.symbol}`
            ];
            case SwapChartPair.B:
                return [
                // <CurrencyLogo size="20px" currency={tokenA as WrappedCurrency} />, 
                <></>,
                `${tokenB.symbol}`
            ];
        }
    }, [tokenA, tokenB, chartPair]);

    const handleBlur = useCallback((e: React.ChangeEvent<HTMLLabelElement>) => {
        const target = e.target.control as HTMLInputElement;

        if (!target) return;

        setTimeout(() => (target.checked = false), 100);
    }, []);

    return (
        <div className="limit-order-chart f c w-100 h-100">
            <div className="limit-order-chart-toolbar f f-jb">
                <input id="pair" type="checkbox" className="limit-order-chart-toolbar__pair-checkbox" />
                <label htmlFor="pair" role="button" tabIndex={0} className="limit-order-chart-toolbar__pair-toggler pos-r f f-ac" onBlur={handleBlur}>
                    <span className="f mr-05">{pairImage}</span>
                    <span className="mr-05">{pairTitle}</span>
                    <span className="limit-order-chart-toolbar__pair-toggler-chevron">
                        {/* <ChevronDown size={18} /> */}
                    </span>

                    <ul className="limit-order-chart-toolbar__pair-inner pos-a">
                        <li onClick={() => setChartPair(SwapChartPair.AB)}>{`${tokenA?.symbol} / ${tokenB?.symbol}`}</li>
                        <li onClick={() => setChartPair(SwapChartPair.BA)}>{`${tokenB?.symbol} / ${tokenA?.symbol}`}</li>
                        <li onClick={() => setChartPair(SwapChartPair.A)}>{`${tokenA?.symbol}`}</li>
                        <li onClick={() => setChartPair(SwapChartPair.B)}>{`${tokenB?.symbol}`}</li>
                    </ul>
                </label>
                <div className="limit-order-chart-toolbar__settings f">
                    <div className="limit-order-chart-toolbar__settings-span f mr-1">
                        <button className={`btn mr-05`} data-active={chartSpan === SwapChartSpan.DAY} onClick={() => setChartSpan(SwapChartSpan.DAY)}>
                            1 Day
                        </button>
                        <button className="btn" data-active={chartSpan === SwapChartSpan.WEEK} onClick={() => setChartSpan(SwapChartSpan.WEEK)}>
                            1 Week
                        </button>
                    </div>
                    <div className="limit-order-chart-toolbar__settings-type f">
                        <button className="btn mr-05" data-active={chartType === SwapChartView.CANDLES} onClick={() => setChartType(SwapChartView.CANDLES)}>
                            Candles
                        </button>
                        <button className="btn" data-active={chartType === SwapChartView.LINE} onClick={() => setChartType(SwapChartView.LINE)}>
                            Line
                        </button>
                    </div>
                </div>
            </div>
            <div className={`pos-r f f-ac f-jc full-w full-h ${!chartCreated ? "mxs_p-1" : ""} `} style={{ minHeight: "300px" }}>
                <div className="f f-ac f-jc full-w full-h" ref={chartRef}></div>
                {!chartCreated ? (
                    <div className="pos-a f f-ac f-jc full-w full-h limit-order-chart__loader">
                        {/* <Loader stroke={"var(--black)"} size={"18px"} /> */}
                        Loading...
                    </div>
                ) : null}
            </div>
        </div>
    );

}

export default SwapChart;