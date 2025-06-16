import { CurrencyAmounts } from "@/components/common/CurrencyAmounts";
import RemoveALMLiquidityModal from "@/components/modals/RemoveALMLiquidityModal";
import { Skeleton } from "@/components/ui/skeleton";
import { UserALMVault } from "@/hooks/alm/useUserALMVaults";
import { formatAmount } from "@/utils/common/formatAmount";
import AddALMLiquidityModal from "@/components/modals/AddALMLiquidityModal";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Address } from "viem";

interface ALMPositionCardProps {
    userVault: UserALMVault | undefined;
    poolAddress: Address | undefined;
}

const ALMPositionCard = ({ userVault, poolAddress }: ALMPositionCardProps) => {
    if (!userVault) return null;

    const { token0, token1 } = userVault.vault;

    const positionLiquidityUSD = userVault.amountsUsd;
    const positionAPR = userVault.vault.apr;

    const pnl = Number(userVault.pnl);

    return (
        <div className="flex flex-col gap-6 bg-card border border-card-border rounded-3xl p-4 animate-fade-in">
            <div className="relative flex w-full justify-end text-right">
                <CurrencyLogo
                    className="absolute left-0 top-0  w-[160px] h-[160px] overflow-hidden rounded-full"
                    currency={userVault.vault.depositToken}
                    size={160}
                />
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-2xl">{userVault.vault.name}</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="font-bold text-xs">LIQUIDITY</div>
                            <div className="font-semibold text-2xl">
                                {positionLiquidityUSD ? (
                                    <span className="text-cyan-300">${formatAmount(positionLiquidityUSD, 4)}</span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px] ml-auto" />
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-xs">APR</div>
                            <div className="font-semibold text-2xl">
                                {positionAPR >= 0 ? (
                                    <span className="text-fuchsia-400">{formatAmount(positionAPR, 2)}%</span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px] ml-auto" />
                                )}
                            </div>
                        </div>
                        <div className="flex w-full justify-between bg-card-dark p-4 rounded-xl">
                            <div className="text-left">
                                <div className="font-bold text-xs">NET RETURN</div>
                                <div className="font-semibold text-2xl">
                                    <span className={Number(pnl) >= 0 ? "text-green-500" : "text-red-400"}>
                                        {formatAmount(Number(pnl), 6)} {userVault.vault.depositToken.symbol}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CurrencyAmounts amount0Parsed={userVault.amount0} amount1Parsed={userVault.amount1} token0={token0} token1={token1} />
            <div className="flex gap-4 w-full whitespace-nowrap">
                <AddALMLiquidityModal vault={userVault.vault} />
            </div>
            <div className="flex gap-4 w-full whitespace-nowrap">
                <RemoveALMLiquidityModal poolAddress={poolAddress} userVault={userVault} />
            </div>

            {/* <CollectFees positionFeesUSD={positionFeesUSD} mintInfo={mintInfo} positionId={selectedPosition.id} /> */}
            {/* <TokenRatio mintInfo={mintInfo} /> */}
        </div>
    );
};

export default ALMPositionCard;
