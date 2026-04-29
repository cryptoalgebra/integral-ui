import CurrencyLogo from "@/components/common/CurrencyLogo";
import { HeaderItem } from "@/components/common/Table/common";
import { LoadingState } from "@/components/common/Table/loadingState";
import CreatePositionModal from "@/components/modals/CreatePositionModal";
import { PositionImage } from "@/components/position/PoisitionImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExtendedPosition, PositionStatus } from "@/hooks/earn/useExtendedPositions";
import { ExtendedPool } from "@/hooks/pools/useExtendedPools";
import { cn } from "@/utils";
import { formatAmount } from "@/utils/common/formatAmount";
import { enabledModules } from "config";
import { ChevronDown, Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

export interface EarnPoolListItem {
    pool: ExtendedPool;
    amountUSD: number;
    feesUSD: number;
    positions: ExtendedPosition[];
}

interface EarnPoolsListProps {
    pools: EarnPoolListItem[];
    loading?: boolean;
    onManagePosition: (position: ExtendedPosition) => void;
    onRefetch?: () => void;
}

const EarnPoolPair = ({ pool }: { pool: ExtendedPool }) => {
    const { token0, token1 } = pool.pool;

    return (
        <div className="ml-1.5 flex items-center gap-3">
            <div className="flex shrink-0 items-center">
                <CurrencyLogo currency={token0} size={32} className="ring-2 ring-card" />
                <CurrencyLogo currency={token1} size={32} className="-ml-2 ring-2 ring-card" />
            </div>

            {token0 && token1 ? (
                <div className="flex justify-between min-w-0 w-full items-center">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-text">{`${token0.symbol} / ${token1.symbol}`}</span>
                        {!enabledModules.CustomPoolsModule && (
                            <span className="text-xs text-text-muted">{pool.pool.fee / 10_000}% fee</span>
                        )}
                    </div>

                    <div className="flex flex-wrap ml-auto items-center gap-2" />
                </div>
            ) : (
                <Skeleton className="h-5 w-24 rounded-lg bg-panel" />
            )}
            {/* <div className="bg-muted-primary text-primary-text rounded-xl px-2 py-1">{`${fee}%`}</div> */}
            {/* {hasALM ? <img className="w-6 h-6 overflow-hidden rounded-full" src={almLogo} alt="ALM" /> : null} */}
        </div>
    );
};

const PositionStatusBadge = ({ status }: { status: PositionStatus }) => {
    const isOutOfRange = status === PositionStatus.OUT_OF_RANGE;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                isOutOfRange
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                    : "border-green-500/30 bg-green-500/10 text-green-500",
            )}
        >
            <span className={cn("size-1.5 rounded-full", isOutOfRange ? "bg-yellow-500" : "bg-green-500 animate-pulse")} />
            {isOutOfRange ? "Out of range" : "Earning"}
        </span>
    );
};

