import PageContainer from "@/components/common/PageContainer";
import Card from "@/components/common/Card";
import { InputModeV2, TimePeriodV2 } from "@/components/Charts/D3LiquidityRangeInputV2";
import { ADDRESS_ZERO, CurrencyAmount, Position, ZERO, tickToPrice } from "@cryptoalgebra/custom-pools-sdk";
import { useEffect, useMemo, useState } from "react";
import { usePositions } from "@/hooks/positions/usePositions";
import { useAccount } from "wagmi";
import { useParams } from "react-router-dom";
import { Address, parseUnits } from "viem";
import { useDensityChartData } from "@/components/create-position/LiquidityChart/hooks";
import { usePoolChartData } from "@/hooks/analytics";
import { CHART_SPAN, POOL_CHART_TYPE } from "@/types/swap-chart";
import useSWR from "swr";
import { fetcher, POOL_AVG_APR_API } from "config/apr-urls";
import { usePool } from "@/hooks/pools/usePool";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { createUncheckedPosition } from "@/utils/positions/createUncheckedPosition";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import JSBI from "jsbi";
import { getPositionFees } from "@/utils/positions/getPositionFees";
import { getPositionAPR } from "@/utils/positions/getPositionAPR";
import { useSinglePositionLazyQuery } from "@/graphql/generated/graphql";
import { usePositionNamesStore } from "@/state/positionNamesStore";
import { MiddleView } from "./types";
import PoolWorkspaceLayout from "./layouts/PoolWorkspaceLayout";
import MyPositionsSidebar from "./components/MyPositionsSidebar";
import NewPositionStepperSidebar from "./components/NewPositionStepperSidebar";
import PoolMiddleContent from "./components/PoolMiddleContent";
import FarmingModule from "@/modules/FarmingModule";

const { useActiveFarming } = FarmingModule.hooks;
const ensurePositionWord = (name: string) => (/position/i.test(name) ? name : `${name} Position`);
const calculatePercentChange = (current: number, previous: number): number | null => {
    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;

    return ((current - previous) / Math.abs(previous)) * 100;
};

