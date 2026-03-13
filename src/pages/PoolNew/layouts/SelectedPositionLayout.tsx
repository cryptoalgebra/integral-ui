import { InputModeV2, LiquidityRangeChartV2, TimePeriodV2 } from "@/components/Charts/D3LiquidityRangeInputV2";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import CollectFees from "@/components/position/CollectFees";
import { IncreaseLiquidityModal } from "@/components/modals/IncreaseLiquidityModal";
import RemoveLiquidityModal from "@/components/modals/RemoveLiquidityModal";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/common/useCurrency";
import { Deposit, EternalFarming } from "@/graphql/generated/graphql";
import { usePositionFees } from "@/hooks/positions/usePositionFees";
import { PositionFromTokenId } from "@/hooks/positions/usePositions";
import { useDerivedMintInfo } from "@/state/mintStore";
import { formatAmount } from "@/utils/common/formatAmount";
import { ADDRESS_ZERO, INITIAL_POOL_FEE, Position } from "@cryptoalgebra/custom-pools-sdk";
import TokenRatio from "@/components/create-position/TokenRatio";
import { type Dispatch, type SetStateAction } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import FarmingModule from "@/modules/FarmingModule";
import PositionHistoryTable from "../components/PositionHistoryTable";

const { useFarmHarvest, useFarmingRewardsEarned } = FarmingModule.hooks;
const { useFarmCheckApprove, useFarmApprove, useFarmStake } = FarmingModule.hooks;

interface SelectedPositionLayoutProps {
    selectedPosition: PositionFromTokenId;
    selectedPositionName: string | null;
    selectedSdkPosition: Position | null;
    selectedPositionTVL?: number;
    selectedPositionAPR?: number;
    selectedPositionOnFarming: boolean;
    selectedPositionFarmingDeposit: Deposit | null;
    activeFarming: EternalFarming | null;
    currentPoolPrice?: number;
    poolPriceLoading: boolean;
    densityLoading: boolean;
    chartReady: boolean;
    v2PriceData: { time: number; value: number; open: number; high: number; low: number; close: number }[];
    v2LiquidityData: { tick: number; price0: number; activeLiquidity: number }[];
    token0Symbol?: string;
    token1Symbol?: string;
    token0Address?: string;
    token1Address?: string;
    chartCurrentPrice?: number;
    chartInputMode: InputModeV2;
    chartTimePeriod: TimePeriodV2;
    setChartInputMode: Dispatch<SetStateAction<InputModeV2>>;
    setChartTimePeriod: Dispatch<SetStateAction<TimePeriodV2>>;
    selectedMinPrice?: number;
    selectedMaxPrice?: number;
}

