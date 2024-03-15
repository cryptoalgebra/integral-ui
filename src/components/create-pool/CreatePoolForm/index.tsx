import { Button } from '@/components/ui/button';
import { Equal } from 'lucide-react';
import TokenCard from '../TokenCard';
import {
    useDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState,
} from '@/state/swapStore';
import { useCallback } from 'react';
import { SwapField } from '@/types/swap-field';
import {
    Currency,
    INITIAL_POOL_FEE,
    Token,
    computePoolAddress,
    encodeSqrtRatioX96,
    toHex,
} from '@cryptoalgebra/integral-sdk';
import { usePrepareAlgebraPositionManagerCreateAndInitializePoolIfNecessary } from '@/generated';
import { useTransitionAwait } from '@/hooks/common/useTransactionAwait';
import { Address, useContractWrite } from 'wagmi';
import { useDerivedMintInfo, useMintActionHandlers } from '@/state/mintStore';
import { DEFAULT_CHAIN_ID } from '@/constants/default-chain-id';
import Loader from '@/components/common/Loader';

const CreatePoolForm = () => {
    const { onCurrencySelection, onUserInput } = useSwapActionHandlers();

    const { currencies } = useDerivedSwapInfo();

    const { typedValue } = useSwapState();

    const currencyA = currencies[SwapField.INPUT];
    const currencyB = currencies[SwapField.OUTPUT];

    const token0 = currencyA?.wrapped.address as Address;
    const token1 = currencyB?.wrapped.address as Address;

    const poolAddress =
        token0 && token1
            ? (computePoolAddress({
                  tokenA: new Token(DEFAULT_CHAIN_ID, token0, 18),
                  tokenB: new Token(DEFAULT_CHAIN_ID, token1, 18),
              }) as Address)
            : undefined;

    const mintInfo = useDerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        poolAddress ?? undefined,
        INITIAL_POOL_FEE,
        currencyA ?? undefined,
        undefined
    );

    const { onStartPriceInput } = useMintActionHandlers(mintInfo.noLiquidity);

    const sqrtRatioX96 = mintInfo.price
        ? encodeSqrtRatioX96(
              mintInfo.price.numerator,
              mintInfo.price.denominator
          )
        : undefined;

    const [sortedToken0, sortedToken1] =
        currencyA && currencyB
            ? currencyA.wrapped.sortsBefore(currencyB.wrapped)
                ? [token0, token1]
                : [token1, token0]
            : [undefined, undefined];

    const { config: createPoolConfig } =
        usePrepareAlgebraPositionManagerCreateAndInitializePoolIfNecessary({
            enabled: Boolean(token0 && token1 && sqrtRatioX96),
            args:
                sortedToken0 && sortedToken1 && sqrtRatioX96
                    ? [sortedToken0, sortedToken1, BigInt(toHex(sqrtRatioX96))]
                    : undefined,
        });

    const { data: createPoolData, write: createPool } =
        useContractWrite(createPoolConfig);

    const { isLoading } = useTransitionAwait(
        createPoolData?.hash,
        'Create Pool'
    );

    const handleInputSelect = useCallback(
        (inputCurrency: Currency) => {
            onCurrencySelection(SwapField.INPUT, inputCurrency);
        },
        [onCurrencySelection]
    );

    const handleOutputSelect = useCallback(
        (outputCurrency: Currency) => {
            onCurrencySelection(SwapField.OUTPUT, outputCurrency);
        },
        [onCurrencySelection]
    );

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(SwapField.INPUT, value);
            onStartPriceInput(value);
        },
        [onUserInput, onStartPriceInput]
    );

    return (
        <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl text-left ml-2 mt-2">
                Select Pair
            </h2>

            <div className="flex flex-col gap-2 items-center">
                <TokenCard
                    value={typedValue}
                    handleTokenSelection={handleInputSelect}
                    currency={currencyA}
                    otherCurrency={currencyB}
                    handleValueChange={handleTypeInput}
                />
                <Equal />
                <TokenCard
                    disabled
                    value={'1'}
                    currency={currencyB}
                    otherCurrency={currencyA}
                    handleTokenSelection={handleOutputSelect}
                />
            </div>

            <h2 className="font-semibold text-2xl text-left ml-2 ">Summary</h2>
            <div className="text-left ml-2">
                <p>
                    Pool: {currencyA?.symbol} / {currencyB?.symbol}
                </p>
                <p>
                    Initial Price: 1 {currencyB?.symbol} = {typedValue}{' '}
                    {currencyA?.symbol}
                </p>
            </div>

            <Button
                disabled={isLoading}
                onClick={() => createPool && createPool()}
            >
                {isLoading ? <Loader /> : 'Create Pool'}
            </Button>
        </div>
    );
};

export default CreatePoolForm;
