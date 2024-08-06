import { Button } from '@/components/ui/button';
import { useDerivedSwapInfo, useSwapState } from '@/state/swapStore';
import { useEffect, useMemo } from 'react';
import { SwapField } from '@/types/swap-field';
import {
    ADDRESS_ZERO,
    NonfungiblePositionManager,
    computePoolAddress,
} from '@cryptoalgebra/circuit-sdk';
import { usePrepareAlgebraPositionManagerMulticall } from '@/generated';
import { useTransactionAwait } from '@/hooks/common/useTransactionAwait';
import { Address, useContractWrite } from 'wagmi';
import { useDerivedMintInfo, useMintState } from '@/state/mintStore';
import Loader from '@/components/common/Loader';
import { PoolState, usePool } from '@/hooks/pools/usePool';
import Summary from '../Summary';
import SelectPair from '../SelectPair';
import { STABLECOINS } from '@/constants/tokens';
import { TransactionType } from '@/state/pendingTransactionsStore';

const CreatePoolForm = () => {
    const { currencies } = useDerivedSwapInfo();

    const { actions: { selectCurrency } } = useSwapState();

    const { startPriceTypedValue, actions: { typeStartPriceInput } } = useMintState()

    const currencyA = currencies[SwapField.INPUT];
    const currencyB = currencies[SwapField.OUTPUT];

    const areCurrenciesSelected = currencyA && currencyB;

    const isSameToken =
        areCurrenciesSelected && currencyA.wrapped.equals(currencyB.wrapped);

    const poolAddress =
        areCurrenciesSelected && !isSameToken
            ? (computePoolAddress({
                  tokenA: currencyA.wrapped,
                  tokenB: currencyB.wrapped,
              }) as Address)
            : undefined;

    const [poolState] = usePool(poolAddress);

    const isPoolExists = poolState === PoolState.EXISTS;

    const mintInfo = useDerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        poolAddress ?? undefined,
        100,
        currencyA ?? undefined,
        undefined
    );

    const { calldata, value } = useMemo(() => {
        if (!mintInfo?.pool)
            return {
                calldata: undefined,
                value: undefined,
            };

        return NonfungiblePositionManager.createCallParameters(mintInfo.pool, ADDRESS_ZERO);
    }, [mintInfo?.pool]);

    const { config: createPoolConfig } =
        usePrepareAlgebraPositionManagerMulticall({
            args: Array.isArray(calldata)
                ? [calldata as Address[]]
                : [[calldata] as Address[]],
            value: BigInt(value || 0),
            enabled: Boolean(calldata),
        });


    const { data: createPoolData, write: createPool } =
        useContractWrite(createPoolConfig);

    const { isLoading } = useTransactionAwait(
        createPoolData?.hash,
        {
            title: 'Create Pool',
            tokenA: currencyA?.wrapped.address as Address,
            tokenB: currencyB?.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        '/pools'
    );

    useEffect(() => {
        selectCurrency(SwapField.INPUT, undefined)
        selectCurrency(SwapField.OUTPUT, undefined)
        typeStartPriceInput('')

        return () => {
            selectCurrency(SwapField.INPUT, ADDRESS_ZERO)
            selectCurrency(SwapField.OUTPUT, STABLECOINS.USDT.address as Account)
            typeStartPriceInput('')
        }
    }, [])

    return (
        <div className="flex flex-col gap-1 p-2 bg-card border border-card-border rounded-3xl">
            <h2 className="font-semibold text-xl text-left ml-2 mt-2">
                Select Pair
            </h2>
            <SelectPair
                mintInfo={mintInfo}
                currencyA={currencyA}
                currencyB={currencyB}
            />

            {areCurrenciesSelected && !isSameToken && !isPoolExists && (
                <Summary currencyA={currencyA} currencyB={currencyB} />
            )}

            <Button
                className="mt-2"
                disabled={
                    isLoading || 
                    isPoolExists || 
                    !startPriceTypedValue || 
                    !areCurrenciesSelected ||
                    isSameToken
                }
                onClick={() => createPool && createPool()}
            >
                {isLoading ? (
                    <Loader />
                ) : isSameToken ? (
                    'Select another pair'
                ) : !areCurrenciesSelected ? (
                    'Select currencies'
                ) : isPoolExists ? (
                    'Pool already exists'
                ) : !startPriceTypedValue ? (
                    'Enter initial price'
                ) : (
                    'Create Pool'
                )}
            </Button>
        </div>
    );
};

export default CreatePoolForm;
