import {
    ADDRESS_ZERO,
    AnyToken,
    Currency,
    CurrencyAmount,
    Pool,
    Position,
    Price,
    priceToClosestTick,
    tryParseTick,
} from "@cryptoalgebra/custom-pools-sdk";
import { ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { Bound, Field, Rounding } from "@cryptoalgebra/custom-pools-sdk";
import { tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { tickToPrice, nearestUsableTick, encodeSqrtRatioX96, TickMath } from "@cryptoalgebra/custom-pools-sdk";
import { getTickToPrice } from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useMemo } from "react";
import { useAccount, useBalance } from "wagmi";
import { create } from "zustand";
import { PoolState, PoolStateType, usePool } from "@/hooks/pools/usePool";
import { PresetsType } from "@/types/presets";
import { Address } from "viem";
import { useDebouncedValue } from "@/hooks/common/useDebouncedValue";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
import { enabledModules } from "config";
const { useBoostedConversion } = BoostedPoolsModule.hooks;

export type FullRange = true;

export enum Presets {
    SAFE,
    RISK,
    NORMAL,
    FULL,
    STABLE,
}

interface MintState {
    readonly independentField: Field;
    readonly typedValue: string;
    readonly startPriceTypedValue: string; // for the case when there's no liquidity
    readonly leftRangeTypedValue: string | FullRange;
    readonly rightRangeTypedValue: string | FullRange;
    readonly dynamicFee: number;
    readonly preset: PresetsType | null;
    readonly txHash: string;
    readonly showNewestPosition: boolean;
    readonly initialUSDPrices: {
        [Field.CURRENCY_A]: string;
        [Field.CURRENCY_B]: string;
    };
    readonly initialTokenPrice: string;
    readonly currentStep: number;
    readonly token0InputMode: "underlying" | "boosted";
    readonly token1InputMode: "underlying" | "boosted";
    readonly actions: {
        updateDynamicFee: (dynamicFee: number) => void;
        resetMintState: () => void;
        setFullRange: () => void;
        typeStartPriceInput: (typedValue: string) => void;
        typeLeftRangeInput: (typedValue: string) => void;
        typeRightRangeInput: (typedValue: string) => void;
        typeInput: (field: Field, typedValue: string, noLiquidity: boolean) => void;
        updateSelectedPreset: (preset: PresetsType | null) => void;
        setAddLiquidityTxHash: (txHash: string) => void;
        setInitialTokenPrice: (typedValue: string) => void;
        updateCurrentStep: (currentStep: number) => void;
        setToken0InputMode: (mode: "underlying" | "boosted") => void;
        setToken1InputMode: (mode: "underlying" | "boosted") => void;
    };
}

export interface IDerivedMintInfo {
    pool?: Pool | null;
    poolState: PoolStateType;
    ticks: { [bound in Bound]?: number | undefined };
    price?: Price<AnyToken, AnyToken>;
    pricesAtTicks: {
        [bound in Bound]?: Price<AnyToken, AnyToken> | undefined;
    };
    currencies: { [field in Field]?: Currency };
    currencyBalances: { [field in Field]?: CurrencyAmount<Currency> };
    underlyingBalances: { [field in Field]?: CurrencyAmount<Currency> };
    dependentField: Field;
    parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> };
    poolAmounts: { [field in Field]?: CurrencyAmount<Currency> };
    position: Position | undefined;
    noLiquidity?: boolean;
    errorMessage?: string;
    errorCode?: number;
    invalidPool: boolean;
    outOfRange: boolean;
    invalidRange: boolean;
    depositADisabled: boolean;
    depositBDisabled: boolean;
    invertPrice: boolean;
    ticksAtLimit: { [bound in Bound]?: boolean | undefined };
    dynamicFee: number;
    lowerPrice: any;
    upperPrice: any;
    tickSpacing: number;
}

