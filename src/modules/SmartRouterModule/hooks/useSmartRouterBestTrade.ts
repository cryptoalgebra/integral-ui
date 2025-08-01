import { useCallback, useDeferredValue, useEffect, useMemo, useRef } from "react";
import { Currency, CurrencyAmount, Percent, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { PoolType, SmartRouter, SwapRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useBlockNumber } from "wagmi";

import { useUserSlippageToleranceWithDefault, useUserState } from "@/state/userStore";

import useDebounce from "@/hooks/common/useDebounce";

import { useCommonPools } from "./useRoutingPools";
import usePreviousValue from "@/hooks/uitls/usePreviousValue.ts";
import { DEFAULT_CHAIN_ID } from "config/default-chain";
import { TradeState, TradeStateType } from "@/types/trade-state";
import { SmartRouterBestTrade } from "../types/best-trade";

const REFRESH_TIMEOUT = 15_000;

const MAX_HOPS = 2;
const MAX_SPLIT = 1;
const ALLOWED_VERSIONS = [PoolType.V2, PoolType.V3, PoolType.STABLE];

export function usePropsChanged(...args: any[]) {
    const prevArgs = usePreviousValue(args);
    return args.length !== prevArgs?.length || args.some((arg, i) => arg !== prevArgs[i]);
}

export function useSmartRouterBestTrade(
    amount: CurrencyAmount<Currency> | undefined,
    outputCurrency: Currency | undefined,
    isExactIn: boolean,
    isEnabled: boolean
): SmartRouterBestTrade {
    const queryClient = useQueryClient();

    const { txDeadline, isSplit, isMultihop } = useUserState();

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
    } = useCommonPools(amount?.currency as any, (outputCurrency as any) ?? undefined, {
        blockNumber: Number(blockNumber),
        allowInconsistentBlock: true,
        enabled: true,
    });

    const poolProvider = useMemo(() => SmartRouter.createStaticPoolProvider(candidatePools), [candidatePools]);

    const deferQuotientRaw = useDeferredValue(amount?.quotient?.toString());
    const deferQuotient = useDebounce(deferQuotientRaw, 500);

    const {
        data: trade,
        isLoading: isLoadingTrade,
        fetchStatus,
        isPlaceholderData,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            "getBestRoute",
            outputCurrency?.chainId,
            amount?.currency.symbol,
            outputCurrency?.symbol,
            isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
            deferQuotient,
            allowedSlippage,
            MAX_HOPS,
            MAX_SPLIT,
            ALLOWED_VERSIONS,
            isSplit,
            isMultihop,
        ],
        queryFn: async ({ signal }) => {
            if (!amount || !amount.currency || !outputCurrency || !deferQuotient) {
                return undefined;
            }

            const deferAmount = CurrencyAmount.fromRawAmount(amount.currency, deferQuotient);

            try {
                const bestTrade = await SmartRouter.getBestTrade(
                    deferAmount as any,
                    outputCurrency as any,
                    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
                    {
                        gasPriceWei: () => SmartRouter.publicClient[outputCurrency.chainId as typeof DEFAULT_CHAIN_ID].getGasPrice(),
                        maxHops: isMultihop ? 2 : 1,
                        maxSplits: isSplit ? 3 : 0,
                        poolProvider,
                        quoteProvider: SmartRouter.quoteProvider[outputCurrency.chainId as typeof DEFAULT_CHAIN_ID],
                        quoterOptimization: true,
                        distributionPercent: 10,
                        signal,
                    }
                );

                if (!bestTrade) {
                    throw new Error("No trade found");
                }

                console.log("BEST TRADE", bestTrade);

                const { value, calldata } = account
                    ? SwapRouter.swapCallParameters(bestTrade, {
                          recipient: account,
                          slippageTolerance: new Percent(allowedSlippage.numerator.toString(), allowedSlippage.denominator.toString()),
                          deadlineOrPreviousBlockhash: Date.now() + txDeadline * 1000,
                      })
                    : { value: undefined, calldata: undefined };

                return {
                    bestTrade,
                    blockNumber,
                    calldata,
                    value,
                };
            } catch (error) {
                console.log(error);
                return {
                    bestTrade: undefined,
                    blockNumber: undefined,
                    calldata: undefined,
                    value: undefined,
                };
            }
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

    const isValidating = fetchStatus === "fetching";
    const isLoading = isLoadingTrade || isPlaceholderData || loading;

    const refresh = useCallback(async () => {
        await refreshPools();
        await queryClient.invalidateQueries({
            queryKey: ["getBestRoute"],
            refetchType: "none",
        });
        refetch();
    }, [refreshPools, queryClient, refetch]);

    const state: TradeStateType = useMemo(() => {
        const isSyncing = syncing || isValidating || (amount?.quotient?.toString() !== deferQuotient && deferQuotient !== undefined);
        const isError = error !== undefined;

        if (isLoading) {
            return TradeState.LOADING;
        } else if (isSyncing) {
            return TradeState.SYNCING;
        } else if (trade?.bestTrade) {
            return TradeState.VALID;
        } else if (isError) {
            return TradeState.INVALID;
        } else {
            return TradeState.NO_ROUTE_FOUND;
        }
    }, [amount?.quotient, deferQuotient, error, isLoading, isValidating, syncing, trade?.bestTrade]);

    return {
        refresh,
        trade,
        state,
    };
}
