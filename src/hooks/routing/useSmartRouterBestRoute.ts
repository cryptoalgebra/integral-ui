import { useCallback, useDeferredValue, useEffect, useMemo, useRef } from 'react';
import { Percent, TradeType } from '@cryptoalgebra/custom-pools-sdk';
import {
    Currency,
    CurrencyAmount,
    Percent as PercentBN,
    PoolType,
    SmartRouter,
    SwapRouter,
} from '@cryptoalgebra/router-custom-pools';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useBlockNumber } from 'wagmi';

import {useUserSlippageToleranceWithDefault, useUserState} from '@/state/userStore';

import useDebounce from '../common/useDebounce';

import { useCommonPools } from './useRoutingPools';
import usePreviousValue from "@/hooks/uitls/usePreviousValue.ts";

const REFRESH_TIMEOUT = 15_000;

const MAX_HOPS = 2;
const MAX_SPLIT = 1;
const ALLOWED_VERSIONS = [PoolType.V2, PoolType.V3, PoolType.STABLE];

export function usePropsChanged(...args: any[]) {
    const prevArgs = usePreviousValue(args);
    return args.length !== prevArgs?.length || args.some((arg, i) => arg !== prevArgs[i]);
}

export function useSmartRouterBestRoute(
    amount: CurrencyAmount<Currency> | undefined,
    outputCurrency: Currency | undefined,
    isExactIn: boolean,
    isEnabled: boolean,
) {
    const queryClient = useQueryClient();

    const { txDeadline } = useUserState()

    const { address: account } = useAccount();

    const allowedSlippage = useUserSlippageToleranceWithDefault(new Percent(10, 10_000));

    const { data: blockNumber } = useBlockNumber({
        watch: true,
    });

    const keepPreviousDataRef = useRef<boolean>(true);

    const currenciesUpdated = usePropsChanged(amount?.currency, outputCurrency);

    if (currenciesUpdated) {
        keepPreviousDataRef.current = false;
    }

    const {
        refresh: refreshPools,
        pools: candidatePools,
        loading,
        syncing,
    } = useCommonPools(amount?.currency, outputCurrency ?? undefined, {
        blockNumber: Number(blockNumber),
        allowInconsistentBlock: true,
        enabled: true,
    });

    const poolProvider = useMemo(() => SmartRouter.createStaticPoolProvider(candidatePools), [candidatePools]);

    const deferQuotientRaw = useDeferredValue(amount?.quotient?.toString());
    const deferQuotient = useDebounce(deferQuotientRaw, 500);

    const {
        data: trade,
        status,
        fetchStatus,
        isPlaceholderData,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'getBestRoute',
            outputCurrency?.chainId,
            amount?.currency.symbol,
            outputCurrency?.symbol,
            isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
            deferQuotient,
            allowedSlippage,
            MAX_HOPS,
            MAX_SPLIT,
            ALLOWED_VERSIONS,
        ],
        queryFn: async ({ signal }) => {
            if (!amount || !amount.currency || !outputCurrency || !deferQuotient) {
                return undefined;
            }

            const deferAmount = CurrencyAmount.fromRawAmount(amount.currency, deferQuotient);

            const bestTrade = await SmartRouter.getBestTrade(
                deferAmount,
                outputCurrency,
                isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
                {
                    gasPriceWei: () => SmartRouter.publicClient.getGasPrice(),
                    maxHops: 2,
                    maxSplits: 3,
                    poolProvider,
                    quoteProvider: SmartRouter.quoteProvider,
                    quoterOptimization: true,
                    distributionPercent: 10,
                    signal,
                },
            );

            console.log('BEST TRADE', bestTrade)

            if (!bestTrade) {
                return undefined;
            }

            const { value, calldata } = account ? SwapRouter.swapCallParameters(bestTrade, {
                recipient: account,
                slippageTolerance: new PercentBN(
                    BigInt(allowedSlippage.numerator.toString()),
                    BigInt(allowedSlippage.denominator.toString()),
                ),
                deadlineOrPreviousBlockhash: Date.now() + txDeadline * 1000
            }) : { value: undefined, calldata: undefined };

            return {
                bestTrade,
                blockNumber,
                calldata,
                value,
            };
        },
        enabled: Boolean(amount && outputCurrency && deferQuotient && !loading && candidatePools && isEnabled),
        placeholderData: keepPreviousDataRef.current ? (prev: any) => prev : undefined,
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: REFRESH_TIMEOUT,
        refetchInterval: REFRESH_TIMEOUT,
    });

    useEffect(() => {
        if (!keepPreviousDataRef.current && trade) {
            keepPreviousDataRef.current = true;
        }
    }, [trade, keepPreviousDataRef]);

    const isValidating = fetchStatus === 'fetching';
    const isLoading = status === 'loading' || isPlaceholderData;

    const refresh = useCallback(async () => {
        await refreshPools();
        await queryClient.invalidateQueries({
            queryKey: ['getBestRoute'],
            refetchType: 'none',
        });
        refetch();
    }, [refreshPools, queryClient, refetch]);

    return {
        refresh,
        trade,
        isLoading: isLoading || loading,
        isStale: trade?.blockNumber !== blockNumber,
        error: error as Error | undefined,
        syncing: syncing || isValidating || (amount?.quotient?.toString() !== deferQuotient && deferQuotient !== undefined),
    };
}
