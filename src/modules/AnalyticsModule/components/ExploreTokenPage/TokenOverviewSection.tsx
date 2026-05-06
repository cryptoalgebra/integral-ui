import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatAmount } from "@/utils";
import { truncateHash } from "@/utils/common/truncateHash";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { Copy, ExternalLink } from "lucide-react";
import { Address } from "viem";
import { TokenAnalyticsStatistics, TokenMarketInsights } from "./types";

function OverviewAttribute({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-2 border-b border-border py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <span className="text-text-muted">{label}</span>
            <div className="font-medium text-text sm:text-right">{value}</div>
        </div>
    );
}

function TokenValue({
    token,
    tokenAddress,
    tokenExplorerUrl,
}: {
    token: Currency | undefined;
    tokenAddress: Address | undefined;
    tokenExplorerUrl: string | undefined;
}) {
    const { toast } = useToast();

    if (!token || !tokenAddress) return <span>-</span>;

    const handleCopy = () => {
        navigator.clipboard.writeText(tokenAddress);
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
                <span className="text-xs text-text-muted">{truncateHash(tokenAddress)}</span>
            </span>
            <Button type="button" variant="icon" size="icon" className="h-6 w-6 rounded-md" onClick={handleCopy}>
                <Copy size={12} />
            </Button>
            {tokenExplorerUrl ? (
                <a
                    href={tokenExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-text transition-colors duration-150 hover:bg-panel-hover"
                >
                    <ExternalLink size={12} />
                </a>
            ) : null}
        </div>
    );
}

function SnapshotMetric({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0 first:pt-0">
            <span className="text-sm text-text-muted">{label}</span>
            <div className="text-right text-sm font-medium text-text">{value}</div>
        </div>
    );
}

function formatSupplyWithSymbol(totalSupply: string | undefined, symbol: string | undefined) {
    if (!totalSupply) return "-";
    return `${formatAmount(totalSupply, 2)} ${symbol || ""}`.trim();
}

function OverviewPanel({
    token,
    marketInsights,
    tokenAddress,
    tokenExplorerUrl,
}: {
    token: Currency | undefined;
    marketInsights: TokenMarketInsights;
    tokenAddress: Address | undefined;
    tokenExplorerUrl: string | undefined;
}) {
    return (
        <div>
            <p className="text-[11px] font-medium uppercase tracking-[2px] text-text-muted">Token Attributes</p>
            <div className="mt-4 [&>*:last-child]:border-b-0 [&>*:last-child]:pb-0 [&>*:first-child]:pt-0">
                <OverviewAttribute
                    label="Token"
                    value={<TokenValue token={token} tokenAddress={tokenAddress} tokenExplorerUrl={tokenExplorerUrl} />}
                />
                <OverviewAttribute label="Name" value={token?.name || "-"} />
                <OverviewAttribute label="Symbol" value={token?.symbol || "-"} />
                <OverviewAttribute label="Decimals" value={token ? String(token.decimals) : "-"} />
                <OverviewAttribute
                    label="Total supply (on-chain)"
                    value={formatSupplyWithSymbol(marketInsights.totalSupply, token?.symbol)}
                />
                <OverviewAttribute
                    label="Est. market cap"
                    value={marketInsights.marketCapUSD ? `$${formatAmount(marketInsights.marketCapUSD, 2)}` : "-"}
                />
            </div>
        </div>
    );
}

function SnapshotPanel({
    token,
    statistics,
    marketInsights,
}: {
    token: Currency | undefined;
    statistics: TokenAnalyticsStatistics | undefined;
    marketInsights: TokenMarketInsights;
}) {
    const reservesTokenValue = `${formatAmount(statistics?.tvl || 0, 4)} ${token?.symbol || ""}`.trim();
    const reservesUSDValue = `$${formatAmount(statistics?.tvlUSD || 0, 2)}`;

    return (
        <div>
            <p className="text-[11px] font-medium uppercase tracking-[2px] text-text-muted">Market Snapshot</p>

            <div className="mt-4 flex flex-col">
                <SnapshotMetric
                    label="Reserves"
                    value={
                        <>
                            <div>{reservesTokenValue || "-"}</div>
                            <div className="text-xs text-text-muted">{reservesUSDValue}</div>
                        </>
                    }
                />
                <SnapshotMetric label="All-time Volume" value={`$${formatAmount(marketInsights.allTimeVolumeUSD || 0, 2)}`} />
                <SnapshotMetric label="All-time Fees" value={`$${formatAmount(marketInsights.allTimeFeesUSD || 0, 2)}`} />
                <SnapshotMetric label="Transactions" value={formatAmount(marketInsights.allTimeTxCount || 0, 0)} />
            </div>
        </div>
    );
}

interface TokenOverviewSectionProps {
    token: Currency | undefined;
    statistics: TokenAnalyticsStatistics | undefined;
    marketInsights: TokenMarketInsights;
    tokenAddress: Address | undefined;
    tokenExplorerUrl: string | undefined;
}

export function TokenOverviewSection({ token, statistics, marketInsights, tokenAddress, tokenExplorerUrl }: TokenOverviewSectionProps) {
    return (
        <section className="flex flex-col gap-5">
            <h2 className="text-xl font-medium text-text">Overview</h2>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,1fr)] xl:gap-12">
                <OverviewPanel
                    token={token}
                    marketInsights={marketInsights}
                    tokenAddress={tokenAddress}
                    tokenExplorerUrl={tokenExplorerUrl}
                />
                <SnapshotPanel token={token} statistics={statistics} marketInsights={marketInsights} />
            </div>
        </section>
    );
}
