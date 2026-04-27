import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { formatAmount } from "@/utils";
import { truncateHash } from "@/utils/common/truncateHash";
import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { ArrowUpDown, Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Address, parseUnits } from "viem";
import { PoolAnalyticsStatistics, PoolPriceDetails } from "./types";

function OverviewAttribute({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-2 border-b border-border py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <span className="text-text-muted">{label}</span>
            <div className="font-medium text-text sm:text-right">{value}</div>
        </div>
    );
}

function AssetValue({ token }: { token: Currency | undefined }) {
    const { toast } = useToast();
    const blockExplorerUrl = useBlockExplorerURL();

    if (!token) return <span>-</span>;

    const address = token.wrapped.address as Address;
    const explorerUrl = `${blockExplorerUrl}/address/${address}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        toast({
            title: "Copied",
            description: "Address copied to clipboard",
        });
    };

    return (
        <div className="flex flex-wrap items-center justify-end gap-2 sm:max-w-[360px]">
            <span className="inline-flex items-center gap-2">
                <CurrencyLogo currency={token} size={18} />
                <span>{token.symbol}</span>
                <span className="text-xs text-text-muted">{truncateHash(address)}</span>
            </span>
            <Button type="button" variant="icon" size="icon" className="h-6 w-6 rounded-md" onClick={handleCopy}>
                <Copy size={12} />
            </Button>
            <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md  text-text transition-colors duration-150 hover:bg-panel-hover"
            >
                <ExternalLink size={12} />
            </a>
        </div>
    );
}

function CurrentPriceValue({ priceDetails }: { priceDetails: PoolPriceDetails | null }) {
    const [isInverted, setIsInverted] = useState(false);

    if (!priceDetails) return <span>-</span>;

    const activePrice = isInverted ? priceDetails.inverse : priceDetails.direct;

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="whitespace-nowrap">
                1 {activePrice.baseSymbol} = {activePrice.value} {activePrice.quoteSymbol}
            </span>
            <Button variant="icon" size="icon" className="h-6 w-6 rounded-md" onClick={() => setIsInverted((value) => !value)}>
                <ArrowUpDown size={12} />
            </Button>
        </div>
    );
}

function ReserveRatioBar({
    token0Share,
    token1Share,
    token0,
    token1,
}: {
    token0: Currency | undefined;
    token1: Currency | undefined;
    token0Share: number;
    token1Share: number;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-1.5 h-2.5 overflow-hidden rounded-full">
                <div className="bg-primary transition-all duration-300" style={{ width: `${token0Share}%` }} />
                <div className="bg-accent transition-all duration-300" style={{ width: `${token1Share}%` }} />
            </div>
            <div className="flex justify-between gap-2 text-sm text-text-muted">
                <div className="flex items-center justify-between gap-3 rounded-lg">
                    <CurrencyLogo currency={token0} size={24} />
                    <span className="font-medium text-text">{formatAmount(token0Share, 2)}%</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg">
                    <CurrencyLogo currency={token1} size={24} />s
                    <span className="font-medium text-text">{formatAmount(token1Share, 2)}%</span>
                </div>
            </div>
        </div>
    );
}

function ReservesPanel({
    token0,
    token1,
    statistics,
}: {
    token0: Currency | undefined;
    token1: Currency | undefined;
    statistics: PoolAnalyticsStatistics | undefined;
}) {
    const { formatted: tvlToken0USD } = useUSDCValue(
        token0 && statistics?.tvlToken0
            ? CurrencyAmount.fromRawAmount(token0, parseUnits(statistics.tvlToken0, token0.decimals).toString())
            : undefined,
    );
    const { formatted: tvlToken1USD } = useUSDCValue(
        token1 && statistics?.tvlToken1
            ? CurrencyAmount.fromRawAmount(token1.wrapped, parseUnits(statistics.tvlToken1, token1.decimals).toString())
            : undefined,
    );

    const { token0Share, token1Share } = useMemo(() => {
        const reserve0USD = Number(tvlToken0USD || 0);
        const reserve1USD = Number(tvlToken1USD || 0);
        const totalReserveUSD = reserve0USD + reserve1USD;

        if (!totalReserveUSD) {
            return {
                token0Share: 0,
                token1Share: 0,
            };
        }

        const nextToken0Share = (reserve0USD / totalReserveUSD) * 100;

        return {
            token0Share: nextToken0Share,
            token1Share: 100 - nextToken0Share,
        };
    }, [tvlToken0USD, tvlToken1USD]);

    return (
        <div className="">
            <p className="text-[11px] font-medium uppercase tracking-[2px] text-text-muted">Reserves</p>
            <p className="mt-3 text-2xl font-medium  text-text">${formatAmount(statistics?.tvlUSD || 0, 4)}</p>

            <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <CurrencyLogo currency={token0} size={24} />
                        <span className="text-sm font-medium text-text">{token0?.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-text">
                        {formatAmount(statistics?.tvlToken0 || 0, 4)}{" "}
                        <span className="text-xs font-medium text-text-muted">${formatAmount(tvlToken0USD || 0, 2)}</span>
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <CurrencyLogo currency={token1} size={24} />
                        <span className="text-sm font-medium text-text">{token1?.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-text">
                        {formatAmount(statistics?.tvlToken1 || 0, 4)}{" "}
                        <span className="text-xs font-medium text-text-muted">${formatAmount(tvlToken1USD || 0, 2)}</span>
                    </span>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-[2px] text-text-muted">Token Ratio</p>
                    {/* <span className="text-xs text-text-muted">By reserve value</span> */}
                </div>
                <ReserveRatioBar token0={token0} token1={token1} token0Share={token0Share} token1Share={token1Share} />
            </div>
        </div>
    );
}

function OverviewPanel({ token0, token1, statistics, priceDetails, createdAtTimestamp }: PoolOverviewSectionProps) {
    return (
        <div className="rounded-lg ">
            <p className="text-[11px] font-medium uppercase tracking-[2px] text-text-muted">Pool Attributes</p>
            <div className="mt-4 [&>*:last-child]:border-b-0 [&>*:last-child]:pb-0 [&>*:first-child]:pt-0">
                <OverviewAttribute label="Base asset" value={<AssetValue token={token0} />} />
                <OverviewAttribute label="Quote asset" value={<AssetValue token={token1} />} />
                <OverviewAttribute label="Current price" value={<CurrentPriceValue priceDetails={priceDetails} />} />
                <OverviewAttribute label="Transactions" value={formatAmount(statistics?.txCount || 0, 0)} />
                <OverviewAttribute label="Created on" value={formatCreatedOn(createdAtTimestamp)} />
            </div>
        </div>
    );
}

function formatCreatedOn(createdAtTimestamp: string | undefined) {
    if (!createdAtTimestamp) return "-";

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(Number(createdAtTimestamp) * 1000));
}

interface PoolOverviewSectionProps {
    token0: Currency | undefined;
    token1: Currency | undefined;
    statistics: PoolAnalyticsStatistics | undefined;
    priceDetails: PoolPriceDetails | null;
    createdAtTimestamp: string | undefined;
}

export function PoolOverviewSection({ token0, token1, statistics, priceDetails, createdAtTimestamp }: PoolOverviewSectionProps) {
    return (
        <section className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-text">Overview</h2>

            <div className="grid xl:gap-12 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,1fr)]">
                <OverviewPanel
                    token0={token0}
                    token1={token1}
                    statistics={statistics}
                    priceDetails={priceDetails}
                    createdAtTimestamp={createdAtTimestamp}
                />
                <ReservesPanel token0={token0} token1={token1} statistics={statistics} />
            </div>
        </section>
    );
}
