import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { PoolStats } from "@/hooks/pools/usePoolStats";
import { formatAmount } from "@/utils";
import { truncateHash } from "@/utils/common/truncateHash";
import { Currency, Pool } from "@cryptoalgebra/integral-sdk";
import { ArrowUpDown, Copy, ExternalLink } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Address } from "viem";

interface NAVHookPoolAttributesPanelProps {
    pool: Pool | null;
    token0: Currency | undefined;
    token1: Currency | undefined;
    poolStats: PoolStats;
}

interface PoolPriceDetails {
    direct: {
        baseSymbol: string;
        quoteSymbol: string;
        value: string;
    };
    inverse: {
        baseSymbol: string;
        quoteSymbol: string;
        value: string;
    };
}

function OverviewAttribute({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-2 border-b border-card-border py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <span className="text-text-300">{label}</span>
            <div className="min-w-0 font-medium text-text-100 sm:text-right">{value}</div>
        </div>
    );
}

function AssetValue({ token }: { token: Currency | undefined }) {
    const { toast } = useToast();
    const blockExplorerUrl = useBlockExplorerURL();

    if (!token) return <span>-</span>;

    const address = token.wrapped.address as Address;
    const tokenExplorePath = `/analytics/tokens/${address}`;
    const explorerUrl = blockExplorerUrl ? `${blockExplorerUrl}/address/${address}` : undefined;

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        toast({
            title: "Copied",
            description: "Address copied to clipboard",
        });
    };

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="inline-flex min-w-0 items-center gap-2">
                <CurrencyLogo currency={token} size={18} />
                <Link className="truncate transition-colors hover:text-primary" to={tokenExplorePath}>
                    {token.symbol}
                </Link>
                <span className="text-xs text-text-300">{truncateHash(address)}</span>
            </span>
            <Button type="button" variant="icon" size="icon" className="h-6 w-6 rounded-md" onClick={handleCopy}>
                <Copy size={12} />
            </Button>
            {explorerUrl && (
                <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-text-100 transition-colors hover:bg-card-light"
                >
                    <ExternalLink size={12} />
                </a>
            )}
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

function formatCreatedOn(createdAtTimestamp: string | undefined) {
    if (!createdAtTimestamp) return "-";

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(Number(createdAtTimestamp) * 1000));
}

export function NAVHookPoolAttributesPanel({ pool, token0, token1, poolStats }: NAVHookPoolAttributesPanelProps) {
    const priceDetails = useMemo<PoolPriceDetails | null>(() => {
        if (!pool || !token0 || !token1) return null;

        return {
            direct: {
                baseSymbol: token0.symbol || "Token",
                quoteSymbol: token1.symbol || "Token",
                value: pool.token0Price.toSignificant(8),
            },
            inverse: {
                baseSymbol: token1.symbol || "Token",
                quoteSymbol: token0.symbol || "Token",
                value: pool.token1Price.toSignificant(8),
            },
        };
    }, [pool, token0, token1]);

    return (
        <section className="flex h-fit flex-col gap-4 rounded-xl border border-card-border bg-card p-5 text-left">
            <p className="text-lg font-semibold text-text-100">Pool Attributes</p>
            <div className="[&>*:first-child]:pt-0 [&>*:last-child]:border-b-0 [&>*:last-child]:pb-0">
                <OverviewAttribute label="Base asset" value={<AssetValue token={token0} />} />
                <OverviewAttribute label="Quote asset" value={<AssetValue token={token1} />} />
                <OverviewAttribute label="Current price" value={<CurrentPriceValue priceDetails={priceDetails} />} />
                <OverviewAttribute label="Transactions" value={formatAmount(poolStats.txCount, 0)} />
                <OverviewAttribute label="Created on" value={formatCreatedOn(poolStats.createdAtTimestamp)} />
            </div>
        </section>
    );
}
