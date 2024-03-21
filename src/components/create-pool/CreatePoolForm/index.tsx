import { Button } from '@/components/ui/button';
import { useDerivedSwapInfo, useSwapState } from '@/state/swapStore';
import { useMemo } from 'react';
import { SwapField } from '@/types/swap-field';
import {
    INITIAL_POOL_FEE,
    NonfungiblePositionManager,
    computePoolAddress,
} from '@cryptoalgebra/integral-sdk';
import { usePrepareAlgebraPositionManagerMulticall } from '@/generated';
import { useTransitionAwait } from '@/hooks/common/useTransactionAwait';
import { Address, useContractWrite } from 'wagmi';
import { useDerivedMintInfo } from '@/state/mintStore';
import Loader from '@/components/common/Loader';
import { PoolState, usePool } from '@/hooks/pools/usePool';
import Summary from '../Summary';
import SelectPair from '../SelectPair';

const CreatePoolForm = () => {
    const { currencies } = useDerivedSwapInfo();

    const { typedValue } = useSwapState();

    const currencyA = currencies[SwapField.INPUT];
    const currencyB = currencies[SwapField.OUTPUT];

    const poolAddress =
        currencyA && currencyB
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
        INITIAL_POOL_FEE,
        currencyA ?? undefined,
        undefined
    );

    const { calldata, value } = useMemo(() => {
        if (!mintInfo?.pool)
            return {
                calldata: undefined,
                value: undefined,
            };

        return NonfungiblePositionManager.createCallParameters(mintInfo.pool);
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

    const { isLoading } = useTransitionAwait(
        createPoolData?.hash,
        'Create Pool',
        '',
        '/pools'
    );

    return (
        <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl text-left ml-2 mt-2">
                Select Pair
            </h2>
            <SelectPair
                mintInfo={mintInfo}
                currencyA={currencyA}
                currencyB={currencyB}
            />

            {!isPoolExists && (
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-2xl text-left ml-2 ">
                        Summary
                    </h2>
                    <Summary currencyA={currencyA} currencyB={currencyB} />
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
