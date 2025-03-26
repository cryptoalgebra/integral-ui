import { CurrencyAmounts } from "@/components/common/CurrencyAmounts";
import RemoveALMLiquidityModal from "@/components/modals/RemoveALMLiquidityModal";
import { Skeleton } from "@/components/ui/skeleton";
import { UserALMVault } from "@/hooks/alm/useUserALMVaults";
import { formatAmount } from "@/utils/common/formatAmount";

interface ALMPositionCardProps {
    userVault: UserALMVault | undefined;
}

const ALMPositionCard = ({ userVault }: ALMPositionCardProps) => {
    if (!userVault) return null;

    const { token0, token1 } = userVault.vault;

    const positionLiquidityUSD = userVault.amountsUsd;
    const positionAPR = userVault.vault.apr;

    return (
        <div className="flex flex-col gap-6 bg-card border border-card-border rounded-3xl p-4 animate-fade-in">
            <div className="relative flex w-full justify-end text-right">
                <img
                    className="absolute left-0 top-0  w-[160px] h-[160px] overflow-hidden rounded-full"
                    src="https://docs.ichi.org/~gitbook/image?url=https%3A%2F%2F1172929898-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FOUojwAvkzrENCQOkhMq6%252Fuploads%252F0yEP2totj9XMMs5JUfTm%252Fimage.png%3Falt%3Dmedia%26token%3D675aed61-9724-4514-91ae-df99bbc86f91&width=768&dpr=4&quality=100&sign=a8e20ee9&sv=2"
                    alt="ALM"
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
                                    <Skeleton className="w-[100px] h-[30px]" />
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
                    </div>
                </div>
            </div>

            <CurrencyAmounts amount0Parsed={userVault.amount0} amount1Parsed={userVault.amount1} token0={token0} token1={token1} />

            <div className="flex gap-4 w-full whitespace-nowrap">
                <RemoveALMLiquidityModal userVault={userVault} />
            </div>

            {/* <CollectFees positionFeesUSD={positionFeesUSD} mintInfo={mintInfo} positionId={selectedPosition.id} /> */}
            {/* <TokenRatio mintInfo={mintInfo} /> */}
        </div>
    );
};

export default ALMPositionCard;
