import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import TokenRatio from '../TokenRatio';
import { Currency } from '@cryptoalgebra/sdk';
import { IDerivedMintInfo } from '@/state/mintStore';
import { usePositionAPR } from '@/hooks/positions/usePositionAPR';
import { getPoolAPR } from '@/utils/pool/getPoolAPR';
import AddLiquidityButton from '../AddLiquidityButton';
import { Address } from 'viem';
import { useEffect, useState } from 'react';
import EnterAmounts from '../EnterAmounts';
import IncreaseLiquidityButton from '@/components/position/IncreaseLiquidityButton';
import { ManageLiquidity } from '@/types/manage-liquidity';
import { useParams } from 'react-router-dom';

interface AmountsSectionProps {
    tokenId?: number;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
    manageLiquidity: ManageLiquidity;
    handleCloseModal?: () => void;
}

type NewPositionPageParams = Record<'pool', Address>;

const AmountsSection = ({
    tokenId,
    currencyA,
    currencyB,
    mintInfo,
    manageLiquidity,
    handleCloseModal,
}: AmountsSectionProps) => {
    const { pool: poolAddress } = useParams<NewPositionPageParams>();

    const [poolAPR, setPoolAPR] = useState<number>();
    const apr = usePositionAPR(poolAddress, mintInfo.position);

    useEffect(() => {
        if (!poolAddress) return;
        getPoolAPR(poolAddress).then(setPoolAPR);
    }, [poolAddress]);

    return (
        <>
            <EnterAmounts
                currencyA={currencyA}
                currencyB={currencyB}
                mintInfo={mintInfo}
            />
            <HoverCard>
                <HoverCardTrigger>
                    <TokenRatio mintInfo={mintInfo} />
                </HoverCardTrigger>
                <HoverCardContent className="flex flex-col gap-2 bg-card rounded-3xl border border-card-border text-white w-fit">
                    <div className="flex items-center">
                        <span className="font-bold">Token Ratio</span>
                    </div>
                </HoverCardContent>
            </HoverCard>
            <div className="flex justify-between bg-card-dark p-2 px-3 rounded-xl">
                <div>
                    <div className="text-xs font-bold">
                        ESTIMATED POSITION APR
                    </div>
                    <div className="text-lg font-bold text-green-300">
                        {apr ? `${apr.toFixed(2)}%` : 0}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold">POOL APR</div>
                    <div className="text-lg font-bold text-cyan-300">
                        {poolAPR !== undefined ? `${poolAPR}%` : null}
                    </div>
                </div>
            </div>
            {manageLiquidity === ManageLiquidity.INCREASE && (
                <IncreaseLiquidityButton
                    tokenId={tokenId}
                    baseCurrency={currencyA}
                    quoteCurrency={currencyB}
                    mintInfo={mintInfo}
                    handleCloseModal={handleCloseModal}
                />
            )}
            {manageLiquidity === ManageLiquidity.ADD && (
                <AddLiquidityButton
                    baseCurrency={currencyA}
                    quoteCurrency={currencyB}
                    mintInfo={mintInfo}
                    poolAddress={poolAddress}
                />
            )}
        </>
    );
};

export default AmountsSection;
