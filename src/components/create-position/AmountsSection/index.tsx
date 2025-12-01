import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import TokenRatio from "../TokenRatio";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { IDerivedMintInfo } from "@/state/mintStore";
import { usePositionAPR } from "@/hooks/positions/usePositionAPR";
import { getPoolAPR } from "@/utils/pool/getPoolAPR";
import { Address } from "viem";
import { useEffect, useState } from "react";
import EnterAmounts from "../EnterAmounts";
import { useParams } from "react-router-dom";
import { formatAmount } from "@/utils";
import { isBoostedPool } from "@/utils/pool/isBoostedPool";
import AddLiquidityButton from "../AddLiquidityButton";
import { enabledModules } from "config";

import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
const { useBoostedTokenAPR } = BoostedPoolsModule.hooks;
const { BoostedAPR } = BoostedPoolsModule.components;

const { AddOmegaLiquidityButton } = BoostedPoolsModule.components;

interface AmountsSectionProps {
    tokenId?: number;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
    handleCloseModal?: () => void;
}

type NewPositionPageParams = Record<"pool", Address>;

const AmountsSection = ({ tokenId, currencyA, currencyB, mintInfo, handleCloseModal }: AmountsSectionProps) => {
    const { pool: poolAddress } = useParams<NewPositionPageParams>();

    const [poolAPR, setPoolAPR] = useState<number>();
    const apr = usePositionAPR(poolAddress, mintInfo.position);

    const shouldUseOmegaRouter = mintInfo.pool && isBoostedPool(mintInfo.pool) && enabledModules.BoostedPoolsModule;

    const { data: token0Apr } = useBoostedTokenAPR(currencyA?.wrapped.isBoosted ? (currencyA.wrapped.address as Address) : undefined);
    const { data: token1Apr } = useBoostedTokenAPR(currencyB?.wrapped.isBoosted ? (currencyB.wrapped.address as Address) : undefined);

    useEffect(() => {
        if (!poolAddress) return;
        getPoolAPR(poolAddress).then(setPoolAPR);
    }, [poolAddress]);

    return (
        <>
            <EnterAmounts currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} />
            <HoverCard>
                <HoverCardTrigger className="px-2">
                    <TokenRatio mintInfo={mintInfo} />
                </HoverCardTrigger>
                <HoverCardContent className="flex flex-col gap-2 bg-card rounded-xl border border-card-border text-text-100 w-fit">
                    <div className="flex items-center">
                        <span className="font-bold">Token Ratio</span>
                    </div>
                </HoverCardContent>
            </HoverCard>
            <div className="flex justify-between py-3 border-t border-card-border">
                <div>
                    <div className="text-xs font-bold">ESTIMATED POSITION APR</div>
                    <div className="text-lg font-bold text-green-300">{apr ? `${apr.toFixed(2)}%` : 0}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold">POOL APR</div>
                    <div className="flex gap-2 items-center text-left">
                        {shouldUseOmegaRouter ? (
                            <BoostedAPR
                                baseAPR={poolAPR}
                                token0Apr={token0Apr}
                                token1Apr={token1Apr}
                                token0Name={currencyA?.wrapped.name}
                                token1Name={currencyB?.wrapped.name}
                            />
                        ) : null}
                        <span className="text-lg font-bold text-cyan-300">
                            {poolAPR !== undefined ? `${formatAmount(poolAPR, 2)}%` : null}{" "}
                        </span>
                    </div>
                </div>
            </div>
            {shouldUseOmegaRouter ? (
                <AddOmegaLiquidityButton
                    mintInfo={mintInfo}
                    poolAddress={poolAddress}
                    tokenId={tokenId}
                    handleCloseModal={handleCloseModal}
                />
            ) : (
                <AddLiquidityButton
                    baseCurrency={currencyA}
                    quoteCurrency={currencyB}
                    mintInfo={mintInfo}
                    poolAddress={poolAddress}
                    tokenId={tokenId}
                    handleCloseModal={handleCloseModal}
                />
            )}
        </>
    );
};

export default AmountsSection;
