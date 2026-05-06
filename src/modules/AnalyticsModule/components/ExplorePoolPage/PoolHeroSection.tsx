import CurrencyLogo from "@/components/common/CurrencyLogo";
import CreatePositionModal from "@/components/modals/CreatePositionModal";
import SecurityStatusTag from "@/components/pools/SecurityStatusTag";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { ArrowDownUp, ChevronLeft, Copy, ExternalLink, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Address } from "viem";

interface PoolHeroSectionProps {
    token0: Currency | undefined;
    token1: Currency | undefined;
    fee: number | undefined;
    enableActions: boolean;
    poolId: string | undefined;
    poolSecurityStatus: number | null | undefined;
    poolAddressLabel: string;
    poolExplorerUrl: string | undefined;
    onSuccess: () => void;
}

export function PoolHeroSection({
    token0,
    token1,
    fee,
    enableActions,
    poolId,
    poolSecurityStatus,
    poolAddressLabel,
    poolExplorerUrl,
    onSuccess,
}: PoolHeroSectionProps) {
    const { toast } = useToast();

    const token0ExplorePath = token0?.wrapped?.address ? `/explore/token/${token0.wrapped.address}` : undefined;
    const token1ExplorePath = token1?.wrapped?.address ? `/explore/token/${token1.wrapped.address}` : undefined;

    const handleCopy = () => {
        if (!poolId) return;
        navigator.clipboard.writeText(poolId);
        toast({
            title: "Copied",
            description: "Address copied to clipboard",
        });
    };
    return (
        <div className="flex flex-col gap-4">
            <Link
                className="inline-flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-text-muted transition-colors duration-150 hover:text-text"
                to="/explore"
            >
                <ChevronLeft size={16} />
                Back to Explore
            </Link>

            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center pt-1">
                        <CurrencyLogo currency={token0} size={48} />
                        <CurrencyLogo currency={token1} size={48} className="-ml-3" />
                    </div>

                    <div className="flex flex-col gap-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-bold text-4xl text-text">
                                {token0?.symbol && token1?.symbol ? (
                                    <span className="inline-flex items-center gap-2">
                                        {token0ExplorePath ? (
                                            <Link className="transition-colors duration-150 hover:text-primary" to={token0ExplorePath}>
                                                {token0.symbol}
                                            </Link>
                                        ) : (
                                            <span>{token0.symbol}</span>
                                        )}
                                        <span className="text-text-muted">/</span>
                                        {token1ExplorePath ? (
                                            <Link className="transition-colors duration-150 hover:text-primary" to={token1ExplorePath}>
                                                {token1.symbol}
                                            </Link>
                                        ) : (
                                            <span>{token1.symbol}</span>
                                        )}
                                    </span>
                                ) : (
                                    ""
                                )}
                            </h1>
                            <span className="rounded-full bg-panel px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                                {fee !== undefined ? `${fee / 10_000}% fee` : "-"}
                            </span>
                            {!enableActions && <SecurityStatusTag status={poolSecurityStatus} />}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                            <span>{poolAddressLabel}</span>
                            {poolExplorerUrl ? (
                                <>
                                    <Button type="button" variant="icon" size="icon" className="h-6 w-6 rounded-md" onClick={handleCopy}>
                                        <Copy size={12} />
                                    </Button>
                                    <a
                                        href={poolExplorerUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-md  text-text transition-colors duration-150 hover:bg-panel-hover"
                                    >
                                        <ExternalLink size={12} />
                                    </a>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>

                {enableActions && (
                    <div className="flex items-center gap-3 sm:grid-cols-2 xl:w-auto">
                        <Link className="w-fit" to="/swap">
                            <Button variant="primary" size="md">
                                <ArrowDownUp size={18} />
                                Trade
                            </Button>
                        </Link>
                        <CreatePositionModal
                            poolAddress={poolId as Address | undefined}
                            token0={token0}
                            token1={token1}
                            fee={fee}
                            onSuccess={onSuccess}
                        >
                            <Button variant="primaryLink" size="md">
                                <Plus size={18} />
                                Create Position
                            </Button>
                        </CreatePositionModal>
                    </div>
                )}
            </div>
        </div>
    );
}
