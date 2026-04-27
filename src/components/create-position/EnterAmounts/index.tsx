import { IDerivedMintInfo, useMintState, useMintActionHandlers } from "@/state/mintStore";
import { Currency, Field } from "@cryptoalgebra/integral-sdk";
import { useEffect } from "react";
import EnterAmountCard from "../EnterAmountsCard";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";

interface EnterAmountsProps {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
}

const EnterAmounts = ({ currencyA, currencyB, mintInfo }: EnterAmountsProps) => {
    const { independentField, typedValue } = useMintState();

    const { onFieldAInput, onFieldBInput } = useMintActionHandlers(mintInfo.noLiquidity);

    const formattedAmounts = {
        [independentField]: typedValue,
        [mintInfo.dependentField]: mintInfo.parsedAmounts[mintInfo.dependentField]?.toSignificant(6) ?? "",
    };

    const usdcAmounts = {
        [independentField]: useUSDCValue(mintInfo.parsedAmounts[independentField])?.formatted,
        [mintInfo.dependentField]: useUSDCValue(mintInfo.parsedAmounts[mintInfo.dependentField])?.formatted,
    };

    useEffect(() => {
        return () => {
            onFieldAInput("");
            onFieldBInput("");
        };
    }, [onFieldAInput, onFieldBInput]);

    return (
        <div className="flex flex-col gap-2">
            <div className="relative flex w-full">
                <EnterAmountCard
                    currency={currencyA}
                    value={formattedAmounts[Field.CURRENCY_A]}
                    valueUsd={usdcAmounts[Field.CURRENCY_A]}
                    handleChange={(value) => onFieldAInput(value)}
                    field={Field.CURRENCY_A}
                />
                {mintInfo.depositADisabled && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 px-6 text-center text-sm font-medium text-text backdrop-blur-sm">
                        For selected range this deposit is disabled
                    </div>
                )}
            </div>
            <div className="relative flex w-full">
                <EnterAmountCard
                    currency={currencyB}
                    value={formattedAmounts[Field.CURRENCY_B]}
                    valueUsd={usdcAmounts[Field.CURRENCY_B]}
                    handleChange={(value) => onFieldBInput(value)}
                    field={Field.CURRENCY_B}
                />
                {mintInfo.depositBDisabled && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 px-6 text-center text-sm font-medium text-text backdrop-blur-sm">
                        For selected range this deposit is disabled
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnterAmounts;
