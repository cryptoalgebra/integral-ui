// export const StyledDisabledDeposit = styled(Flex)`
//   align-items: center;
//   justify-content: center;
//   z-index: 2;
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 1rem;
//   background-color: rgba(0, 0, 0, 0.6);
//   border-radius: 16px;
// `;

import { useNeedAllowance } from "@/hooks/common/useNeedAllowance";
import { IDerivedMintInfo, useMintState, useMintActionHandlers } from "@/state/mintStore";
import { Currency, CurrencyAmount, Field, maxAmountSpend } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import EnterAmountCard from "../EnterAmountsCard";

interface EnterAmountsProps {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  mintInfo: IDerivedMintInfo;
}

const EnterAmounts = ({ currencyA, currencyB, mintInfo }: EnterAmountsProps) => {
  const { independentField, typedValue } = useMintState();

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(
    mintInfo.noLiquidity
  );

  const formattedAmounts = {
    [independentField]: typedValue,
    [mintInfo.dependentField]:
      mintInfo.parsedAmounts[mintInfo.dependentField]?.toSignificant(6) ?? '',
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(mintInfo.currencyBalances[field]),
    };
  }, {});

  const currencyAError = useMemo(() => {
    if (
      (mintInfo.errorCode !== 4 && mintInfo.errorCode !== 5) ||
      !mintInfo.errorMessage ||
      !currencyA
    )
      return;

    const erroredToken = mintInfo.errorMessage.split(' ')[1];
    const erroredSymbol = currencyA.isNative
      ? currencyA.symbol
      : currencyA.wrapped.symbol;

    if (erroredSymbol === erroredToken) return mintInfo.errorMessage;

    return;
  }, [mintInfo, currencyA]);

  const currencyBError = useMemo(() => {
    if (
      (mintInfo.errorCode !== 5 && mintInfo.errorCode !== 4) ||
      !mintInfo.errorMessage ||
      !currencyB
    )
      return;

    const erroredToken = mintInfo.errorMessage.split(' ')[1];

    if (currencyB.wrapped.symbol === erroredToken) return mintInfo.errorMessage;

    return;
  }, [mintInfo, currencyB]);

  const allowanceA = useNeedAllowance(
    currencyA,
    mintInfo.parsedAmounts[Field.CURRENCY_B]
  );

  const allowanceB = useNeedAllowance(
    currencyB,
    mintInfo.parsedAmounts[Field.CURRENCY_B]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex relative">
        <EnterAmountCard
          currency={currencyA}
          value={formattedAmounts[Field.CURRENCY_A]}
          valueForApprove={mintInfo.parsedAmounts[Field.CURRENCY_A]}
          handleChange={value => onFieldAInput(value)}
          needApprove={allowanceA}
          error={currencyAError}
        />
        {mintInfo.depositADisabled && (
          <div>
            For selected range this deposit is disabled
          </div>
        )}
      </div>
      <div className="flex relative">
        <EnterAmountCard
          currency={currencyB}
          value={formattedAmounts[Field.CURRENCY_B]}
          needApprove={allowanceB}
          valueForApprove={mintInfo.parsedAmounts[Field.CURRENCY_B]}
          handleChange={value => onFieldBInput(value)}
          error={currencyBError}
        />
        {mintInfo.depositBDisabled && (
          <div>
            For selected range this deposit is disabled
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterAmounts;
