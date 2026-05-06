import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { ArrowDownUp, ChevronLeft, Copy, ExternalLink, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface TokenHeroSectionProps {
    token: Currency | undefined;
    tokenId: string | undefined;
    tokenAddressLabel: string;
    tokenExplorerUrl: string | undefined;
    backToPath: string;
}

export function TokenHeroSection({ token, tokenId, tokenAddressLabel, tokenExplorerUrl, backToPath }: TokenHeroSectionProps) {
    const { toast } = useToast();

    const handleCopy = () => {
        if (!tokenId) return;
        navigator.clipboard.writeText(tokenId);
        toast({
            title: "Copied",
            description: "Address copied to clipboard",
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <Link
                className="inline-flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-text-muted transition-colors duration-150 hover:text-text"
                to={backToPath}
            >
                <ChevronLeft size={16} />
                Back to Tokens
            </Link>

            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-wrap items-center gap-4">
                    <CurrencyLogo currency={token} size={48} />

                    <div className="flex flex-col gap-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-bold text-4xl text-text">{token?.symbol || "Token"}</h1>
                            {token?.name ? (
                                <span className="rounded-full bg-panel px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                                    {token.name}
                                </span>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                            <span>{tokenAddressLabel}</span>
                            {tokenExplorerUrl ? (
                                <>
                                    <Button type="button" variant="icon" size="icon" className="h-6 w-6 rounded-md" onClick={handleCopy}>
                                        <Copy size={12} />
                                    </Button>
                                    <a
                                        href={tokenExplorerUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-text transition-colors duration-150 hover:bg-panel-hover"
                                    >
                                        <ExternalLink size={12} />
                                    </a>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:grid-cols-2 xl:w-auto">
                    <Link className="w-fit" to="/swap">
                        <Button variant="primary" size="md">
                            <ArrowDownUp size={18} />
                            Trade
                        </Button>
                    </Link>
                    <Link className="w-fit" to="/pools">
                        <Button variant="primaryLink" size="md">
                            <Plus size={18} />
                            Create Position
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
