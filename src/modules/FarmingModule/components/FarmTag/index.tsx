import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatAmount } from "@/utils";
import { Address, formatUnits } from "viem";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useEternalFarmingsQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { useCurrency } from "@/hooks/common/useCurrency";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useReadAlgebraVirtualPoolRewardReserves } from "@/generated";

export function FarmTag({ poolAddress }: { poolAddress: string }) {
    const { farmingClient } = useClients();

    const { data: farmings } = useEternalFarmingsQuery({
        variables: {
            pool: poolAddress,
        },
        client: farmingClient,
    });

    const activeFarming = farmings?.eternalFarmings.filter((farming) => !farming.isDeactivated)[0];

    const { data: rewardReserves } = useReadAlgebraVirtualPoolRewardReserves({
        address: activeFarming?.virtualPool as Address,
    });

    const rewardCurrency = useCurrency(activeFarming?.rewardToken as Address);
    const rewardsPerDay =
        activeFarming &&
        rewardCurrency &&
        Number(formatUnits(BigInt(activeFarming.rewardRate), Number(rewardCurrency.decimals))) * 60 * 60 * 24;
    const rewardsLeftFor =
        activeFarming && rewardReserves && Number(formatUnits(rewardReserves[0], Number(rewardCurrency?.decimals))) / (rewardsPerDay || 1);

    const hasBonusRewardToken = activeFarming?.bonusRewardToken !== ADDRESS_ZERO;
    const bonusRewardCurrency = useCurrency(activeFarming?.bonusRewardToken as Address);
    const bonusRewardsPerDay =
        activeFarming &&
        Number(formatUnits(BigInt(activeFarming.bonusRewardRate), Number(bonusRewardCurrency?.decimals || 0))) * 60 * 60 * 24;
    const bonuseRewardsLeftFor =
        activeFarming &&
        rewardReserves &&
        Number(formatUnits(BigInt(rewardReserves[1]), Number(bonusRewardCurrency?.decimals))) / (bonusRewardsPerDay || 1);

    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="flex h-[26px] w-fit cursor-pointer items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-800 text-yellow-800 px-3 py-1 text-xs font-bold duration-200 hover:opacity-80 max-md:text-xs">
                    FARM
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="w-fit text-sm p-3">
                <p className="text-wrap text-left text-sm">Farm rewards</p>
                <div className="flex gap-6 rounded-lg bg-card-dark p-2">
                    <div className="flex flex-col items-start gap-2">
                        <p className="text-xs opacity-60">Token</p>
                        <div className="flex items-center gap-1">
                            <CurrencyLogo currency={rewardCurrency} size={18} />
                            <span>{rewardCurrency?.symbol}</span>
                        </div>
                        {hasBonusRewardToken ? (
                            <div className="flex items-center gap-1">
                                <CurrencyLogo currency={bonusRewardCurrency} size={18} />
                                <span>{bonusRewardCurrency?.symbol}</span>
                            </div>
                        ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <p className="text-xs opacity-60">Rewards per day</p>
                        <span>
                            {formatAmount(rewardsPerDay || 0, 4)} {rewardCurrency?.symbol}
                        </span>
                        {hasBonusRewardToken ? (
                            <span>
                                {formatAmount(bonusRewardsPerDay || 0, 4)} {bonusRewardCurrency?.symbol}
                            </span>
                        ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <p className="text-xs opacity-60">Left for</p>
                        <span>{rewardsLeftFor?.toFixed(0)} days</span>
                        {hasBonusRewardToken ? <span>{bonuseRewardsLeftFor?.toFixed(0)} days</span> : null}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