const initialState = {
    independentField: Field.CURRENCY_A,
    typedValue: "",
    startPriceTypedValue: "",
    leftRangeTypedValue: "",
    rightRangeTypedValue: "",
    dynamicFee: 0,
    preset: null,
    txHash: "",
    showNewestPosition: false,
    initialUSDPrices: { [Field.CURRENCY_A]: "", [Field.CURRENCY_B]: "" },
    initialTokenPrice: "",
    currentStep: 0,
    token0InputMode: enabledModules.BoostedPoolsModule ? ("underlying" as const) : ("boosted" as const),
    token1InputMode: enabledModules.BoostedPoolsModule ? ("underlying" as const) : ("boosted" as const),
};

export const useMintState = create<MintState>((set, get) => ({
    ...initialState,
    actions: {
        updateDynamicFee: (dynamicFee: number) => set({ dynamicFee }),
        resetMintState: () => set(initialState),
        setFullRange: () => set({ leftRangeTypedValue: true, rightRangeTypedValue: true }),
        typeStartPriceInput: (typedValue: string) => set({ startPriceTypedValue: typedValue }),
        typeLeftRangeInput: (typedValue: string) => set({ leftRangeTypedValue: typedValue }),
        typeRightRangeInput: (typedValue: string) => set({ rightRangeTypedValue: typedValue }),
        typeInput: (field: Field, typedValue: string, noLiquidity: boolean) => {
            if (noLiquidity) {
                if (field === get().independentField) {
                    set({ independentField: field, typedValue });
                } else {
                    set({ independentField: field, typedValue });
                }
            } else {
                set({ independentField: field, typedValue });
            }
        },
        updateSelectedPreset: (preset: PresetsType | null) => set({ preset }),
        setAddLiquidityTxHash: (txHash: string) => set({ txHash }),
        setInitialTokenPrice: (typedValue: string) => set({ initialTokenPrice: typedValue }),
        updateCurrentStep: (currentStep: number) => set({ currentStep }),
        setToken0InputMode: (mode: "underlying" | "boosted") => set({ token0InputMode: mode }),
        setToken1InputMode: (mode: "underlying" | "boosted") => set({ token1InputMode: mode }),
    },
}));

export function useMintActionHandlers(
    noLiquidity: boolean | undefined
): {
    onFieldAInput: (typedValue: string) => void;
    onFieldBInput: (typedValue: string) => void;
    onLeftRangeInput: (typedValue: string) => void;
    onRightRangeInput: (typedValue: string) => void;
    onStartPriceInput: (typedValue: string) => void;
} {
    const {
        actions: { typeInput, typeLeftRangeInput, typeRightRangeInput, typeStartPriceInput },
    } = useMintState();

    const onFieldAInput = useCallback((typedValue: string) => typeInput(Field.CURRENCY_A, typedValue, noLiquidity === true), [noLiquidity]);

    const onFieldBInput = useCallback((typedValue: string) => typeInput(Field.CURRENCY_B, typedValue, noLiquidity === true), [noLiquidity]);

    const onLeftRangeInput = useCallback((typedValue: string) => typeLeftRangeInput(typedValue), []);

    const onRightRangeInput = useCallback((typedValue: string) => typeRightRangeInput(typedValue), []);

    const onStartPriceInput = useCallback((typedValue: string) => typeStartPriceInput(typedValue), []);

    return {
        onFieldAInput,
        onFieldBInput,
        onLeftRangeInput,
        onRightRangeInput,
        onStartPriceInput,
    };
}

