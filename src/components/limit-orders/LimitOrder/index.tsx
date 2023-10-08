import { ALGEBRA_LIMIT_ORDER_PLUGIN } from "@/constants/addresses";
import { useApprove } from "@/hooks/common/useApprove";
import { PoolState, usePool } from "@/hooks/pools/usePool";
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { ApprovalState } from "@/types/approve-state";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import { TradeState } from "@/types/trade-state";
import { computePoolAddress, getTickToPrice, tickToPrice, tryParseTick } from "@cryptoalgebra/integral-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, parseUnits } from "viem";

const LimitOrder = () => {

    const { toggledTrade: trade, tick, tradeState, parsedAmount, currencies, inputError, tickSpacing } = useDerivedSwapInfo();

    // const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly();
    const singleHopOnly = false

    const [initialSingleHop, setInitialSingleHop] = useState(singleHopOnly);

    // const {
    //     placeLimitOrder: { placeLimitOrderFn, placeLimitOrderHash, placeLimitOrderLoading },
    // } = useLimitOrderHandlers();

    // const allTransactions = useAllTransactions();
    // const sortedRecentTransactions = useSortedRecentTransactions();
    // const confirmed = useMemo(() => sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash), [sortedRecentTransactions, allTransactions]);

    // const [placing, setPlacing] = useState<any>({ state: null });

    // useEffect(() => {
    //     if (!placing.state) return;

    //     if (typeof placeLimitOrderHash === "string") {
    //         setPlacing({ id: null, state: null });
    //     } else if (placeLimitOrderHash && confirmed.includes(String(placeLimitOrderHash.hash))) {
    //         setPlacing({ id: placeLimitOrderHash.hash, state: "done" });
    //     }
    // }, [confirmed, placeLimitOrderHash]);

    // const isPlacingLoading = useMemo(() => {
    //     return placeLimitOrderLoading && placing && placing.state !== "done";
    // }, [placeLimitOrderLoading, placing]);

    const { independentField, typedValue, actions:  { typeLimitOrderPrice, limitOrderPriceLastFocused } } = useSwapState();
    const dependentField: SwapFieldType = independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

    // const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);

    // const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
    const showWrap = false

    const tokenA = currencies[SwapField.INPUT]?.wrapped;
    const tokenB = currencies[SwapField.OUTPUT]?.wrapped;

    const pairPrice = getTickToPrice(tokenA, tokenB, tick);

    const parsedAmounts = useMemo(
        () =>
            showWrap
                ? {
                      [SwapField.INPUT]: parsedAmount,
                      [SwapField.OUTPUT]: parsedAmount,
                  }
                : {
                      [SwapField.INPUT]: independentField === SwapField.INPUT ? parsedAmount : pairPrice ? parsedAmount?.divide(pairPrice.asFraction) : undefined,
                      [SwapField.OUTPUT]: independentField === SwapField.OUTPUT ? parsedAmount : pairPrice ? parsedAmount?.multiply(pairPrice.asFraction) : undefined,
                  },
        [independentField, parsedAmount, showWrap, pairPrice]
    );

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap && independentField !== SwapField.LIMIT_ORDER_PRICE ? parsedAmounts[independentField]?.toExact() ?? "" : parsedAmounts[dependentField]?.toSignificant(18) ?? "",
    };

    const [token0, token1] = tokenA && tokenB && !showWrap ? (tokenA?.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined];

    const previousTokens = usePrevious(token0 && token1 ? token0.address + token1.address : "");

    const invertPrice = Boolean(currencies[SwapField.INPUT] && token0 && !currencies[SwapField.INPUT]?.wrapped.equals(token0));

    const [wasInverted, setWasInverted] = useState(false);

    const poolAddress = currencies[SwapField.INPUT] && currencies[SwapField.OUTPUT] && computePoolAddress({
        tokenA: currencies[SwapField.INPUT]!.wrapped,
        tokenB: currencies[SwapField.OUTPUT]!.wrapped
    }) as Address

    const [poolState, pool] = usePool(poolAddress);

    // const initialSellPrice = useMemo(() => {
    //     if (!pool || !token0 || !token1 || !currencies || !currencies[Field.INPUT]) return "";

    //     const __newPrice = invertPrice ? getTickToPrice(token1, token0, pool.tickCurrent) : getTickToPrice(token0, token1, pool.tickCurrent);

    //     let _tick = tryParseTick(token0, token1, 500, __newPrice?.toSignificant(18), tickSpacing);

    //     if (!_tick) return "";

    //     let initialPrice;

    //     if (tickSpacing < 2) {
    //         const newPrice = 1.0001 ** (tick + tickSpacing * (invertPrice ? -1 : 1));
    //         const parsePrice = invertPrice ? tryParsePrice(token1, token0, newPrice.toString()) : tryParsePrice(token0, token1, newPrice.toString());
    //         initialPrice = invertPrice ? parsePrice?.invert().toSignificant(18) : parsePrice?.toSignificant(18);
    //     } else {
    //         if (currencies.INPUT.wrapped.address === token0.address) _tick = _tick < pool.tickCurrent ? _tick + tickSpacing : _tick;

    //         if (currencies.INPUT.wrapped.address === token1.address) _tick = _tick >= pool.tickCurrent ? _tick - tickSpacing : _tick;

    //         initialPrice = invertPrice ? getTickToPrice(token1, token0, _tick)?.toSignificant(18) : getTickToPrice(token0, token1, _tick)?.toSignificant(18);
    //     }

    //     console.log(currencies.INPUT.wrapped.address === token0.address, currencies.INPUT.wrapped.address, initialPrice);

    //     return initialPrice;
    // }, [pool, token0, token1, invertPrice]);

    const initialSellPrice = useMemo(() => {
        if (!pool) return "";

        const _newPrice = invertPrice ? getTickToPrice(token1, token0, pool.tickCurrent) : getTickToPrice(token0, token1, pool.tickCurrent);

        return _newPrice?.toSignificant(18);
    }, [pool, token0, token1, invertPrice]);

    const [sellPrice, setSellPrice] = useState("");

    const [approving, setApproving] = useState(false);

    // const toggleWalletModal = useWalletModalToggle();

    const { approvalState, approvalCallback } = useApprove(parsedAmounts[SwapField.INPUT], ALGEBRA_LIMIT_ORDER_PLUGIN);

    const placeLimitOrderHandler = useCallback(() => {
        if (!currencies.INPUT || !currencies.OUTPUT || !formattedAmounts[SwapField.INPUT] || !token0 || !token1 || tick === undefined) return;

        const _tick = invertPrice ? tryParseTick(token1, token0, sellPrice, tickSpacing) : tryParseTick(token0, token1, sellPrice, tickSpacing);
        // const _newPrice = getTickToPrice(token0, token1, _tick);

        if (_tick === undefined) return;

        // let price;

        // if (tickSpacing < 2) {
        //     const newPrice = 1.0001 ** (_tick + tickSpacing * (invertPrice ? -1 : 1));
        //     const parsePrice = invertPrice ? tryParsePrice(token1, token0, newPrice.toString()) : tryParsePrice(token0, token1, newPrice.toString());
        //     price = invertPrice ? parsePrice?.invert() : parsePrice;
        //     // price = invertPrice ? _newPrice?.invert() : _newPrice;
        // } else {
        //     price = invertPrice ? _newPrice?.invert() : _newPrice;
        // }

        // console.log(price);

        // const __tick = tryParseTick(token0, token1, 500, price?.toSignificant(18), tickSpacing);

        // if (__tick === undefined || price === undefined) return;

        const amount = parseUnits(formattedAmounts[SwapField.INPUT], currencies.INPUT.decimals);

        const depositedToken = !currencies.INPUT.wrapped.sortsBefore(currencies.OUTPUT.wrapped);

        // const additionalTick = Math.abs(Math.abs(tick) - Math.abs(__tick)) < tickSpacing && tickSpacing !== 1 ? tickSpacing : 0;

        // console.log("ADDITIONAL", additionalTick, __tick);

        placeLimitOrderFn(token0, token1, depositedToken, amount, wasInverted ? -_tick : _tick, currencies.INPUT.isNative);
    }, [currencies, formattedAmounts, wasInverted, sellPrice, token0, token1, tick, invertPrice, tickSpacing]);

    const showApproveButton = approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING || approving;

    const userHasSpecifiedInputOutput = Boolean(currencies[SwapField.INPUT] && currencies[SwapField.OUTPUT] && independentField !== SwapField.LIMIT_ORDER_PRICE && parsedAmounts[independentField]?.greaterThan('0'));

    const isLoadingRoute = TradeState.LOADING === tradeState.state;
    const isPoolExists = poolState === PoolState.EXISTS;

    const tickStep = useCallback(
        (direction: 1 | -1) => {

            if (!tickSpacing) return

            const tick = invertPrice ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing) : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

            if (!token0 || !token1 || tick === undefined) {
                setSellPrice("");
                return;
            }

            let limitOrderPrice;

            // With small tickSpacing sometimes next and previous prices are the same. BigNumber wrongly compares two real small values

            if (tickSpacing < 2) {
                limitOrderPrice = String(Number(sellPrice) + Number(0.0001 * tickSpacing) * Number(sellPrice) * direction * (invertPrice ? -1 : 1));
            } else {
                limitOrderPrice = invertPrice
                    ? tickToPrice(token1, token0, tick + tickSpacing * direction * -1).toSignificant(18)
                    : tickToPrice(token0, token1, tick + tickSpacing * direction).toSignificant(18);
            }

            setSellPrice(limitOrderPrice);
            typeLimitOrderPrice(limitOrderPrice);
        },
        [invertPrice, token0, token1, sellPrice, tickSpacing]
    );

    const blockCreation = useMemo(() => {
        if (!currencies.INPUT || !currencies.OUTPUT || !token0 || !token1 || !tick) return true;

        const _tick = invertPrice ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing) : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

        if (_tick === undefined) return true;

        console.log(currencies.INPUT.wrapped.address === token0.address, wasInverted, _tick, tick);

        if (currencies.INPUT.wrapped.address === token0.address && (wasInverted ? -tick : _tick) <= tick) return true;

        if (currencies.INPUT.wrapped.address === token1.address && (wasInverted ? -_tick : _tick) > tick) return true;

        return false;
    }, [token0, token1, currencies, invertPrice, sellPrice, tick, wasInverted, tickSpacing]);

    const [plusDisabled, minusDisabled] = useMemo(() => {
        if (!currencies.INPUT || !currencies.OUTPUT || !token0 || !token1 || !tick || !tickSpacing) return [true, true];

        const _tick = invertPrice ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing) : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

        if (_tick === undefined) return [true, true];

        if (currencies.INPUT.wrapped.address === token0.address && (wasInverted ? -_tick : _tick) <= tick + tickSpacing)
            return wasInverted ? (invertPrice ? [false, true] : [true, false]) : invertPrice ? [true, false] : [false, true];

        if (currencies.INPUT.wrapped.address === token1.address && (wasInverted ? -_tick : _tick) + tickSpacing >= tick)
            return wasInverted ? (invertPrice ? [true, false] : [false, true]) : invertPrice ? [false, true] : [true, false];

        return [false, false];
    }, [token0, token1, currencies, invertPrice, sellPrice, tick, wasInverted, tickSpacing]);

    const handleSetSellPrice = useCallback(
        (value: string, invert = false) => {
            const tick = tryParseTick(token0, token1, value, tickSpacing);

            const newPrice = getTickToPrice(token0, token1, tick);

            if (!newPrice) {
                setSellPrice("");
                return;
            }

            const limitOrderPrice = invert ? newPrice.invert().toSignificant(18) : newPrice.toSignificant(18);

            setSellPrice(limitOrderPrice);
            typeLimitOrderPrice(limitOrderPrice);
        },
        [token0, token1, tickSpacing]
    );

    const setToMarketPrice = useCallback(
        (invert: boolean) => {
            if (!initialSellPrice) return;

            handleSetSellPrice(initialSellPrice, invert);
            limitOrderPriceLastFocused();
        },
        [initialSellPrice]
    );

    useEffect(() => {
        if (!token0 || !token1) return;

        if (sellPrice && previousTokens === token0.address + token1.address) {
            const tick = tryParseTick(token0, token1, sellPrice, tickSpacing);

            const newPrice = getTickToPrice(token0, token1, tick)?.invert();

            setSellPrice(newPrice ? newPrice.toSignificant(18) : "");
            typeLimitOrderPrice(newPrice ? newPrice.toSignificant(18) : "");
        } else if (sellPrice) {
            setSellPrice("");
            typeLimitOrderPrice(limitOrderPrice);
        }
    }, [currencies[Field.INPUT]?.wrapped.address, currencies[Field.OUTPUT]?.wrapped.address]);

    useEffect(() => {
        if (initialSellPrice && !sellPrice) {
            setSellPrice(initialSellPrice);
            dispatch(typeLimitOrderPrice({ limitOrderPrice: initialSellPrice }));
        }
    }, [initialSellPrice, invertPrice]);

    useEffect(() => {
        setInitialSingleHop(singleHopOnly);
        setSingleHopOnly(true);

        return () => {
            dispatch(typeLimitOrderPrice({ limitOrderPrice: "" }));
            dispatch(limitOrderPriceWasInverted({ wasInverted: false }));
            setSingleHopOnly(initialSingleHop);
        };
    }, [initialSingleHop]);

}

export default LimitOrder;