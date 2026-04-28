import LiquidityChartRangeInput from "@/components/common/LiquidityChartRangeInput";
import { IDerivedMintInfo } from "@/state/mintStore";
import { formatAmount } from "@/utils";
import { Position } from "@cryptoalgebra/integral-sdk";
import { useState } from "react";

interface ChartSectionProps {
    position: Position | undefined;
    mintInfo: IDerivedMintInfo;
}

export function ChartSection({ position, mintInfo }: ChartSectionProps) {
    const [wasManuallyToggled, setWasManuallyToggled] = useState(false);
    const { pool } = mintInfo;

    const price = wasManuallyToggled ? mintInfo.price?.invert().toSignificant(24) : mintInfo.price?.toSignificant(24);

    const priceLower = position?.token0PriceLower;
    const priceUpper = position?.token0PriceUpper;

    const handleCurrencyToggle = () => {
        setWasManuallyToggled(!wasManuallyToggled);
    };

    return (
        <div className="p-4 h-fit flex flex-col border border-card-border rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-sm font-medium text-text">Price Range</h4>
                    <p className="text-xs text-text/50">Liquidity distribution</p>
                </div>
            </div>

            {/* Price bounds */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-card-hover/50 text-center">
                    <span className="text-xs text-text/50 block">Min</span>
                    <span className="text-sm font-medium text-text">
                        {formatAmount((wasManuallyToggled ? priceUpper?.invert() : priceLower)?.toSignificant(24) || 0, 6)}
                    </span>
                </div>
                <div className="p-2 rounded-lg bg-accent-200/10 border border-accent-200/30 text-center">
                    <span className="text-xs text-text/50 block">Current</span>
                    <span className="text-sm font-medium text-accent-200">{price ? formatAmount(price, 6) : "-"}</span>
                </div>
                <div className="p-2 rounded-lg bg-card-hover/50 text-center">
                    <span className="text-xs text-text/50 block">Max</span>
                    <span className="text-sm font-medium text-text">
                        {formatAmount((wasManuallyToggled ? priceLower?.invert() : priceUpper)?.toSignificant(24) || 0, 6)}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <LiquidityChartRangeInput
                pool={pool}
                priceLower={priceLower}
                priceUpper={priceUpper}
                ticksAtLimit={mintInfo.ticksAtLimit}
                price={price ? parseFloat(price) : undefined}
                onLeftRangeInput={() => null}
                onRightRangeInput={() => null}
                width={430}
                isSorted={!wasManuallyToggled}
                interactive={false}
                isOnlyView={false}
                // isStable={isStablecoinPair(pool?.token0, pool?.token1)}
            />
        </div>
    );
}