export default function SelectedPositionLayout({
    selectedPosition,
    selectedPositionName,
    selectedSdkPosition,
    selectedPositionTVL,
    selectedPositionAPR,
    selectedPositionOnFarming,
    selectedPositionFarmingDeposit,
    activeFarming,
    currentPoolPrice,
    poolPriceLoading,
    densityLoading,
    chartReady,
    v2PriceData,
    v2LiquidityData,
    token0Symbol,
    token1Symbol,
    token0Address,
    token1Address,
    chartCurrentPrice,
    chartInputMode,
    chartTimePeriod,
    setChartInputMode,
    setChartTimePeriod,
    selectedMinPrice,
    selectedMaxPrice,
}: SelectedPositionLayoutProps) {
    const { address: account } = useAccount();
    const currencyA = useCurrency(token0Address as Address, true);
    const currencyB = useCurrency(token1Address as Address, true);

    const mintInfo = useDerivedMintInfo(
        currencyA,
        currencyB,
        selectedPosition.pool as Address,
        INITIAL_POOL_FEE,
        currencyA,
        selectedSdkPosition || undefined
    );

    const isClosed = selectedPosition.liquidity === 0n;
    const isOutOfRange =
        !isClosed &&
        typeof currentPoolPrice === "number" &&
        typeof selectedMinPrice === "number" &&
        typeof selectedMaxPrice === "number" &&
        (currentPoolPrice < selectedMinPrice || currentPoolPrice > selectedMaxPrice);
    const { onHarvest, isLoading: isHarvestingRewards } = useFarmHarvest({
        tokenId: BigInt(selectedPositionFarmingDeposit?.id || 0),
        rewardToken: (activeFarming?.rewardToken as Address) || ADDRESS_ZERO,
        bonusRewardToken: (activeFarming?.bonusRewardToken as Address) || ADDRESS_ZERO,
        pool: (activeFarming?.pool as Address) || ADDRESS_ZERO,
        nonce: BigInt(activeFarming?.nonce || 0),
        account: account ?? ADDRESS_ZERO,
    });
    const canHarvestRewards = Boolean(selectedPositionOnFarming && selectedPositionFarmingDeposit && activeFarming && onHarvest);
    const farmingTokenId = BigInt(selectedPosition.tokenId);
    const { approved: isFarmApproved, isLoading: isFarmApproveChecking } = useFarmCheckApprove(farmingTokenId);
    const { isLoading: isFarmApproveLoading, onApprove } = useFarmApprove(farmingTokenId);
    const { isLoading: isFarmStakeLoading, onStake } = useFarmStake({
        tokenId: farmingTokenId,
        rewardToken: (activeFarming?.rewardToken as Address) || ADDRESS_ZERO,
        bonusRewardToken: (activeFarming?.bonusRewardToken as Address) || ADDRESS_ZERO,
        pool: (activeFarming?.pool as Address) || ADDRESS_ZERO,
        nonce: BigInt(activeFarming?.nonce || 0),
    });
    const positionRangeLength = Math.abs(Number(selectedPosition.tickUpper) - Number(selectedPosition.tickLower));
    const minRangeLength = Number(activeFarming?.minRangeLength || 0);
    const isDepositEligible = !isClosed && positionRangeLength >= minRangeLength;
    const canShowDepositButton = Boolean(activeFarming && !selectedPositionOnFarming);
    const isDepositLoading = isFarmApproveChecking || isFarmApproveLoading || isFarmStakeLoading;
    const { amount0, amount1, amount0Usd, amount1Usd } = usePositionFees(mintInfo.pool || undefined, selectedPosition.tokenId, true);
    const rewardTokenCurrency = useCurrency((activeFarming?.rewardToken as Address) || undefined, true);
    const bonusRewardTokenCurrency = useCurrency((activeFarming?.bonusRewardToken as Address) || undefined, true);
    const { formattedRewardEarned, formattedBonusRewardEarned, rewardEarnedUSD, bonusRewardEarnedUSD, totalRewardsEarnedUSD } = useFarmingRewardsEarned(
        activeFarming || undefined,
        selectedPositionFarmingDeposit ? [selectedPositionFarmingDeposit] : []
    );

    return (
        <section className="min-h-[640px] bg-card-background text-left">

            <div className="overflow-hidden bg-card-background/70">

                <div className="bg-gradient-to-t from-[#3f2a94]/30 via-[#1d123f]/10 to-transparent p-6 pb-12">
                    <div className="mt-2 flex flex-wrap items-center gap-8">
                        <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                            {selectedPositionName || `Position #${selectedPosition.tokenId.toString()}`}
                        </h1>
                        <span className="flex gap-4">
                            <span
                                className={`rounded-full mt-2 text-xs font-semibold uppercase tracking-wide ${isClosed
                                        ? "text-rose-300"
                                        : isOutOfRange
                                            ? "text-amber-300"
                                            : "text-emerald-300"
                                    }`}
                            >
                                <span
                                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${isClosed
                                            ? "bg-rose-300"
                                            : isOutOfRange
                                                ? "bg-amber-300"
                                                : "bg-emerald-300"
                                        }`}
                                />
                                {isClosed ? "Closed" : isOutOfRange ? "Out of Range" : "Open"}
                            </span>
                            {selectedPositionOnFarming ? (
                                <span className="rounded-full mt-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
                                    On Farming
                                </span>
                            ) : null}
                        </span>
                    </div>
                    <p className="mt-3 text-lg text-foreground">
                        <span>${typeof selectedPositionTVL === "number" ? formatAmount(selectedPositionTVL, 2) : "--"} TVL</span>
                        <span className="px-2 text-foreground/40">•</span>
                        <span className="text-green-300">{typeof selectedPositionAPR === "number" ? `${formatAmount(selectedPositionAPR, 2)}% APR` : "-- APR"}</span>
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <IncreaseLiquidityModal
                            tokenId={selectedPosition.tokenId}
                            currencyA={currencyA}
                            currencyB={currencyB}
                            mintInfo={mintInfo}
                            triggerVariant="primary"
                            triggerClassName="h-9 rounded-full px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_14px_rgba(168,85,247,0.45)] transition-all hover:bg-primary-button/85 hover:shadow-[0_0_18px_rgba(168,85,247,0.6)]"
                        />
                         {canShowDepositButton ? (
                            <Button
                                size="sm"
                                variant="primary"
                                disabled={!isDepositEligible || isDepositLoading}
                                onClick={() => {
                                    if (isFarmApproveChecking || isFarmApproveLoading || isFarmStakeLoading) return;
                                    if (!isFarmApproved) {
                                        onApprove?.();
                                        return;
                                    }
                                    onStake?.();
                                }}
                                className="h-9 rounded-full px-4 text-sm font-semibold"
                            >
                                {isDepositLoading ? <Loader /> : !isDepositEligible ? "Unsupported Range" : !isFarmApproved ? "Approve Farming" : "Deposit to Farming"}
                            </Button>
                        ) : null}
                        <CollectFees
                            positionFeesUSD={
                                typeof amount0Usd === "number" && typeof amount1Usd === "number"
                                    ? `$${formatAmount((amount0Usd || 0) + (amount1Usd || 0), 2)}`
                                    : undefined
                            }
                            mintInfo={mintInfo}
                            positionId={selectedPosition.tokenId}
                            textMode
                            textModeClassName="h-9 min-w-0 rounded-full border border-blue-400/40 bg-blue-500/15 px-4 text-sm font-semibold text-blue-300 no-underline hover:bg-blue-500/25"
                        />
                        {!isClosed ? (
                            <RemoveLiquidityModal
                                positionId={selectedPosition.tokenId}
                                enableActions
                                triggerVariant="ghost"
                                triggerClassName="h-9 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
                            />
                        ) : null}
                    </div>

                    <div className="mt-10">
                        {selectedSdkPosition && (
                            <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                                <span>{`${formatAmount(selectedSdkPosition.amount0.toSignificant(24), 6)} ${currencyA?.symbol || token0Symbol || ""}`}</span>
                                <span>{`${formatAmount(selectedSdkPosition.amount1.toSignificant(24), 6)} ${currencyB?.symbol || token1Symbol || ""}`}</span>
                            </div>
                        )}
                        <div className="mt-4">
                            <TokenRatio mintInfo={mintInfo} />
                        </div>
                    </div>

                </div>
            </div>

            <div className="space-y-6 rounded-2xl border border-card-border border-r-0 border-b-0 bg-black/30 p-6 -mt-3 backdrop-blur">
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">My Earnings</h2>
                    <div className="rounded-xl border border-card-border bg-background/30 p-4">
                        <h3 className="text-sm font-semibold text-foreground/75">Fees</h3>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-foreground/70">
                                    <CurrencyLogo currency={amount0?.currency || currencyA} size={16} />
                                    {amount0?.currency.symbol || token0Symbol || "Token 0"}
                                </span>
                                <span>
                                    {amount0 ? formatAmount(amount0.toExact(), 6) : "--"}{" "}
                                    <span className="text-foreground/60">(${formatAmount(amount0Usd || 0, 2)})</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-foreground/70">
                                    <CurrencyLogo currency={amount1?.currency || currencyB} size={16} />
                                    {amount1?.currency.symbol || token1Symbol || "Token 1"}
                                </span>
                                <span>
                                    {amount1 ? formatAmount(amount1.toExact(), 6) : "--"}{" "}
                                    <span className="text-foreground/60">(${formatAmount(amount1Usd || 0, 2)})</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {selectedPositionOnFarming && activeFarming && (
                        <div className="rounded-xl border border-card-border bg-background/30 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-foreground/75">Farming Earnings</h3>
                                {canHarvestRewards ? (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={isHarvestingRewards}
                                        onClick={() => onHarvest && onHarvest()}
                                        className="h-8 rounded-full border border-violet-300/30 bg-violet-500/20 px-3 text-xs font-semibold text-violet-200 hover:bg-violet-500/30"
                                    >
                                        {isHarvestingRewards ? <Loader /> : "Collect Rewards"}
                                    </Button>
                                ) : null}
                            </div>
                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="flex items-center gap-2 text-foreground/70">
                                        <CurrencyLogo currency={rewardTokenCurrency} size={16} />
                                        {rewardTokenCurrency?.symbol || "Reward"}
                                    </span>
                                    <span>
                                        {formatAmount(formattedRewardEarned || 0, 6)}{" "}
                                        <span className="text-foreground/60">(${formatAmount(rewardEarnedUSD || 0, 2)})</span>
                                    </span>
                                </div>
                                {bonusRewardTokenCurrency && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-2 text-foreground/70">
                                            <CurrencyLogo currency={bonusRewardTokenCurrency} size={16} />
                                            {bonusRewardTokenCurrency.symbol}
                                        </span>
                                        <span>
                                            {formatAmount(formattedBonusRewardEarned || 0, 6)}{" "}
                                            <span className="text-foreground/60">(${formatAmount(bonusRewardEarnedUSD || 0, 2)})</span>
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-3 pt-1 text-sm font-semibold">
                                    <span>Total</span>
                                    <span>${totalRewardsEarnedUSD}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Position Range</h2>
                    {poolPriceLoading || densityLoading ? (
                        <div className="h-[360px] text-sm text-foreground/60">
                            Loading chart...
                        </div>
                    ) : !chartReady ? (
                        <div className="h-[360px] text-sm text-foreground/60">
                            Not enough chart data for this pool yet.
                        </div>
                    ) : (
                        <LiquidityRangeChartV2
                            key={selectedPosition.tokenId.toString()}
                            priceData={v2PriceData}
                            liquidityData={v2LiquidityData}
                            quoteSymbol={token1Symbol}
                            baseSymbol={token0Symbol}
                            quoteTokenAddress={token1Address}
                            baseTokenAddress={token0Address}
                            currentPrice={chartCurrentPrice}
                            initialMinPrice={selectedMinPrice}
                            initialMaxPrice={selectedMaxPrice}
                            initialInputMode={chartInputMode}
                            initialTimePeriod={chartTimePeriod}
                            initialFullRange={false}
                            disableRangeEditing
                            onMinPriceChange={() => undefined}
                            onMaxPriceChange={() => undefined}
                            onInputModeChange={setChartInputMode}
                            onTimePeriodChange={setChartTimePeriod}
                            onFullRangeChange={() => undefined}
                        />
                    )}
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Position History</h2>
                    <PositionHistoryTable tokenId={selectedPosition.tokenId} token0Symbol={token0Symbol} token1Symbol={token1Symbol} />
                </div>
            </div>
        </section>
    );
}
