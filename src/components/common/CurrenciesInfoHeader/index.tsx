import { ADDRESS_ZERO, Currency } from "@cryptoalgebra/integral-sdk";
import CurrencyLogo from "../CurrencyLogo";
import { truncateHash } from "@/utils";
import { Button } from "@/components/ui/button";
import { Address } from "viem";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";

interface CurrenciesInfoHeaderProps {
    tokenA?: Currency | null;
    tokenB?: Currency | null;
}

function CopyButton({ address }: { address: string }) {
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        toast({
            title: "Coppied",
            description: "Address was coppied to clipboard",
        });
    };

    return (
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
            <Copy size={14} />
        </Button>
    );
}

function ExplorerLink({ address }: { address: string }) {
    const explorerUrl = `${useBlockExplorerURL()}/address/${address}`;

    return (
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
            <ExternalLink size={14} />
        </a>
    );
}
export function TokenInfo({ token }: { token?: Currency | null }) {
    const [expanded, setExpanded] = useState(false);
    if (!token) return null;

    const address = (token.wrapped.address as Address) || ADDRESS_ZERO;

    return (
        <span className="flex items-center gap-2 font-semibold">
            {token.symbol}
            <Button
                variant={"iconHover"}
                size={null}
                onClick={() => setExpanded(!expanded)}
                className="relative text-left px-2 transition-all duration-300 ease-in-out overflow-hidden max-w-[150px]"
                style={{
                    maxWidth: expanded ? "500px" : "150px",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                }}
                title={address}
            >
                {expanded ? address : truncateHash(address)}
            </Button>
            <CopyButton address={address} />
            <ExplorerLink address={address} />
        </span>
    );
}

export function CurrenciesInfoHeader({ tokenA, tokenB }: CurrenciesInfoHeaderProps) {
    if (tokenB === null)
        return (
            <div className="flex max-md:flex-col justify-between max-md:gap-4 md:items-center">
                <div className="flex items-center gap-4 text-xl font-semibold">
                    <CurrencyLogo currency={tokenA} size={42} />
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">{tokenA?.symbol}</span>
                        <span className="text-sm font-semibold">{tokenA?.name}</span>
                    </div>
                </div>
                <TokenInfo token={tokenA} />
            </div>
        );

    return (
        <div className="flex max-md:flex-col justify-between max-md:gap-4 md:items-center">
            <div className="flex items-center gap-4 text-xl font-semibold">
                <CurrencyLogo currency={tokenA} size={42} />
                <CurrencyLogo className="-ml-6" currency={tokenB} size={42} />
                {tokenA?.symbol} / {tokenB?.symbol}
            </div>
            <div className="flex flex-col text-sm font-semibold gap-1">
                <TokenInfo token={tokenA} />
                <TokenInfo token={tokenB} />
            </div>
        </div>
    );
}
