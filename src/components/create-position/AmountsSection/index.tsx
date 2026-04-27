import { Currency } from "@cryptoalgebra/integral-sdk";
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

            <div className="flex items-center justify-between gap-2">
                {poolAPR ? (
                    <span className="rounded-full bg-panel text-text px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em]">
                        Pool APR: {formatAmount(poolAPR, 2)}%
                    </span>
                ) : null}
                {apr ? (
                    <span className="rounded-full bg-primary/50 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-text">
                        Estimated APR: {formatAmount(apr, 2)}%
                    </span>
                ) : null}
                {shouldUseOmegaRouter ? (
                    <BoostedAPR
                        baseAPR={poolAPR}
                        token0Apr={token0Apr}
                        token1Apr={token1Apr}
                        token0Name={currencyA?.wrapped.name}
                        token1Name={currencyB?.wrapped.name}
                    />
                ) : null}
            </div>

            {/* <HoverCard>
                <HoverCardTrigger>
                    <TokenRatio mintInfo={mintInfo} />
                </HoverCardTrigger>
                <HoverCardContent className="flex flex-col gap-2 bg-card rounded-xl border border-card-border text-text-100 w-fit">
                    <div className="flex items-center">
                        <span className="font-bold">Token Ratio</span>
                    </div>
                </HoverCardContent>
            </HoverCard> */}
        </>
    );
};

export default AmountsSection;
