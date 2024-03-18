import { Button } from '@/components/ui/button';
import { ChevronsUpDownIcon, Equal } from 'lucide-react';
import TokenCard from '../TokenCard';
import {
    useDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState,
} from '@/state/swapStore';
import { useCallback, useEffect, useState } from 'react';
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
import CurrencyLogo from '@/components/common/CurrencyLogo';
import { Skeleton } from '@/components/ui/skeleton';
import {
    usePoolsListQuery,
    useSingleTokenQuery,
} from '@/graphql/generated/graphql';

const CreatePoolForm = () => {
    const [isPoolExists, setIsPoolExists] = useState(false);
    const [isSwapButtonVisible, setIsSwapButtonVisible] = useState(false);
    const [suggestedPrice, setSuggestedPrice] = useState(0);

    const { onCurrencySelection, onUserInput, onSwitchTokens } =
        useSwapActionHandlers();

    const { data: poolsList } = usePoolsListQuery();

    const { currencies } = useDerivedSwapInfo();

    const { typedValue } = useSwapState();

    const currencyA = currencies[SwapField.INPUT];
    const currencyB = currencies[SwapField.OUTPUT];

    const token0 = currencyA?.wrapped.address.toLowerCase() as Address;
    const token1 = currencyB?.wrapped.address.toLowerCase() as Address;

    const { data: singleToken0 } = useSingleTokenQuery({
        variables: {
            tokenId: token0,
        },
        skip: !token0,
    });

    const { data: singleToken1 } = useSingleTokenQuery({
        variables: {
            tokenId: token1,
        },
        skip: !token1,
    });

    const isSameTokens = token0 === token1;

    const poolAddress =
        currencyA && currencyB && !isSameTokens
            ? (computePoolAddress({
                  tokenA: new Token(
                      DEFAULT_CHAIN_ID,
                      currencyA.wrapped.address,
                      currencyA.decimals
                  ),
                  tokenB: new Token(
                      DEFAULT_CHAIN_ID,
                      currencyB.wrapped.address,
                      currencyB.decimals
                  ),
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
        currencyA && currencyB && !isSameTokens
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

    useEffect(() => {
        if (!poolsList) return;
        if (!poolAddress) return;
        const exist = poolsList.pools.find(
            (pool) => pool.id.toLowerCase() === poolAddress?.toLowerCase()
        );
        if (!exist) {
            setIsPoolExists(false);
            return;
        }
        setIsPoolExists(true);
    }, [poolAddress, poolsList, onSwitchTokens]);

    useEffect(() => {
        if (!singleToken0?.token || !singleToken1?.token) return;
        if (
            singleToken0.token.derivedMatic == 0 ||
            singleToken1.token.derivedMatic == 0
        ) {
            setSuggestedPrice(0);
            return;
        }

        const suggstdPrice =
            singleToken1.token.derivedMatic / singleToken0.token.derivedMatic;
        const filteredSuggstdPrice = Number(suggstdPrice.toFixed(4));
        setSuggestedPrice(filteredSuggstdPrice);
    }, [singleToken0, singleToken1, onSwitchTokens]);

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
                {isSwapButtonVisible ? (
                    <ChevronsUpDownIcon
                        onClick={onSwitchTokens}
                        className="cursor-pointer animate-fade-in w-12"
                        onMouseLeave={() => setIsSwapButtonVisible(false)}
                    />
                ) : (
                    <Equal
                        className="cursor-pointer w-12"
                        onMouseEnter={() => setIsSwapButtonVisible(true)}
                    />
                )}
                <TokenCard
                    disabled
                    value={'1'}
                    currency={currencyB}
                    otherCurrency={currencyA}
                    handleTokenSelection={handleOutputSelect}
                />
            </div>

            {!isPoolExists && (
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-2xl text-left ml-2 ">
                        Summary
                    </h2>
                    <div className="flex items-center gap-4 ml-2 justify-between">
                        <div className="flex">
                            <CurrencyLogo currency={currencyA} size={30} />
                            <CurrencyLogo
                                currency={currencyB}
                                size={30}
                                className="-ml-2"
                            />
                        </div>

                        {currencyA && currencyB ? (
                            <div className="mr-auto">{`${currencyA?.symbol} - ${currencyB?.symbol}`}</div>
                        ) : (
                            <Skeleton className="h-[20px] w-[90px] bg-card" />
                        )}

                        <div>
                            {`1 ${currencyB?.symbol} = ${typedValue || 0} ${
                                currencyA?.symbol
                            }`}
                        </div>
                    </div>
                    {suggestedPrice > 0 && (
                        <div className="text-left ml-2 flex justify-between">
                            <p className="opacity-50">Suggested price:</p>
                            <p className="opacity-50">{` 1 ${currencyB?.symbol} = ${suggestedPrice} ${currencyA?.symbol}`}</p>
                        </div>
                    )}
                </div>
            )}

            <Button
                className="mt-2"
                disabled={isLoading || isPoolExists || !typedValue}
                onClick={() => createPool && createPool()}
            >
                {isLoading ? (
                    <Loader />
                ) : isPoolExists ? (
                    'Pool already exists'
                ) : !typedValue ? (
                    'Enter initial price'
                ) : (
                    'Create Pool'
                )}
            </Button>
        </div>
    );
};

export default CreatePoolForm;
