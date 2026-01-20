import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatAmount } from "@/utils";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useALMVaultsByPool } from "../../hooks";
import { Address } from "viem";

export function ALMTag({ poolAddress }: { poolAddress: Address }) {
    const { vaults, isLoading } = useALMVaultsByPool(poolAddress);

    if (isLoading || !vaults || vaults.length === 0) {
        return (
            <div className="flex h-[26px] w-fit cursor-pointer items-center justify-center rounded-full bg-sky-500/20 border border-sky-800 text-sky-800 px-3 py-1 text-xs font-bold duration-200 hover:opacity-80 max-md:text-xs">
                ALM
            </div>
        );
    }

    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="flex h-[26px] w-fit cursor-pointer items-center justify-center rounded-full bg-sky-500/20 border border-sky-800 text-sky-800 px-3 py-1 text-xs font-bold duration-200 hover:opacity-80 max-md:text-xs">
                    ALM
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="min-w-[280px] text-sm p-3">
                <p className="text-wrap text-left text-sm">Automated Liquidity Management</p>
                <div className="flex flex-col gap-3">
                    {vaults.map((vault) => (
                        <div key={vault.id} className="flex justify-between items-center gap-4 rounded-lg bg-card-dark p-2">
                            {/* Deposit Token */}
                            <div className="flex flex-col items-start gap-1">
                                <p className="text-xs opacity-60">Deposit Token</p>
                                <div className="flex items-center gap-1">
                                    <CurrencyLogo currency={vault.depositToken} size={16} />
                                    <span>{vault.depositToken.symbol}</span>
                                </div>
                            </div>

                            {/* TVL */}
                            <div className="flex flex-col items-start gap-1">
                                <p className="text-xs opacity-60">TVL</p>
                                <span>${formatAmount(vault.tvlUsd, 2)}</span>
                            </div>

                            {/* APR */}
                            <div className="flex flex-col items-start gap-1">
                                <p className="text-xs opacity-60">APR</p>
                                <span>{formatAmount(vault.apr, 2)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
