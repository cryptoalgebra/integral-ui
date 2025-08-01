import CurrencyLogo from "@/components/common/CurrencyLogo";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { usePositionFees } from "@/hooks/positions/usePositionFees";
import { IDerivedMintInfo } from "@/state/mintStore";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { formatAmount } from "@/utils";
import { NonfungiblePositionManager } from "@cryptoalgebra/custom-pools-sdk";
import { NONFUNGIBLE_POSITION_MANAGER } from "config/contract-addresses";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";

interface CollectFeesProps {
    mintInfo: IDerivedMintInfo;
    positionFeesUSD: string | undefined;
    positionId: number;
}

const CollectFees = ({ mintInfo, positionFeesUSD, positionId }: CollectFeesProps) => {
    const { address: account } = useAccount();
    const chainId = useChainId();

    const pool = mintInfo.pool;

    const { amount0, amount1, amount0Usd, amount1Usd } = usePositionFees(pool ?? undefined, positionId, true);

    const zeroRewards = amount0?.equalTo("0") && amount1?.equalTo("0");

    const { calldata, value } = useMemo(() => {
        if (!account || !amount0 || !amount1) return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.collectCallParameters({
            tokenId: positionId.toString(),
            expectedCurrencyOwed0: amount0,
            expectedCurrencyOwed1: amount1,
            recipient: account,
        });
    }, [positionId, amount0, amount1, account]);

    const collectConfig = calldata
        ? {
              address: NONFUNGIBLE_POSITION_MANAGER[chainId],
              args: [calldata as `0x${string}`[]] as const,
              value: BigInt(value || 0),
          }
        : undefined;

    const { data: collectData, writeContract: collect, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const { isLoading } = useTransactionAwait(collectData, {
        title: "Collect fees",
        tokenA: mintInfo.currencies.CURRENCY_A?.wrapped.address as Address,
        tokenB: mintInfo.currencies.CURRENCY_B?.wrapped.address as Address,
        type: TransactionType.POOL,
    });

    return (
        <div className="flex w-full justify-between bg-card-dark p-4 rounded-lg">
            <div className="text-left">
                <div className="font-bold text-xs">EARNED FEES</div>
                {positionFeesUSD ? (
                    <HoverCard closeDelay={0} openDelay={0}>
                        <HoverCardTrigger>
                            <span className="text-cyan-300  font-semibold text-2xl drop-shadow-cyan border-b border-dotted border-cyan-300 cursor-pointer">
                                {positionFeesUSD}
                            </span>
                        </HoverCardTrigger>
                        <HoverCardContent side="bottom" className="flex flex-col gap-2 p-2">
                            <h4>Tokens</h4>
                            <div className="flex flex-col p-2 gap-2 bg-card-dark rounded-lg">
                                <div className="flex items-center gap-6 justify-between">
                                    <div className="flex gap-2 items-center">
                                        <CurrencyLogo className="inline" currency={amount0?.currency} size={20} />
                                        <span>{amount0?.currency?.symbol}</span>
                                    </div>

                                    <div className="flex gap-1 items-end">
                                        <span>{formatAmount(amount0?.toExact() || 0, 6)}</span>
                                        <span className="opacity-50 text-sm">(${formatAmount(amount0Usd || 0, 2)})</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 justify-between">
                                    <div className="flex gap-2 items-center">
                                        <CurrencyLogo className="inline" currency={amount1?.currency} size={20} />
                                        <span>{amount1?.currency?.symbol}</span>
                                    </div>

                                    <div className="flex gap-1 items-end">
                                        <span>{formatAmount(amount1?.toExact() || 0, 6)}</span>
                                        <span className="opacity-50 text-sm">(${formatAmount(amount1Usd || 0, 2)})</span>
                                    </div>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                ) : (
                    <Skeleton className="w-[100px] h-[30px]" />
                )}
            </div>
            <Button
                size={"md"}
                disabled={!collect || zeroRewards || isLoading || isPending}
                onClick={() => collectConfig && collect(collectConfig)}
                className="min-w-[108px]"
            >
                {isLoading || isPending ? <Loader /> : "Collect fees"}
            </Button>
        </div>
    );
};

export default CollectFees;
