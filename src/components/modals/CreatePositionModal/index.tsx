import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Button } from "@/components/ui/button";
import { Credenza, CredenzaBody, CredenzaContent, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";
import { useToast } from "@/components/ui/use-toast";
import { CreateManualPosition } from "@/pages/NewPosition/CreateManualPosition";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Address } from "viem";

interface CreatePositionModalProps {
    poolAddress?: Address;
    token0?: Currency;
    token1?: Currency;
    feeTier?: string;
    poolAddressLabel?: string;
    poolExplorerUrl?: string;
    children: React.ReactNode;
}

const CreatePositionModal = ({
    poolAddress,
    token0,
    token1,
    feeTier,
    poolAddressLabel,
    poolExplorerUrl,
    children,
}: CreatePositionModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if (!poolAddress) return;

        navigator.clipboard.writeText(poolAddress);
        toast({
            title: "Copied",
            description: "Address copied to clipboard",
        });
    };

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent
                className="overflow-hidden border border-border bg-card p-0 gap-0 shadow-sm md:max-w-[800px] max-h-screen"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader className="flex items-center justify-between gap-4 border-b border-border p-4">
                    <CredenzaTitle className="flex flex-wrap items-center gap-4 text-xl font-medium text-text">
                        <div className="flex items-center pt-1">
                            <CurrencyLogo currency={token0} size={40} />
                            <CurrencyLogo currency={token1} size={40} className="-ml-3" />
                        </div>

                        <div className="flex flex-col gap-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="font-bold text-lg leading-tight text-text">
                                    {token0?.symbol && token1?.symbol ? `${token0.symbol} / ${token1.symbol}` : ""}
                                </h1>
                                <span className="rounded-full bg-panel text-text px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em]">
                                    {feeTier}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                                <span>{poolAddressLabel}</span>
                                {poolExplorerUrl ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="icon"
                                            size="icon"
                                            className="h-6 w-6 rounded-md"
                                            onClick={handleCopy}
                                        >
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
                    </CredenzaTitle>
                </CredenzaHeader>

                <CredenzaBody className="overflow-y-auto p-4 w-full">
                    <CreateManualPosition poolAddress={poolAddress} handleCloseModal={() => setIsOpen(false)} />
                </CredenzaBody>
            </CredenzaContent>
        </Credenza>
    );
};

export default CreatePositionModal;
