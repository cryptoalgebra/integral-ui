import { CurrencyAmount, Position } from "@cryptoalgebra/integral-sdk";
import { useMemo, useCallback } from "react";
import { usePositionFees } from "./usePositionFees";
import { useUSDCPrice } from "../common/useUSDCValue";
import { useClients } from "../graphql/useClients";
import { parseUnits } from "viem";
import {
    calculateIL,
    calculateInitialAmountsFromMint,
    calculatePnl,
    calculatePositionAge,
    calculateRealizedAPR,
    calculateROI,
    calculateTokenValues,
} from "@/utils/positions/positionAnalytics";
import { usePositionAnalyticsQuery } from "@/graphql/generated/graphql";

export interface TokenValue {
    usdValue: number;
    value0: number;
    value1: number;
}

export interface PositionAnalytics {
    initialAmount: TokenValue;
    currentAmount: TokenValue;
    collectedFees: TokenValue;
    withdrawnAmount: TokenValue;
    pendingFees: TokenValue;
    pnl: TokenValue;
    roi: TokenValue;
    apr: TokenValue;
    il: TokenValue;
    positionAge: number; // in days
}

const EMPTY_TOKEN_VALUE: TokenValue = { usdValue: 0, value0: 0, value1: 0 };

const EMPTY_DATA: PositionAnalytics = {
    initialAmount: EMPTY_TOKEN_VALUE,
    currentAmount: EMPTY_TOKEN_VALUE,
    collectedFees: EMPTY_TOKEN_VALUE,
    withdrawnAmount: EMPTY_TOKEN_VALUE,
    pendingFees: EMPTY_TOKEN_VALUE,
    pnl: EMPTY_TOKEN_VALUE,
    roi: EMPTY_TOKEN_VALUE,
    apr: EMPTY_TOKEN_VALUE,
    il: EMPTY_TOKEN_VALUE,
    positionAge: 0,
};

export function usePositionAnalytics(
    tokenId: string | number | undefined,
    position: Position | undefined,
): { data: PositionAnalytics | undefined; isLoading: boolean; refetch: () => void } {
    const { infoClient } = useClients();
    const normalizedTokenId = tokenId?.toString();

    const token0 = position?.pool.token0;
    const token1 = position?.pool.token1;

    const { formatted: token0PriceUsd } = useUSDCPrice(token0);
    const { formatted: token1PriceUsd } = useUSDCPrice(token1);

    const { amount0: pendingFees0, amount1: pendingFees1, refetch: refetchPendingFees } = usePositionFees(
        position?.pool,
        normalizedTokenId ? Number(normalizedTokenId) : undefined,
    );

    const { data: graphData, loading, refetch: refetchGraph } = usePositionAnalyticsQuery({
        variables: normalizedTokenId ? { tokenId: normalizedTokenId } : undefined,
        skip: !normalizedTokenId,
        client: infoClient,
        pollInterval: 30000,
    });

    const refetch = useCallback(() => {
        refetchPendingFees?.();
        refetchGraph();
    }, [refetchGraph, refetchPendingFees]);

    const result = useMemo(() => {
        // Loading state
        if (loading && !graphData) {
            return { data: undefined, isLoading: true };
        }

        // Missing required data
        if (!normalizedTokenId || !position || !token0 || !token1) {
            return { data: EMPTY_DATA, isLoading: false };
        }

        const graphPosition = graphData?.position;
        if (!graphPosition) {
            return { data: EMPTY_DATA, isLoading: false };
        }

        // Still loading pending fees
        if (!pendingFees0 || !pendingFees1) {
            return { data: undefined, isLoading: true };
        }

        const mintTx = graphPosition.transaction.mints[0];
        if (!mintTx) {
            return { data: EMPTY_DATA, isLoading: false };
        }

        const price0In1 = position.pool.token0Price;
        const price1In0 = position.pool.token1Price;

        const initialAmount = calculateInitialAmountsFromMint(token0, token1, mintTx);

        const currentAmount = calculateTokenValues(
            position.amount0.quotient.toString(),
            position.amount1.quotient.toString(),
            price0In1,
            price1In0,
            token0PriceUsd,
            token1PriceUsd,
        );

        const withdrawnAmount = calculateTokenValues(
            parseUnits(graphPosition.withdrawnToken0, token0.decimals).toString(),
            parseUnits(graphPosition.withdrawnToken1, token1.decimals).toString(),
            price0In1,
            price1In0,
            token0PriceUsd,
            token1PriceUsd,
        );

        const pendingFees = calculateTokenValues(
            pendingFees0.quotient.toString(),
            pendingFees1.quotient.toString(),
            price0In1,
            price1In0,
            token0PriceUsd,
            token1PriceUsd,
        );

        const collectedFees = calculateTokenValues(
            parseUnits(graphPosition.collectedFeesToken0, token0.decimals).toString(),
            parseUnits(graphPosition.collectedFeesToken1, token1.decimals).toString(),
            price0In1,
            price1In0,
            token0PriceUsd,
            token1PriceUsd,
        );

        // Calculate PnL
        const pnl = calculatePnl(currentAmount, collectedFees, withdrawnAmount, pendingFees, initialAmount);

        // Calculate ROI
        const roi = calculateROI(pnl, initialAmount);

        // Calculate position age and Realized APR (based on fees earned)
        const positionAge = calculatePositionAge(mintTx.timestamp);
        const apr = calculateRealizedAPR(collectedFees, pendingFees, initialAmount, positionAge);

        // Calculate IL
        const il = calculateIL(
            CurrencyAmount.fromRawAmount(position.pool.token0, parseUnits(graphPosition.depositedToken0, token0.decimals).toString()),
            CurrencyAmount.fromRawAmount(position.pool.token1, parseUnits(graphPosition.depositedToken1, token1.decimals).toString()),
            position.amount0,
            position.amount1,
            CurrencyAmount.fromRawAmount(position.pool.token0, parseUnits(graphPosition.withdrawnToken0, token0.decimals).toString()),
            CurrencyAmount.fromRawAmount(position.pool.token1, parseUnits(graphPosition.withdrawnToken1, token1.decimals).toString()),
            price0In1,
            token0PriceUsd,
            token1PriceUsd,
        );

        const analyticsResult = {
            initialAmount,
            currentAmount,
            withdrawnAmount,
            pendingFees,
            collectedFees,
            pnl,
            roi,
            apr,
            il,
            positionAge,
        };

        return {
            isLoading: false,
            data: analyticsResult,
        };
    }, [graphData, loading, position, token0, token1, token0PriceUsd, token1PriceUsd, normalizedTokenId, pendingFees0, pendingFees1]);

    return { ...result, refetch };
}
