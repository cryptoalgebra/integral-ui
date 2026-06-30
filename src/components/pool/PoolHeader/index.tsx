import CurrencyLogo from "@/components/common/CurrencyLogo";
import SecurityStatusTag from "@/components/pools/SecurityStatusTag";
import { Button } from "@/components/ui/button";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { PoolStats } from "@/hooks/pools/usePoolStats";
import { formatAmount } from "@/utils/common/formatAmount";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { ChevronLeft, ExternalLink, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Address } from "viem";

interface PoolHeaderProps {
    currencyA: Currency | undefined | null;
    currencyB: Currency | undefined | null;
    poolId: Address;
    poolStatus: number | undefined | null;
    stats: PoolStats;
    showCreatePosition?: boolean;
}

const PoolHeader = ({ currencyA, currencyB, poolId, poolStatus, stats, showCreatePosition = true }: PoolHeaderProps) => {
    const blockExplorerURL = useBlockExplorerURL();

    const headerStats = [
        {
            label: "TVL",
            value: `$${formatAmount(stats.tvlUSD, 2)}`,
        },
        {
            label: "Volume 24h",
            value: `$${formatAmount(stats.volume24USD, 2)}`,
        },
        {
            label: "Fees 24h",
            value: `$${formatAmount(stats.fees24USD, 2)}`,
        },
        {
            label: "APR",
            value: `${formatAmount(stats.avgApr, 2)}%`,
        },
    ];

    return (
        <header className="flex w-full flex-col gap-5 mb-6 animate-fade-in">
            <Link
                to="/pools"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-text-300 transition-colors hover:text-text-100"
            >
                <ChevronLeft size={18} />
                Pools
            </Link>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4 text-left">
                    <div className="flex items-center">
                        <CurrencyLogo currency={currencyA} size={48} />
                        <CurrencyLogo currency={currencyB} size={48} className="-ml-4 ring-4 ring-card" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold leading-tight text-text-100 md:text-3xl">
                                {currencyA?.symbol || "..."} - {currencyB?.symbol || "..."}
                            </h1>
                            <SecurityStatusTag status={poolStatus} />
                        </div>
                        <p className="text-base font-semibold text-text-300">Fee: {formatAmount(stats.fee, 4)}%</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                    <a
                        href={`${blockExplorerURL}/address/${poolId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-card-light text-text-300 transition-colors hover:text-text-100"
                        aria-label="Open pool in block explorer"
                    >
                        <ExternalLink size={18} />
                    </a>

                    {showCreatePosition && (
                        <Button variant="primaryLink" size="md" className="whitespace-nowrap rounded-full gap-2" asChild>
                            <Link to="new-position">
                                <Plus size={18} className="text-text-100" />
                                Create Position
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-card-border bg-bg-100/60 p-3 md:grid-cols-4 md:gap-3">
                {headerStats.map(({ label, value }) => (
                    <div key={label} className="flex min-h-16 flex-col items-start justify-center rounded-xl px-2 py-1 text-left">
                        <span className="text-sm font-semibold text-text-300">{label}</span>
                        <span className="text-xl font-semibold text-text-100">{stats.isLoading ? "..." : value}</span>
                    </div>
                ))}
            </div>
        </header>
    );
};

export default PoolHeader;
