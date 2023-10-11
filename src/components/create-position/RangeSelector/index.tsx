import { IDerivedMintInfo } from "@/state/mintStore";
import { Bound, Currency, Price, Token } from "@cryptoalgebra/integral-sdk";
import { useMemo } from 'react';
import RangeSelectorPart from "../RangeSelectorPart";

// export const StyledCurrentPriceWrapper = styled(Flex)`
//   padding: 6px;
//   border-radius: 6px;
//   background-color: red;
//   border: 1px solid red;
// `;

// export const StyledCurrentPrice = styled.div`
//   background-color: green;
//   color: white;
//   border-radius: 6px;
//   padding: 4px 6px;
// `;

export interface RangeSelectorProps {
  priceLower: Price<Token, Token> | undefined;
  priceUpper: Price<Token, Token> | undefined;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  getDecrementLower: () => string;
  getIncrementLower: () => string;
  getDecrementUpper: () => string;
  getIncrementUpper: () => string;
  currencyA: Currency | null | undefined;
  currencyB: Currency | null | undefined;
  disabled: boolean;
  mintInfo: IDerivedMintInfo;
}

const RangeSelector = ({
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  getDecrementLower,
  getIncrementLower,
  getDecrementUpper,
  getIncrementUpper,
  currencyA,
  currencyB,
  disabled,
  mintInfo,
}: RangeSelectorProps) => {
  const tokenA = (currencyA ?? undefined)?.wrapped;
  const tokenB = (currencyB ?? undefined)?.wrapped;

  // TODO
  //   const initialTokenPrice = useInitialTokenPrice();
  // const initialTokenPrice = 11;

  const isSorted = useMemo(() => {
    return tokenA && tokenB && tokenA.sortsBefore(tokenB);
  }, [tokenA, tokenB]);

  const leftPrice = useMemo(() => {
    return isSorted ? priceLower : priceUpper?.invert();
  }, [isSorted, priceLower, priceUpper]);

  const rightPrice = useMemo(() => {
    return isSorted ? priceUpper : priceLower?.invert();
  }, [isSorted, priceUpper, priceLower]);

  // const currentPrice = useMemo(() => {
  //   if (!mintInfo.price) return;

  //   let _price = mintInfo.invertPrice
  //     ? parseFloat(mintInfo.price.invert().toSignificant(5))
  //     : parseFloat(mintInfo.price.toSignificant(5));

  //   if (Number(_price) <= 0.0001) {
  //     return `< 0.0001 ${currencyB?.symbol}`;
  //   } else {
  //     return `${_price} ${currencyB?.symbol}`;
  //   }
  // }, [mintInfo.price, initialTokenPrice]);

  return (
    <>
      {/* {currentPrice && (
        <StyledCurrentPriceWrapper
          alignItems="center"
          justifyContent="space-between"
          mb={8}>
          <Heading className="mb-05 mxs_mt-05">
            {initial
              ? `Initial ${currencyA?.symbol} to ${currencyB?.symbol} price`
              : `Current ${currencyA?.symbol} to ${currencyB?.symbol} price`}
          </Heading>
          <Skeleton
            startColor="grayBorderBox"
            endColor="bgBoxLighter"
            h="28px"
            w={currentPrice ? 'fit-content' : '40px'}
            isLoaded={Boolean(currentPrice)}>
            <StyledCurrentPrice>{currentPrice}</StyledCurrentPrice>
          </Skeleton>
        </StyledCurrentPriceWrapper>
      )} */}
      <div className="flex gap-4">
        <RangeSelectorPart
          value={
            mintInfo.ticksAtLimit[Bound.LOWER]
              ? '0'
              : leftPrice?.toSignificant(5) ?? ''
          }
          onUserInput={onLeftRangeInput}
          width="100%"
          decrement={isSorted ? getDecrementLower : getIncrementUpper}
          increment={isSorted ? getIncrementLower : getDecrementUpper}
          decrementDisabled={mintInfo.ticksAtLimit[Bound.LOWER]}
          incrementDisabled={mintInfo.ticksAtLimit[Bound.LOWER]}
          label={leftPrice ? `${currencyB?.symbol}` : '-'}
          initialPrice={mintInfo.price}
          disabled={disabled}
          title={'Min price'}
        />
        <RangeSelectorPart
          value={
            mintInfo.ticksAtLimit[Bound.UPPER]
              ? '∞'
              : rightPrice?.toSignificant(5) ?? ''
          }
          onUserInput={onRightRangeInput}
          decrement={isSorted ? getDecrementUpper : getIncrementLower}
          increment={isSorted ? getIncrementUpper : getDecrementLower}
          incrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
          decrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
          label={rightPrice ? `${currencyB?.symbol}` : '-'}
          initialPrice={mintInfo.price}
          disabled={disabled}
          title={`Max price`}
        />
      </div>
    </>
  );
};

export default RangeSelector;
