import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePrepareAlgebraPositionManagerMulticall } from "@/generated";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import { usePositionFees } from "@/hooks/positions/usePositionFees";
import { IDerivedMintInfo } from "@/state/mintStore";
import { NonfungiblePositionManager } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useAccount, useContractWrite } from "wagmi";

interface CollectFeesProps {
    mintInfo: IDerivedMintInfo;
    positionFeesUSD: string | undefined;
    positionId: number;
}

const CollectFees = ({ mintInfo, positionFeesUSD, positionId }: CollectFeesProps) => {

    const { address: account } = useAccount()

    const pool = mintInfo.pool

    const { amount0, amount1 } = usePositionFees(
        pool ?? undefined,
        positionId,
        false
    );

    const zeroRewards = amount0?.equalTo('0') && amount1?.equalTo('0')

    const { calldata, value } = useMemo(() => {
        if (!account || !amount0 || !amount1)
            return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.collectCallParameters({
            tokenId: positionId.toString(),
            expectedCurrencyOwed0: amount0,
            expectedCurrencyOwed1: amount1,
            recipient: account,
        });
    }, [positionId, amount0, amount1, account]);


    const { config: collectConfig } = usePrepareAlgebraPositionManagerMulticall({
        args: calldata && [calldata as `0x${string}`[]],
        value: BigInt(value || 0)
    });

    const { data: collectData, write: collect } = useContractWrite(collectConfig)

    const { isLoading } = useTransitionAwait(collectData?.hash, 'Collect fees')

    const collectedFees = positionFeesUSD === '$0' && !zeroRewards ? '< $0.001' : positionFeesUSD

    return <div className="flex w-full justify-between bg-card-dark p-4 rounded-xl">
        <div className="text-left">
            <div className="font-bold text-xs">EARNED FEES</div>
            <div className="font-semibold text-2xl">
                {collectedFees ? <span className="text-cyan-300 drop-shadow-cyan">{collectedFees}</span> : <Skeleton className="w-[100px] h-[30px]" />}
            </div>
        </div>
        <Button size={'md'} disabled={!collect || zeroRewards || isLoading} onClick={() => collect && collect()}>
            {isLoading ? <Loader /> : 'Collect fees'}
        </Button>
    </div>

}

export default CollectFees