import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";

interface BoostedTagProps {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
}

export function BoostedTag({ currencyA: token0, currencyB: token1 }: BoostedTagProps) {
    const isBoostedToken0 = token0 && token0.isBoosted;
    const isBoostedToken1 = token1 && token1.isBoosted;

    const token0Underlying = isBoostedToken0 ? token0.underlying : undefined;
    const token1Underlying = isBoostedToken1 ? token1.underlying : undefined;

    const hasBoostedTokens = isBoostedToken0 || isBoostedToken1;

    if (!hasBoostedTokens) return null;

    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="flex h-[26px] w-fit cursor-pointer items-center justify-center rounded-full bg-purple-500/20 border border-purple-500 text-purple-900 px-3 py-1 text-xs font-bold duration-200 hover:opacity-80 max-md:text-xs gap-1">
                    BOOSTED
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="w-[320px] text-sm p-4">
                <div>
                    <div>
                        <p className="font-semibold mb-1">Boosted Pool</p>
                        <p className="text-xs opacity-70 leading-relaxed">
                            This pool uses ERC4626 yield-bearing tokens that automatically earn rewards while providing liquidity
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <p className="text-xs font-semibold opacity-80">Pool Tokens:</p>
                        {isBoostedToken0 && (
                            <div className="flex items-center gap-2">
                                <CurrencyLogo currency={token0} size={20} />
                                <span className="text-sm font-medium">{token0?.name}</span>
                                <span className="text-xs opacity-50">→</span>
                                <CurrencyLogo currency={token0Underlying} size={16} />
                                <span className="text-xs opacity-70">{token0Underlying?.symbol}</span>
                            </div>
                        )}
                        {isBoostedToken1 && (
                            <div className="flex items-center gap-2">
                                <CurrencyLogo currency={token1} size={20} />
                                <span className="text-sm font-medium">{token1?.name}</span>
                                <span className="text-xs opacity-50">→</span>
                                <CurrencyLogo currency={token1Underlying} size={16} />
                                <span className="text-xs opacity-70">{token1Underlying?.symbol}</span>
                            </div>
                        )}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
