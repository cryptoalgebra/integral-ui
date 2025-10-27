import { CurrencyAmounts } from "@/components/common/CurrencyAmounts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/utils/common/formatAmount";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Address } from "viem";
import { UserALMVault } from "../../hooks";
import { AddALMLiquidityModal, RemoveALMLiquidityModal } from "..";
import { HarvestAndExitALMFarmingCard } from "../HarvestAndExitALMFarmingCard";
import { Farming } from "@/types/farming-info";

interface ALMPositionCardProps {
    userVault: UserALMVault | undefined;
    poolAddress: Address | undefined;
    farming: Farming | undefined | null;
}

export const ALMPositionCard = ({ userVault, poolAddress, farming }: ALMPositionCardProps) => {
    if (!userVault) return null;

    const activeFarming = farming?.farming;

    const { token0, token1 } = userVault.vault;

    const positionLiquidityUSD = userVault.amountsUsd;
    const positionAPR = userVault.vault.apr;

    const pnl = Number(userVault.pnl);

    return (
        <div className="flex flex-col gap-6 bg-card border border-card-border rounded-xl p-4 animate-fade-in">
            <div className="relative flex w-full justify-start text-left">
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="flex gap-2 scroll-m-20 text-2xl font-bold tracking-tight bg-card-hover -mx-4 px-4 -mt-4 py-4 rounded-t-xl border-b border-card-border lg:text-2xl">
                        <CurrencyLogo currency={userVault.vault.depositToken} size={30} />
                        <span>{userVault.vault.name}</span>
                    </h2>

                    <div className="flex gap-8 -mx-4 px-4 pb-4 border-b border-card-border">
                        <div>
                            <div className="font-bold text-xs text-text-100/75 mb-2">LIQUIDITY</div>
                            <div className="font-semibold text-xl">
                                {positionLiquidityUSD ? (
                                    <span>${formatAmount(positionLiquidityUSD, 4)}</span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px] ml-auto" />
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-xs text-text-100/75 mb-2">APR</div>
                            <div className="font-semibold text-xl">
                                {positionAPR >= 0 ? (
                                    <span>{formatAmount(positionAPR, 2)}%</span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px] ml-auto" />
                                )}
                            </div>
                        </div>
                        <div className="flex w-full justify-between bg-card-dark rounded-lg">
                            <div className="text-left">
                                <div className="font-bold text-xs text-text-100/75 mb-2">NET RETURN</div>
                                <div className="font-semibold text-xl">
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
            {!userVault.onFarming && (
                <div className="flex gap-4 w-full whitespace-nowrap">
                    <RemoveALMLiquidityModal poolAddress={poolAddress} userVault={userVault} />
                </div>
            )}

            {activeFarming && userVault.onFarming && (
                <HarvestAndExitALMFarmingCard eternalFarming={activeFarming} almPosition={userVault} isEnded={false} />
            )}
            {/* <CollectFees positionFeesUSD={positionFeesUSD} mintInfo={mintInfo} positionId={selectedPosition.id} /> */}
            {/* <TokenRatio mintInfo={mintInfo} /> */}
        </div>
    );
};
