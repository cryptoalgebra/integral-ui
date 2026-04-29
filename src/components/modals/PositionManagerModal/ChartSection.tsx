import LiquidityChartRangeInput from "@/components/common/LiquidityChartRangeInput";
import { useMediaQuery } from "@/hooks/common/useMediaQuery";
import { IDerivedMintInfo } from "@/state/mintStore";
import { formatAmount } from "@/utils";
import { Position } from "@cryptoalgebra/integral-sdk";

interface ChartSectionProps {
    position: Position | undefined;
    mintInfo: IDerivedMintInfo;
}

export function ChartSection({ position, mintInfo }: ChartSectionProps) {
    const wasManuallyToggled = false;
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const { pool } = mintInfo;

    const price = wasManuallyToggled ? mintInfo.price?.invert().toSignificant(24) : mintInfo.price?.toSignificant(24);

    const priceLower = position?.token0PriceLower;
    const priceUpper = position?.token0PriceUpper;
    const chartWidth = isDesktop ? 380 : 330;

    return (
        <section className="flex flex-col rounded-lg p-3 border h-full">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">Price range</h4>
                    {/* <p className="text-xs text-text-muted">Liquidity distribution</p> */}
                </div>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-panel p-2 text-center">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-text-muted">Min</span>
                    <span className="text-sm font-medium text-text">
                        {formatAmount((wasManuallyToggled ? priceUpper?.invert() : priceLower)?.toSignificant(24) || 0, 6)}
                    </span>
                </div>
                <div className="rounded-lg bg-accent/10 p-2 text-center">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-text-muted">Current</span>
                    <span className="text-sm font-semibold text-accent">{price ? formatAmount(price, 6) : "-"}</span>
                </div>
                <div className="rounded-lg bg-panel p-2 text-center">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-text-muted">Max</span>
                    <span className="text-sm font-medium text-text">
                        {formatAmount((wasManuallyToggled ? priceLower?.invert() : priceUpper)?.toSignificant(24) || 0, 6)}
                    </span>
                </div>
            </div>

            <div className="mt-auto">
                <LiquidityChartRangeInput
                    pool={pool}
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    ticksAtLimit={mintInfo.ticksAtLimit}
                    price={price ? parseFloat(price) : undefined}
                    onLeftRangeInput={() => null}
                    onRightRangeInput={() => null}
                    width={chartWidth}
                    height={190}
                    isSorted={!wasManuallyToggled}
                    interactive={false}
                    isOnlyView={false}
                />
            </div>
        </section>
    );
}
