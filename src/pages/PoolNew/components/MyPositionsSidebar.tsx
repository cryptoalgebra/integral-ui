import { Button } from "@/components/ui/button";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { PositionFromTokenId } from "@/hooks/positions/usePositions";
import { usePoolNewUiStore } from "@/state/poolNewUiStore";
import { formatAmount } from "@/utils/common/formatAmount";
import { Currency, tickToPrice } from "@cryptoalgebra/custom-pools-sdk";
import { Eye, EyeOff, Plus } from "lucide-react";
import { useMemo } from "react";
import { MiddleView } from "../types";

interface MyPositionsSidebarProps {
    account?: string;
    positionsLoading: boolean;
    poolPositions: PositionFromTokenId[];
    selectedPositionId: string | null;
    setSelectedPositionId: (id: string | null) => void;
    setMiddleView: (view: MiddleView) => void;
    currentPoolPrice?: number;
    token0?: Currency;
    token1?: Currency;
    poolLabel: string;
    positionTVLById: Record<string, number>;
    positionOnFarmingById: Record<string, boolean>;
    positionAPRById?: Record<string, number>;
    positionNames: Record<string, string>;
}

export default function MyPositionsSidebar({
    account,
    positionsLoading,
    poolPositions,
    selectedPositionId,
    setSelectedPositionId,
    setMiddleView,
    currentPoolPrice,
    token0,
    token1,
    poolLabel,
    positionTVLById,
    positionOnFarmingById,
    positionAPRById,
    positionNames,
}: MyPositionsSidebarProps) {
    const showClosedPositions = usePoolNewUiStore((state) => state.showClosedPositions);
    const toggleShowClosedPositions = usePoolNewUiStore((state) => state.actions.toggleShowClosedPositions);

    const visiblePoolPositions = useMemo(() => {
        const filteredPositions = poolPositions.filter((position) => (showClosedPositions ? true : position.liquidity !== 0n));

        return [...filteredPositions].sort((a, b) => {
            const aIsClosed = a.liquidity === 0n;
            const bIsClosed = b.liquidity === 0n;

            if (aIsClosed !== bIsClosed) {
                return aIsClosed ? 1 : -1;
            }

            const aId = BigInt(a.tokenId);
            const bId = BigInt(b.tokenId);

            if (aId < bId) return -1;
            if (aId > bId) return 1;
            return 0;
        });
    }, [poolPositions, showClosedPositions]);

    return (
        <aside className="w-full pt-8 overflow-hidden opacity-100 transition-all duration-200 lg:w-[280px] border-r pr-2">
            <div className="h-full">

                <div className="flex pl-2 pb-2 mb-4">
                    <Button onClick={() => setMiddleView("POOL_INFO")} size="sm" variant="outline" className="w-fit gap-2 hover:bg-white/5">
                        <div className="flex items-center">
                            <CurrencyLogo currency={token0} size={26} />
                            <CurrencyLogo className="-ml-3" currency={token1} size={26} />
                        </div>
                        <div className="text-sm font-semibold md:text-base">{poolLabel}</div>
                    </Button>
                </div>

                <div className="flex items-center justify-between p-3 pt-1 pr-0">
                    <div className="flex items-center">
                        <h3 className="text-sm font-medium">My Positions</h3>
                        <HoverCard openDelay={80} closeDelay={80}>
                            <HoverCardTrigger asChild>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="icon"
                                    className="text-white/50"
                                    onClick={toggleShowClosedPositions}
                                    aria-label={showClosedPositions ? "Hide closed positions" : "Show closed positions"}
                                >
                                    {showClosedPositions ? <EyeOff size={14} /> : <Eye size={14} />}
                                </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto px-2 py-1 text-xs" side="bottom" align="start">
                                {showClosedPositions ? "Hide Closed Positions" : "Show Closed Positions"}
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            className="h-8 rounded-full px-4 shadow-[0_0_14px_rgba(168,85,247,0.45)] transition-shadow hover:shadow-[0_0_18px_rgba(168,85,247,0.6)]"
                            onClick={() => setMiddleView("NEW_POSITION")}
                            size="sm"
                            variant="primary"
                        >
                            <Plus size={14} />
                            New
                        </Button>
                    </div>
                </div>

                <div className="flex h-[220px] flex-col pl-2 lg:h-[calc(100%-44px)]">
                    <div className="min-h-0 flex-1">
                        {!account && (
                            <div className="flex h-full justify-center p-3 text-center text-sm text-foreground/60">
                                Connect wallet to see your positions in this pool.
                            </div>
                        )}

                        {account && positionsLoading && (
                            <div className="flex h-full justify-center text-sm text-foreground/60">
                                Loading positions...
                            </div>
                        )}

                        {account && !positionsLoading && poolPositions.length === 0 && (
                            <div className="flex h-full justify-center p-3 text-center text-sm text-foreground/60">
                                You do not have positions in this pool yet.
                            </div>
                        )}

                        {account && !positionsLoading && poolPositions.length > 0 && visiblePoolPositions.length === 0 && (
                            <div className="flex h-full justify-center rounded-md border border-dashed border-card-border p-3 text-center text-sm text-foreground/60">
                                No open positions to show.
                            </div>
                        )}

                        {account && !positionsLoading && visiblePoolPositions.length > 0 && (
                            <div className="h-full overflow-auto">
                                {visiblePoolPositions.map((position) => {
                                    const id = position.tokenId.toString();
                                    const isSelected = id === selectedPositionId;
                                    const lowerTick = Number(position.tickLower);
                                    const upperTick = Number(position.tickUpper);
                                    const lowerPriceValue =
                                        token0 && token1 ? Number(tickToPrice(token0.wrapped, token1.wrapped, lowerTick).toSignificant(18)) : undefined;
                                    const upperPriceValue =
                                        token0 && token1 ? Number(tickToPrice(token0.wrapped, token1.wrapped, upperTick).toSignificant(18)) : undefined;
                                    const minPrice =
                                        typeof lowerPriceValue === "number" && typeof upperPriceValue === "number"
                                            ? Math.min(lowerPriceValue, upperPriceValue)
                                            : undefined;
                                    const maxPrice =
                                        typeof lowerPriceValue === "number" && typeof upperPriceValue === "number"
                                            ? Math.max(lowerPriceValue, upperPriceValue)
                                            : undefined;
                                    const isInRange =
                                        typeof currentPoolPrice === "number" &&
                                        typeof minPrice === "number" &&
                                        typeof maxPrice === "number" &&
                                        currentPoolPrice >= minPrice &&
                                        currentPoolPrice <= maxPrice;
                                    const isClosed = position.liquidity === 0n;
                                    const lowerPrice = typeof minPrice === "number" ? formatAmount(minPrice, 8) : null;
                                    const upperPrice = typeof maxPrice === "number" ? formatAmount(maxPrice, 8) : null;
                                    const positionTVL = positionTVLById[id];
                                    const isOnFarming = Boolean(positionOnFarmingById[id]);
                                    const positionAPR = positionAPRById?.[id];
                                    const positionName = positionNames[id] || `Position #${id}`;

                                    return (
                                        <div className="relative my-1" key={id}>
                                            <button
                                                className={`w-full px-3 py-2 text-left rounded-md transition-colors ${isSelected ? "bg-white/5" : "hover:bg-white/5"}`}
                                                onClick={() => {
                                                    setSelectedPositionId(id);
                                                    setMiddleView("POSITION");
                                                }}
                                                type="button"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0 flex items-center gap-2">
                                                        <span className="text-sm font-medium text-foreground/90">{positionName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isOnFarming ? (
                                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                                                                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
                                                                On Farming
                                                            </span>
                                                        ) : null}
                                                        <span
                                                            className={`text-[10px] font-semibold uppercase tracking-wide ${
                                                                isClosed ? "text-rose-300" : isInRange ? "text-emerald-300" : "text-amber-300"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                                                                    isClosed ? "bg-rose-300" : isInRange ? "bg-emerald-300" : "bg-amber-300"
                                                                }`}
                                                            />
                                                            {isClosed ? "Closed" : isInRange ? "In Range" : "Out of Range"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-foreground/70">
                                                    {lowerPrice && upperPrice
                                                        ? `${lowerPrice} - ${upperPrice} ${token1?.symbol}`
                                                        : `${position.tickLower.toString()} to ${position.tickUpper.toString()}`}
                                                </p>
                                                <p className="inline-flex gap-2 text-xs text-foreground/70">
                                                    <span>{typeof positionTVL === "number" ? `$${formatAmount(positionTVL, 2)}` : "--"} TVL</span>
                                                    <span>{typeof positionAPR === "number" ? `${formatAmount(positionAPR, 2)}%` : "--"} APR</span>
                                                </p>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