const EarnPoolsList = ({ pools, loading, onManagePosition, onRefetch }: EarnPoolsListProps) => {
    const [expandedPoolId, setExpandedPoolId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");

    const filteredPools = useMemo(() => {
        const query = searchValue.trim().toLowerCase();
        if (!query) return pools;

        return pools.filter(({ pool }) => {
            const { token0, token1 } = pool.pool;

            return [token0.symbol, token1.symbol, token0.name, token1.name]
                .join(" ")
                .toLowerCase()
                .includes(query);
        });
    }, [pools, searchValue]);

    const togglePool = (poolId: string, hasPositions: boolean) => {
        if (!hasPositions) return;

        setExpandedPoolId((prevPoolId) => (prevPoolId === poolId ? null : poolId));
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full lg:max-w-sm">
                <Input
                    placeholder="Search pools..."
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            </div>

            <div className="overflow-x-auto w-full max-w-[calc(100vw-2rem)]">
                <Table>
                    <TableHeader className="bg-panel [&_tr]:border-border/60 rounded-xl overflow-hidden">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-12 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
                                <HeaderItem className="ml-2">Pool</HeaderItem>
                            </TableHead>
                            <TableHead className="h-12 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
                                <HeaderItem>TVL</HeaderItem>
                            </TableHead>
                            <TableHead className="h-12 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
                                <HeaderItem>APR</HeaderItem>
                            </TableHead>
                            <TableHead className="h-12 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
                                <HeaderItem>Your Stake</HeaderItem>
                            </TableHead>
                            <TableHead className="h-12 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
                                <HeaderItem>Your Rewards</HeaderItem>
                            </TableHead>
                            <TableHead className="h-12 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted text-right">
                                <HeaderItem className="ml-auto"></HeaderItem>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="text-sm text-text">
                        {filteredPools.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="h-28 px-4 text-center text-text-muted">
                                    No pools match your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPools.map((item) => {
                                const poolId = item.pool.id.toLowerCase();
                                const hasPositions = item.positions.length > 0;
                                const isExpanded = expandedPoolId === poolId;

                                return (
                                    <Fragment key={`earn-pool-${poolId}`}>
                                        <TableRow
                                            className={cn(
                                                "border-border/60 bg-card transition-colors duration-150",
                                                hasPositions ? "cursor-pointer hover:bg-panel/50" : "hover:bg-card",
                                                isExpanded ? "bg-panel/50 border-none" : "",
                                            )}
                                            onClick={() => togglePool(poolId, hasPositions)}
                                        >
                                            <TableCell className="min-w-56 px-4 py-3.5 text-left">
                                                <EarnPoolPair pool={item.pool} />
                                            </TableCell>

                                            <TableCell className="min-w-32 px-4 py-3.5 text-left">
                                                ${formatAmount(item.pool.tvlUSD, 4)}
                                            </TableCell>
                                            <TableCell className="min-w-32 px-4 py-3.5 text-left">
                                                {formatAmount(item.pool.apr, 2)}%
                                            </TableCell>
                                            <TableCell className="min-w-32 px-4 py-3.5 text-left">
                                                ${formatAmount(item.amountUSD, 4)}
                                            </TableCell>
                                            <TableCell className="min-w-32 px-4 py-3.5 text-left font-medium text-text">
                                                ${formatAmount(item.feesUSD, 4)}
                                            </TableCell>

                                            <TableCell className="w-[140px] px-4 py-3.5 text-right">
                                                {hasPositions ? (
                                                    <span className="inline-flex items-center gap-2 text-sm text-text">
                                                        {item.positions.length}
                                                        <ChevronDown
                                                            className={cn(
                                                                "size-4 transition-transform",
                                                                isExpanded ? "rotate-180" : "rotate-0",
                                                            )}
                                                        />
                                                    </span>
                                                ) : (
                                                    <CreatePositionModal
                                                        poolAddress={item.pool.id}
                                                        token0={item.pool.pool.token0}
                                                        token1={item.pool.pool.token1}
                                                        fee={item.pool.pool.fee}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            className="whitespace-nowrap"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                            }}
                                                        >
                                                            Deposit
                                                        </Button>
                                                    </CreatePositionModal>
                                                )}
                                            </TableCell>
                                        </TableRow>

                                        {hasPositions && (
                                            <TableRow className="border-none bg-transparent hover:bg-transparent">
                                                <TableCell colSpan={6} className="p-0">
                                                    <div
                                                        className={cn(
                                                            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
                                                            isExpanded
                                                                ? "grid-rows-[1fr] opacity-100"
                                                                : "pointer-events-none grid-rows-[0fr] opacity-0",
                                                        )}
                                                    >
                                                        <div className="min-h-0 overflow-hidden">
                                                            <Table>
                                                                <TableBody>
                                                                    {item.positions.map((position) => (
                                                                        <TableRow
                                                                            key={`earn-position-${poolId}-${position.id}`}
                                                                            className={cn("bg-panel/40 border-none hover:bg-panel/50")}
                                                                        >
                                                                            <TableCell className="min-w-56 px-4 py-3.5 text-left">
                                                                                <div className="flex items-center gap-2 pl-12">
                                                                                    <PositionImage positionId={position.id} size={8} />
                                                                                    <span className="text-sm text-text font-medium">
                                                                                        Position #{position.id}
                                                                                    </span>
                                                                                    <PositionStatusBadge status={position.status} />
                                                                                </div>
                                                                            </TableCell>

                                                                            <TableCell className="min-w-32 px-4 py-3.5 text-left"></TableCell>
                                                                            <TableCell className="min-w-32 px-4 py-3.5 text-left text-text-muted"></TableCell>
                                                                            <TableCell className="min-w-32 px-4 py-3.5 text-left">
                                                                                ${formatAmount(position.amountUSD, 4)}
                                                                            </TableCell>
                                                                            <TableCell className="min-w-32 px-4 py-3.5 text-left font-medium text-text">
                                                                                ${formatAmount(position.feesUSD, 4)}
                                                                            </TableCell>

                                                                            <TableCell className="w-[140px] px-4 py-3.5 text-right">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="primaryLink"
                                                                                    className="whitespace-nowrap"
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        onManagePosition(position);
                                                                                    }}
                                                                                >
                                                                                    Manage
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}

                                                                    <TableRow className="border-border/60 bg-panel/40">
                                                                        <TableCell className="min-w-56 px-4 py-3.5 text-left">
                                                                            <div className="flex items-center gap-2 pl-12">
                                                                                <CreatePositionModal
                                                                                    poolAddress={item.pool.id}
                                                                                    token0={item.pool.pool.token0}
                                                                                    token1={item.pool.pool.token1}
                                                                                    fee={item.pool.pool.fee}
                                                                                    onSuccess={onRefetch}
                                                                                >
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="primary"
                                                                                        className="whitespace-nowrap"
                                                                                        onClick={(event) => {
                                                                                            event.stopPropagation();
                                                                                        }}
                                                                                    >
                                                                                        + New position
                                                                                    </Button>
                                                                                </CreatePositionModal>
                                                                            </div>
                                                                        </TableCell>

                                                                        <TableCell className="min-w-32 px-4 py-3.5 text-left"></TableCell>
                                                                        <TableCell className="min-w-32 px-4 py-3.5 text-left text-text-muted"></TableCell>
                                                                        <TableCell className="min-w-32 px-4 py-3.5 text-left"></TableCell>
                                                                        <TableCell className="min-w-32 px-4 py-3.5 text-left font-medium text-text"></TableCell>

                                                                        <TableCell className="w-[140px] px-4 py-3.5 text-right"></TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default EarnPoolsList;