const PoolNewPage = () => {
    const [middleView, setMiddleView] = useState<MiddleView>("POOL_INFO");
    const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
    const { address: account } = useAccount();
    const { pool } = useParams() as { pool?: Address };
    const farmingPoolId = pool ?? ADDRESS_ZERO;
    const [, poolEntity] = usePool(pool);
    const { positionNames } = usePositionNamesStore();
    const { formatted: token0PriceUSD } = useUSDCPrice(poolEntity?.token0);
    const { formatted: token1PriceUSD } = useUSDCPrice(poolEntity?.token1);
    const [chartInputMode, setChartInputMode] = useState<InputModeV2>("price");
    const [chartTimePeriod, setChartTimePeriod] = useState<TimePeriodV2>("1M");
    const [chartIsFullRange, setChartIsFullRange] = useState(false);
    const [chartMinPrice, setChartMinPrice] = useState<number | undefined>();
    const [chartMaxPrice, setChartMaxPrice] = useState<number | undefined>();
    const { positions, loading: positionsLoading } = usePositions();
    const { poolDayDatas, loading: poolStatsLoading } = usePoolChartData(pool, CHART_SPAN.MONTH, POOL_CHART_TYPE.TVL);
    const { chartData: poolPriceChartData, loading: poolPriceLoading } = usePoolChartData(pool, CHART_SPAN.MONTH, POOL_CHART_TYPE.PRICE);
    const { data: poolsAvgApr, isLoading: poolAprLoading } = useSWR<Record<string, number>>(POOL_AVG_APR_API, fetcher);
    const { formattedData: densityData, isLoading: densityLoading } = useDensityChartData({
        pool: poolEntity,
        isSorted: true,
    });
    const [getSinglePosition] = useSinglePositionLazyQuery();
    const { farmingInfo, deposits } = useActiveFarming({ poolId: farmingPoolId });

    const poolPositions = useMemo(() => {
        if (!positions || !pool) return [];

        return positions.filter((position) => position.pool.toLowerCase() === pool.toLowerCase());
    }, [positions, pool]);

    const selectedPosition = useMemo(() => {
        if (!selectedPositionId) return null;

        return poolPositions.find((position) => position.tokenId.toString() === selectedPositionId) || null;
    }, [poolPositions, selectedPositionId]);
    const selectedSdkPosition = useMemo<Position | null>(() => {
        if (!selectedPosition || !poolEntity) return null;

        return createUncheckedPosition(
            poolEntity,
            selectedPosition.liquidity.toString(),
            Number(selectedPosition.tickLower),
            Number(selectedPosition.tickUpper)
        );
    }, [selectedPosition, poolEntity]);
    const selectedPositionName = selectedPosition
        ? ensurePositionWord(positionNames[selectedPosition.tokenId.toString()] || `Position #${selectedPosition.tokenId.toString()}`)
        : null;
    const token0 = poolEntity ? unwrappedToken(poolEntity.token0) : undefined;
    const token1 = poolEntity ? unwrappedToken(poolEntity.token1) : undefined;
    const token0Address = token0 ? ((token0.isNative ? ADDRESS_ZERO : token0.wrapped.address) as Address) : undefined;
    const token1Address = token1 ? ((token1.isNative ? ADDRESS_ZERO : token1.wrapped.address) as Address) : undefined;
    const selectedRange = useMemo(() => {
        if (!selectedPosition || !token0 || !token1) return { min: undefined, max: undefined };

        const priceLower = Number(tickToPrice(token0.wrapped, token1.wrapped, Number(selectedPosition.tickLower)).toSignificant(18));
        const priceUpper = Number(tickToPrice(token0.wrapped, token1.wrapped, Number(selectedPosition.tickUpper)).toSignificant(18));

        if (!Number.isFinite(priceLower) || !Number.isFinite(priceUpper)) return { min: undefined, max: undefined };

        return {
            min: Math.min(priceLower, priceUpper),
            max: Math.max(priceLower, priceUpper),
        };
    }, [selectedPosition, token0, token1]);

    const sdkPoolPositions = useMemo(() => {
        if (!poolEntity || !poolPositions.length) return [];

        return poolPositions.map((position) => ({
            id: position.tokenId.toString(),
            sdkPosition: createUncheckedPosition(
                poolEntity,
                position.liquidity.toString(),
                Number(position.tickLower),
                Number(position.tickUpper)
            ),
        }));
    }, [poolEntity, poolPositions]);

    const positionTVLById = useMemo<Record<string, number>>(() => {
        if (!sdkPoolPositions.length) return {};

        return Object.fromEntries(
            sdkPoolPositions.map(({ id, sdkPosition }) => {
                const amount0USD = Number(sdkPosition.amount0.toSignificant(24)) * token0PriceUSD;
                const amount1USD = Number(sdkPosition.amount1.toSignificant(24)) * token1PriceUSD;

                return [id, amount0USD + amount1USD];
            })
        );
    }, [sdkPoolPositions, token0PriceUSD, token1PriceUSD]);
    const positionOnFarmingById = useMemo<Record<string, boolean>>(() => {
        const activeFarmingIds = new Set(
            (deposits?.deposits ?? [])
                .filter((deposit) => Boolean(deposit.eternalFarming))
                .map((deposit) => Number(deposit.id).toString())
        );

        return Object.fromEntries(poolPositions.map((position) => [position.tokenId.toString(), activeFarmingIds.has(position.tokenId.toString())]));
    }, [deposits?.deposits, poolPositions]);
    const selectedPositionTVL = selectedPosition ? positionTVLById[selectedPosition.tokenId.toString()] : undefined;
    const selectedPositionOnFarming = selectedPosition ? Boolean(positionOnFarmingById[selectedPosition.tokenId.toString()]) : false;
    const selectedPositionFarmingDeposit = selectedPosition
        ? deposits?.deposits?.find(
              (deposit) => Number(deposit.id) === selectedPosition.tokenId && Boolean(deposit.eternalFarming)
          ) || null
        : null;

    const aprKey = useMemo(
        () =>
            sdkPoolPositions.map(({ id, sdkPosition }) => [
                id,
                sdkPosition.liquidity.toString(),
                sdkPosition.tickLower,
                sdkPosition.tickUpper,
            ]),
        [sdkPoolPositions]
    );

    const { data: positionAPRById } = useSWR(
        ["poolNewPositionAPR", aprKey, account],
        async () => {
            if (!account || !sdkPoolPositions.length) return {} as Record<string, number>;

            const aprEntries = await Promise.all(
                sdkPoolPositions.map(async ({ id, sdkPosition }) => {
                    if (JSBI.equal(sdkPosition.liquidity, ZERO)) return [id, 0] as const;

                    const [feeAmount0, feeAmount1] = await getPositionFees(sdkPosition.pool, Number(id), account);
                    const result = await getSinglePosition({ variables: { tokenId: id } });
                    const singlePosition = result?.data?.position;

                    if (!singlePosition?.transaction?.timestamp) return [id, 0] as const;

                    const collectedFees0 = CurrencyAmount.fromRawAmount(
                        sdkPosition.pool.token0,
                        parseUnits(singlePosition.collectedFeesToken0, sdkPosition.pool.token0.decimals).toString()
                    );
                    const collectedFees1 = CurrencyAmount.fromRawAmount(
                        sdkPosition.pool.token1,
                        parseUnits(singlePosition.collectedFeesToken1, sdkPosition.pool.token1.decimals).toString()
                    );

                    const apr = getPositionAPR(
                        sdkPosition.amount0,
                        sdkPosition.amount1,
                        feeAmount0,
                        feeAmount1,
                        collectedFees0,
                        collectedFees1,
                        sdkPosition.pool.token0Price,
                        new Date(Number(singlePosition.transaction.timestamp) * 1000).getTime()
                    );

                    return [id, apr] as const;
                })
            );

            return Object.fromEntries(aprEntries);
        },
        {
            refreshInterval: 10000,
            keepPreviousData: true,
        }
    );
    const selectedPositionAPR = selectedPosition ? positionAPRById?.[selectedPosition.tokenId.toString()] : undefined;

    const currentPoolDayData = useMemo(() => {
        if (!poolDayDatas.length) return null;

        return poolDayDatas[poolDayDatas.length - 1];
    }, [poolDayDatas]);
    const previousPoolDayData = useMemo(() => {
        if (poolDayDatas.length < 2) return null;

        return poolDayDatas[poolDayDatas.length - 2];
    }, [poolDayDatas]);

    const poolInformation = useMemo(() => {
        if (!pool) {
            return {
                tvlUSD: 0,
                volume24HUSD: 0,
                fees24HUSD: 0,
                averageApr: 0,
            };
        }

        const averageApr = poolsAvgApr?.[pool.toLowerCase()] || 0;

        return {
            tvlUSD: Number(currentPoolDayData?.tvlUSD || 0),
            volume24HUSD: Number(currentPoolDayData?.volumeUSD || 0),
            fees24HUSD: Number(currentPoolDayData?.feesUSD || 0),
            averageApr,
        };
    }, [pool, currentPoolDayData, poolsAvgApr]);
    const poolInformationChange = useMemo(() => {
        if (!currentPoolDayData || !previousPoolDayData) {
            return {
                tvlUSD: null,
                volume24HUSD: null,
                fees24HUSD: null,
            };
        }

        return {
            tvlUSD: calculatePercentChange(Number(currentPoolDayData.tvlUSD || 0), Number(previousPoolDayData.tvlUSD || 0)),
            volume24HUSD: calculatePercentChange(Number(currentPoolDayData.volumeUSD || 0), Number(previousPoolDayData.volumeUSD || 0)),
            fees24HUSD: calculatePercentChange(Number(currentPoolDayData.feesUSD || 0), Number(previousPoolDayData.feesUSD || 0)),
        };
    }, [currentPoolDayData, previousPoolDayData]);
    const poolState = useMemo(() => {
        const token0Amount = Number(currentPoolDayData?.pool?.totalValueLockedToken0 || 0);
        const token1Amount = Number(currentPoolDayData?.pool?.totalValueLockedToken1 || 0);
        const txCount = Number(currentPoolDayData?.pool?.txCount || 0);

        return {
            liquidityUSD: Number(currentPoolDayData?.tvlUSD || 0),
            token0Amount,
            token1Amount,
            token0PriceUSD: Number(token0PriceUSD || 0),
            token1PriceUSD: Number(token1PriceUSD || 0),
            txCount,
        };
    }, [currentPoolDayData, token0PriceUSD, token1PriceUSD]);

    const poolLabel = token0 && token1 ? `${token0.symbol} / ${token1.symbol}` : "Pool";
    const v2PriceData = useMemo(() => {
        return poolPriceChartData.map((point) => ({
            time: Number(point.time),
            value: point.value,
            open: point.value,
            high: point.value,
            low: point.value,
            close: point.value,
        }));
    }, [poolPriceChartData]);
    const v2LiquidityData = useMemo(() => {
        return (densityData ?? []).map((item, index) => ({
            tick: item.tick ?? index,
            price0: item.price0,
            activeLiquidity: item.activeLiquidity,
        }));
    }, [densityData]);
    const chartCurrentPrice = v2PriceData[v2PriceData.length - 1]?.value;
    const chartReady = v2PriceData.length > 1 && v2LiquidityData.length > 1;
    const currentPoolTick = poolEntity?.tickCurrent;
    const currentPoolPrice =
        token0 && token1 && typeof currentPoolTick === "number"
            ? Number(tickToPrice(token0.wrapped, token1.wrapped, currentPoolTick).toSignificant(18))
            : undefined;

    useEffect(() => {
        if (middleView !== "POSITION" && selectedPositionId !== null) {
            setSelectedPositionId(null);
        }
    }, [middleView, selectedPositionId]);

    useEffect(() => {
        if (!poolPositions.length) {
            setSelectedPositionId(null);
            if (middleView === "POSITION") {
                setMiddleView("POOL_INFO");
            }
            return;
        }

        const hasSelectedPosition = selectedPositionId
            ? poolPositions.some((position) => position.tokenId.toString() === selectedPositionId)
            : false;

        if (!hasSelectedPosition) {
            setSelectedPositionId(null);
            if (middleView === "POSITION") {
                setMiddleView("POOL_INFO");
            }
        }
    }, [poolPositions, selectedPositionId, middleView]);

    return (
        <PageContainer>
            <div className="w-full">
                <Card>
                    <div className="w-full p-0">
                        <div className="mt-0 flex w-full flex-col lg:flex-row gap-2 min-h-[640px]">
                            <PoolWorkspaceLayout
                                left={
                                    middleView === "NEW_POSITION" ? (
                                        <NewPositionStepperSidebar
                                            poolId={pool}
                                            token0Address={token0Address}
                                            token1Address={token1Address}
                                            chartMinPrice={chartMinPrice}
                                            chartMaxPrice={chartMaxPrice}
                                            setMiddleView={setMiddleView}
                                            token0={token0}
                                            token1={token1}
                                            poolLabel={poolLabel}
                                        />
                                    ) : (
                                        <MyPositionsSidebar
                                            account={account}
                                            positionsLoading={positionsLoading}
                                            poolPositions={poolPositions}
                                            selectedPositionId={selectedPositionId}
                                            setSelectedPositionId={setSelectedPositionId}
                                            setMiddleView={setMiddleView}
                                            currentPoolPrice={currentPoolPrice}
                                            token0={token0}
                                            token1={token1}
                                            poolLabel={poolLabel}
                                            positionTVLById={positionTVLById}
                                            positionOnFarmingById={positionOnFarmingById}
                                            positionAPRById={positionAPRById}
                                            positionNames={positionNames}
                                        />
                                    )
                                }
                                middle={
                                    <PoolMiddleContent
                                        poolId={pool}
                                        middleView={middleView}
                                        poolPriceLoading={poolPriceLoading}
                                        densityLoading={densityLoading}
                                        chartReady={chartReady}
                                        v2PriceData={v2PriceData}
                                        v2LiquidityData={v2LiquidityData}
                                        token0Symbol={token0?.symbol}
                                        token1Symbol={token1?.symbol}
                                        token0Address={token0Address}
                                        token1Address={token1Address}
                                        chartCurrentPrice={chartCurrentPrice}
                                        chartMinPrice={chartMinPrice}
                                        chartMaxPrice={chartMaxPrice}
                                        chartInputMode={chartInputMode}
                                        chartTimePeriod={chartTimePeriod}
                                        chartIsFullRange={chartIsFullRange}
                                        setChartMinPrice={setChartMinPrice}
                                        setChartMaxPrice={setChartMaxPrice}
                                        setChartInputMode={setChartInputMode}
                                        setChartTimePeriod={setChartTimePeriod}
                                        setChartIsFullRange={setChartIsFullRange}
                                        selectedMinPrice={selectedRange.min}
                                        selectedMaxPrice={selectedRange.max}
                                        selectedPositionName={selectedPositionName}
                                        selectedSdkPosition={selectedSdkPosition}
                                        selectedPositionTVL={selectedPositionTVL}
                                        selectedPositionAPR={selectedPositionAPR}
                                        selectedPositionOnFarming={selectedPositionOnFarming}
                                        selectedPositionFarmingDeposit={selectedPositionFarmingDeposit}
                                        activeFarming={farmingInfo?.farming || null}
                                        currentPoolPrice={currentPoolPrice}
                                        poolStatsLoading={poolStatsLoading}
                                        poolAprLoading={poolAprLoading}
                                        poolInformation={poolInformation}
                                        poolInformationChange={poolInformationChange}
                                        poolState={poolState}
                                        selectedPosition={selectedPosition}
                                    />
                                }
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </PageContainer>
    );
};

export default PoolNewPage;