export function useDerivedMintInfo(
    currencyA?: Currency,
    currencyB?: Currency,
    poolAddress?: Address,
    feeAmount?: number,
    baseCurrency?: Currency,
    existingPosition?: Position
): IDerivedMintInfo {
    const { address: account } = useAccount();

    const {
        independentField,
        typedValue,
        leftRangeTypedValue,
        rightRangeTypedValue,
        startPriceTypedValue,
        token0InputMode,
        token1InputMode,
    } = useMintState();

    const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

    // currencies
    const currencies: { [field in Field]?: Currency } = useMemo(
        () => ({
            [Field.CURRENCY_A]: currencyA,
            [Field.CURRENCY_B]: currencyB,
        }),
        [currencyA, currencyB]
    );

    // formatted with tokens
    const [tokenA, tokenB, baseToken] = useMemo(() => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped], [
        currencyA,
        currencyB,
        baseCurrency,
    ]);

    const [token0, token1] = useMemo(
        () =>
            tokenA && tokenB && !tokenA.equals(tokenB)
                ? tokenA.sortsBefore(tokenB)
                    ? [tokenA, tokenB]
                    : [tokenB, tokenA]
                : [undefined, undefined],
        [tokenA, tokenB]
    );

    const [addressA, addressB] = [
        currencyA?.isNative ? undefined : currencyA?.address || "",
        currencyB?.isNative ? undefined : currencyB?.address || "",
    ] as Address[];

    const { data: tokenABalance } = useBalance({
        address: account,
        token: addressA,
    });
    const { data: tokenBBalance } = useBalance({
        address: account,
        token: addressB,
    });

    // Get underlying token addresses for boosted tokens
    const [underlyingTokenA, underlyingTokenB] = useMemo(() => {
        if (!currencyA || !currencyB) return [];
        const underlyingA = currencyA?.isBoosted ? unwrappedToken(currencyA.wrapped.underlying) : undefined;
        const underlyingB = currencyB?.isBoosted ? unwrappedToken(currencyB.wrapped.underlying) : undefined;
        return [underlyingA, underlyingB];
    }, [currencyA, currencyB]);

    // Get underlying token balances
    const { data: underlyingTokenABalance } = useBalance({
        address: account,
        token: underlyingTokenA?.isNative ? undefined : (underlyingTokenA?.address as Address),
    });
    const { data: underlyingTokenBBalance } = useBalance({
        address: account,
        token: underlyingTokenB?.isNative ? undefined : (underlyingTokenB?.address as Address),
    });

    // Pool token balances (boosted or regular)
    const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
        [Field.CURRENCY_A]:
            currencyA && tokenABalance ? CurrencyAmount.fromRawAmount(currencyA, tokenABalance.value.toString()) : undefined,
        [Field.CURRENCY_B]:
            currencyB && tokenBBalance ? CurrencyAmount.fromRawAmount(currencyB, tokenBBalance.value.toString()) : undefined,
    };

    // Underlying token balances (for display when inputMode is "underlying")
    const underlyingBalances: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(() => {
        return {
            [Field.CURRENCY_A]:
                currencyA?.isBoosted && underlyingTokenABalance
                    ? CurrencyAmount.fromRawAmount(currencyA.underlying, underlyingTokenABalance.value.toString())
                    : undefined,
            [Field.CURRENCY_B]:
                currencyB?.isBoosted && underlyingTokenBBalance
                    ? CurrencyAmount.fromRawAmount(currencyB.underlying, underlyingTokenBBalance.value.toString())
                    : undefined,
        };
    }, [currencyA, currencyB, underlyingTokenABalance, underlyingTokenBBalance]);

    const [poolState, pool] = usePool(poolAddress as Address);

    const noLiquidity = poolState === PoolState.NOT_EXISTS;

    const dynamicFee = pool ? pool.fee : 100;

    const tickSpacing = pool ? pool.tickSpacing : 60;

    // note to parse inputs in reverse
    const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0));

    // always returns the price with 0 as base token
    const price: Price<AnyToken, AnyToken> | undefined = useMemo(() => {
        // if no liquidity use typed value
        if (noLiquidity) {
            const parsedQuoteAmount = tryParseAmount(startPriceTypedValue, invertPrice ? token0 : token1);
            if (parsedQuoteAmount && token0 && token1) {
                const baseAmount = tryParseAmount("1", invertPrice ? token1 : token0);
                const price =
                    baseAmount && parsedQuoteAmount
                        ? new Price(baseAmount.currency, parsedQuoteAmount.currency, baseAmount.quotient, parsedQuoteAmount.quotient)
                        : undefined;
                return (invertPrice ? price?.invert() : price) ?? undefined;
            }
            return undefined;
        } else {
            // get the amount of quote currency
            return pool && token0 ? pool.priceOf(token0) : undefined;
        }
    }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool]);

    // check for invalid price input (converts to invalid ratio)
    const invalidPrice = useMemo(() => {
        const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined;
        const invalid =
            price &&
            sqrtRatioX96 &&
            !(
                BigInt(sqrtRatioX96.toString()) >= BigInt(TickMath.MIN_SQRT_RATIO.toString()) &&
                BigInt(sqrtRatioX96.toString()) < BigInt(TickMath.MAX_SQRT_RATIO.toString())
            );
        return invalid;
    }, [price]);

    // used for ratio calculation when pool not initialized
    const mockPool = useMemo(() => {
        if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
            const currentTick = priceToClosestTick(price);
            const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
            return new Pool(tokenA, tokenB, feeAmount, currentSqrt, ADDRESS_ZERO, 0, currentTick, 60, []);
        } else {
            return undefined;
        }
    }, [feeAmount, invalidPrice, price, tokenA, tokenB]);

    // if pool exists use it, if not use the mock pool
    const poolForPosition: Pool | undefined = pool ?? mockPool;

    // lower and upper limits in the tick space
    const tickSpaceLimits: {
        [bound in Bound]: number | undefined;
    } = useMemo(
        () => ({
            [Bound.LOWER]: tickSpacing ? nearestUsableTick(TickMath.MIN_TICK, tickSpacing) : undefined,
            [Bound.UPPER]: tickSpacing ? nearestUsableTick(TickMath.MAX_TICK, tickSpacing) : undefined,
        }),
        [tickSpacing]
    );

    // parse typed range values and determine closest ticks
    // lower should always be a smaller tick
    const ticks: {
        [key: string]: number | undefined;
    } = useMemo(() => {
        return {
            [Bound.LOWER]:
                typeof existingPosition?.tickLower === "number"
                    ? existingPosition.tickLower
                    : (invertPrice && typeof rightRangeTypedValue === "boolean") ||
                      (!invertPrice && typeof leftRangeTypedValue === "boolean")
                    ? tickSpaceLimits[Bound.LOWER]
                    : invertPrice
                    ? tryParseTick(token1, token0, rightRangeTypedValue.toString(), tickSpacing)
                    : tryParseTick(token0, token1, leftRangeTypedValue.toString(), tickSpacing),
            [Bound.UPPER]:
                typeof existingPosition?.tickUpper === "number"
                    ? existingPosition.tickUpper
                    : (!invertPrice && typeof rightRangeTypedValue === "boolean") ||
                      (invertPrice && typeof leftRangeTypedValue === "boolean")
                    ? tickSpaceLimits[Bound.UPPER]
                    : invertPrice
                    ? tryParseTick(token1, token0, leftRangeTypedValue.toString(), tickSpacing)
                    : tryParseTick(token0, token1, rightRangeTypedValue.toString(), tickSpacing),
        };
    }, [existingPosition, feeAmount, invertPrice, leftRangeTypedValue, rightRangeTypedValue, token0, token1, tickSpaceLimits, tickSpacing]);

    const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};

    // specifies whether the lower and upper ticks is at the exteme bounds
    const ticksAtLimit = useMemo(
        () => ({
            [Bound.LOWER]: Boolean(feeAmount) && tickLower === tickSpaceLimits.LOWER,
            [Bound.UPPER]: Boolean(feeAmount) && tickUpper === tickSpaceLimits.UPPER,
        }),
        [tickSpaceLimits, tickLower, tickUpper, feeAmount]
    );

    // mark invalid range
    const invalidRange = Boolean(typeof tickLower === "number" && typeof tickUpper === "number" && tickLower >= tickUpper);

    // always returns the price with 0 as base token
    const pricesAtTicks = useMemo(() => {
        return {
            [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
            [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
        };
    }, [token0, token1, ticks]);
    const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks;

    // liquidity range warning
    const outOfRange = Boolean(
        !invalidRange && price && lowerPrice && upperPrice && (price.lessThan(lowerPrice) || price.greaterThan(upperPrice))
    );

    const independentInputMode = independentField === Field.CURRENCY_A ? token0InputMode : token1InputMode;

    const independentCurrency = currencies[independentField];

    const independentDisplayCurrency = useMemo(() => {
        if (!independentCurrency) return undefined;
        if (!independentCurrency.isBoosted) return independentCurrency;
        return independentInputMode === "underlying" ? unwrappedToken(independentCurrency.underlying) : independentCurrency;
    }, [independentCurrency, independentInputMode]);

    const debouncedTypedValue = useDebouncedValue(typedValue, 300);

    const userIndependentAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(typedValue, independentDisplayCurrency);

    const debouncedIndependentAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
        debouncedTypedValue,
        independentDisplayCurrency
    );

    const needsConversion = enabledModules.BoostedPoolsModule && independentCurrency?.isBoosted && independentInputMode === "underlying";

    const { outputAmount: convertedAmount } = useBoostedConversion(
        needsConversion ? debouncedIndependentAmount : undefined,
        independentCurrency,
        "underlying-to-boosted"
    );

    const independentAmount = needsConversion ? convertedAmount : debouncedIndependentAmount;

    const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
        // we wrap the currencies just to get the price in terms of the other token
        const wrappedIndependentAmount = independentAmount?.wrapped;
        const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;
        if (
            independentAmount &&
            wrappedIndependentAmount &&
            typeof tickLower === "number" &&
            typeof tickUpper === "number" &&
            poolForPosition
        ) {
            // if price is out of range or invalid range - return 0 (single deposit will be independent)
            if (outOfRange || invalidRange) {
                return undefined;
            }

            const position: Position | undefined = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
                ? Position.fromAmount0({
                      pool: poolForPosition,
                      tickLower,
                      tickUpper,
                      amount0: independentAmount.quotient,
                      useFullPrecision: true, // we want full precision for the theoretical position
                  })
                : Position.fromAmount1({
                      pool: poolForPosition,
                      tickLower,
                      tickUpper,
                      amount1: independentAmount.quotient,
                  });

            const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
                ? position.amount1
                : position.amount0;

            return dependentCurrency && CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient);
        }

        return undefined;
    }, [independentAmount, outOfRange, dependentField, currencyB, currencyA, tickLower, tickUpper, poolForPosition, invalidRange]);

    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA;
    const dependentInputMode = dependentField === Field.CURRENCY_A ? token0InputMode : token1InputMode;
    const needsDependentConversion =
        enabledModules.BoostedPoolsModule && dependentCurrency?.isBoosted && dependentInputMode === "underlying";

    const { outputAmount: convertedDependentAmount } = useBoostedConversion(
        needsDependentConversion ? dependentAmount : undefined,
        dependentCurrency,
        "boosted-to-underlying"
    );

    const displayDependentAmount = needsDependentConversion ? convertedDependentAmount : dependentAmount;

    const parsedAmounts: {
        [field in Field]: CurrencyAmount<Currency> | undefined;
    } = useMemo(() => {
        return {
            [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? userIndependentAmount : displayDependentAmount,
            [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? displayDependentAmount : userIndependentAmount,
        };
    }, [displayDependentAmount, userIndependentAmount, independentField]);

    const poolAmounts: {
        [field in Field]: CurrencyAmount<Currency> | undefined;
    } = useMemo(() => {
        return {
            [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
            [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
        };
    }, [dependentAmount, independentAmount, independentField]);

    // single deposit only if price is out of range
    const deposit0Disabled = Boolean(typeof tickUpper === "number" && poolForPosition && poolForPosition.tickCurrent >= tickUpper);
    const deposit1Disabled = Boolean(typeof tickLower === "number" && poolForPosition && poolForPosition.tickCurrent <= tickLower);

    // sorted for token order
    const depositADisabled =
        invalidRange ||
        Boolean(
            (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
                (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA))
        );
    const depositBDisabled =
        invalidRange ||
        Boolean(
            (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
                (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB))
        );

    // create position entity based on users selection
    const position: Position | undefined = useMemo(() => {
        if (!poolForPosition || !tokenA || !tokenB || typeof tickLower !== "number" || typeof tickUpper !== "number" || invalidRange) {
            return undefined;
        }

        // mark as 0 if disabled because out of range
        const amount0 = !deposit0Disabled
            ? poolAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]?.quotient
            : ZERO;
        const amount1 = !deposit1Disabled
            ? poolAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]?.quotient
            : ZERO;

        if (amount0 !== undefined && amount1 !== undefined) {
            return Position.fromAmounts({
                pool: poolForPosition,
                tickLower,
                tickUpper,
                amount0,
                amount1,
                useFullPrecision: true, // we want full precision for the theoretical position
            });
        } else {
            return undefined;
        }
    }, [poolAmounts, poolForPosition, tokenA, tokenB, deposit0Disabled, deposit1Disabled, invalidRange, tickLower, tickUpper]);

    let errorMessage: string | undefined;
    let errorCode: number | undefined;

    if (!account) {
        errorMessage = `Connect Wallet`;
        errorCode = errorCode ?? 0;
    }

    if (poolState === PoolState.INVALID) {
        errorMessage = errorMessage ?? `Invalid pair`;
        errorCode = errorCode ?? 1;
    }

    if (invalidPrice) {
        errorMessage = errorMessage ?? `Invalid price input`;
        errorCode = errorCode ?? 2;
    }

    if ((!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) || (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)) {
        errorMessage = errorMessage ?? `Enter an amount`;
        errorCode = errorCode ?? 3;
    }

    const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts;

    // Check balance for Currency A - use underlying balance if inputMode is "underlying"
    if (currencyAAmount && !depositADisabled) {
        const currencyA = currencyAAmount.currency;
        const currencyB = currencyBAmount?.currency;
        const isUnderlyingInput = token0InputMode === "underlying";
        const balanceToCheck = isUnderlyingInput ? underlyingBalances[Field.CURRENCY_A] : currencyBalances[Field.CURRENCY_A];

        const referredAmount =
            currencyA && currencyB && currencyBAmount && currencyA.wrapped.equals(currencyB.wrapped)
                ? currencyBAmount.add(currencyAAmount)
                : currencyAAmount;

        if (balanceToCheck && balanceToCheck.lessThan(referredAmount)) {
            const displaySymbol = isUnderlyingInput && currencyA.isBoosted ? underlyingTokenA?.symbol : currencyA?.symbol;
            errorMessage = `Insufficient ${displaySymbol} balance`;
            errorCode = errorCode ?? 4;
        }
    }

    // Check balance for Currency B - use underlying balance if inputMode is "underlying"
    if (currencyBAmount && !depositBDisabled) {
        const currencyA = currencyAAmount?.currency;
        const currencyB = currencyBAmount.currency;
        const isUnderlyingInput = token1InputMode === "underlying";
        const balanceToCheck = isUnderlyingInput ? underlyingBalances[Field.CURRENCY_B] : currencyBalances[Field.CURRENCY_B];

        const referredAmount =
            currencyA && currencyB && currencyAAmount && currencyA.wrapped.equals(currencyB.wrapped)
                ? currencyAAmount.add(currencyBAmount)
                : currencyBAmount;

        if (referredAmount && balanceToCheck && balanceToCheck.lessThan(referredAmount)) {
            const displaySymbol = isUnderlyingInput && currencyB.isBoosted ? underlyingTokenB?.symbol : currencyB?.symbol;
            errorMessage = `Insufficient ${displaySymbol} balance`;
            errorCode = errorCode ?? 5;
        }
    }

    const invalidPool = poolState === PoolState.INVALID;

    return {
        dependentField,
        currencies,
        pool: poolForPosition,
        poolState,
        currencyBalances,
        underlyingBalances,
        parsedAmounts,
        poolAmounts,
        ticks,
        price,
        pricesAtTicks,
        position,
        noLiquidity,
        errorMessage,
        errorCode,
        invalidPool,
        invalidRange,
        outOfRange,
        depositADisabled,
        depositBDisabled,
        invertPrice,
        ticksAtLimit,
        dynamicFee,
        lowerPrice,
        upperPrice,
        tickSpacing,
    };
}

export function useRangeHopCallbacks(
    baseCurrency: Currency | undefined,
    quoteCurrency: Currency | undefined,
    tickSpacing: number,
    tickLower: number | undefined,
    tickUpper: number | undefined,
    pool?: Pool | undefined | null
) {
    const {
        actions: { setFullRange },
    } = useMintState();

    const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency]);
    const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency]);

    const getDecrementLower = useCallback(
        (rate = 1) => {
            if (baseToken && quoteToken && typeof tickLower === "number" && tickSpacing) {
                const newPrice = tickToPrice(baseToken, quoteToken, tickLower - tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            // use pool current tick as starting tick if we have pool but no tick input

            if (!(typeof tickLower === "number") && baseToken && quoteToken && tickSpacing && pool) {
                const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            return "";
        },
        [baseToken, quoteToken, tickLower, tickSpacing, pool]
    );

    const getIncrementLower = useCallback(
        (rate = 1) => {
            if (baseToken && quoteToken && typeof tickLower === "number" && tickSpacing) {
                const newPrice = tickToPrice(baseToken, quoteToken, tickLower + tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            // use pool current tick as starting tick if we have pool but no tick input
            if (!(typeof tickLower === "number") && baseToken && quoteToken && tickSpacing && pool) {
                const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            return "";
        },
        [baseToken, quoteToken, tickLower, tickSpacing, pool]
    );

    const getDecrementUpper = useCallback(
        (rate = 1) => {
            if (baseToken && quoteToken && typeof tickUpper === "number" && tickSpacing) {
                const newPrice = tickToPrice(baseToken, quoteToken, tickUpper - tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            // use pool current tick as starting tick if we have pool but no tick input
            if (!(typeof tickUpper === "number") && baseToken && quoteToken && tickSpacing && pool) {
                const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            return "";
        },
        [baseToken, quoteToken, tickUpper, tickSpacing, pool]
    );

    const getIncrementUpper = useCallback(
        (rate = 1) => {
            if (baseToken && quoteToken && typeof tickUpper === "number" && tickSpacing) {
                const newPrice = tickToPrice(baseToken, quoteToken, tickUpper + tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            // use pool current tick as starting tick if we have pool but no tick input
            if (!(typeof tickUpper === "number") && baseToken && quoteToken && tickSpacing && pool) {
                const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + tickSpacing * rate);
                return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP);
            }
            return "";
        },
        [baseToken, quoteToken, tickUpper, tickSpacing, pool]
    );

    const getSetRange = useCallback(
        (numTicks: number) => {
            if (baseToken && quoteToken && tickSpacing && pool) {
                // calculate range around current price given `numTicks`
                const newPriceLower = tickToPrice(baseToken, quoteToken, Math.max(TickMath.MIN_TICK, pool.tickCurrent - numTicks));
                const newPriceUpper = tickToPrice(baseToken, quoteToken, Math.min(TickMath.MAX_TICK, pool.tickCurrent + numTicks));

                return [
                    newPriceLower.toSignificant(5, undefined, Rounding.ROUND_UP),
                    newPriceUpper.toSignificant(5, undefined, Rounding.ROUND_UP),
                ];
            }
            return ["", ""];
        },
        [baseToken, quoteToken, tickSpacing, pool]
    );

    const getSetFullRange = useCallback(() => setFullRange(), []);

    return {
        getDecrementLower,
        getIncrementLower,
        getDecrementUpper,
        getIncrementUpper,
        getSetRange,
        getSetFullRange,
    };
}
