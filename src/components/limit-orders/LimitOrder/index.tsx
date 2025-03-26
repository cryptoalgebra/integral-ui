import { PoolState, usePool } from "@/hooks/pools/usePool";
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { computeCustomPoolAddress, getTickToPrice, tickToPrice, tryParseTick } from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import LimitPriceCard from "../LimitPriceCard";
import LimitOrderButton from "../LimitOrderButton";
import { CUSTOM_POOL_DEPLOYER_LIMIT_ORDER } from "@/constants/addresses";
import { Address } from "viem";

const LimitOrder = () => {
    const { currencies } = useDerivedSwapInfo();

    const singleHopOnly = false;

    const [initialSingleHop, setInitialSingleHop] = useState(singleHopOnly);

    const {
        actions: { typeLimitOrderPrice, limitOrderPriceLastFocused, limitOrderPriceWasInverted },
    } = useSwapState();

    const showWrap = false;

    const tokenA = currencies[SwapField.INPUT]?.wrapped;
    const tokenB = currencies[SwapField.OUTPUT]?.wrapped;

    const [token0, token1] =
        tokenA && tokenB && !showWrap ? (tokenA?.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined];

    const invertPrice = Boolean(currencies[SwapField.INPUT] && token0 && !currencies[SwapField.INPUT]?.wrapped.equals(token0));

    const zeroToOne = !invertPrice;

    const [wasInverted, setWasInverted] = useState(false);

    const limitOrderPoolAddress =
        token0 && token1
            ? (computeCustomPoolAddress({
                  tokenA: token0,
                  tokenB: token1,
                  customPoolDeployer: CUSTOM_POOL_DEPLOYER_LIMIT_ORDER,
              }) as Address)
            : undefined;

    const [limitOrderPoolExists, limitOrderPool] = usePool(limitOrderPoolAddress);

    const initialSellPrice = useMemo(() => {
        if (!limitOrderPool) return "";

        const _newPrice = invertPrice
            ? getTickToPrice(token1, token0, limitOrderPool.tickCurrent - limitOrderPool.tickSpacing)
            : getTickToPrice(token0, token1, limitOrderPool.tickCurrent + limitOrderPool.tickSpacing);

        return _newPrice?.toSignificant(_newPrice.baseCurrency.decimals / 2);
    }, [limitOrderPool, token0, token1, invertPrice]);

    const [sellPrice, setSellPrice] = useState("");

    const isPoolExists = limitOrderPoolExists === PoolState.EXISTS;

    const tick = limitOrderPool?.tickCurrent;
    const tickSpacing = limitOrderPool?.tickSpacing;

    const tickStep = useCallback(
        (direction: 1 | -1) => {
            if (!tickSpacing) return;

            const tick = invertPrice
                ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
                : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

            if (!token0 || !token1 || tick === undefined) {
                setSellPrice("");
                return;
            }

            const limitOrderPrice = invertPrice
                ? tickToPrice(token1, token0, tick + tickSpacing * direction * -1).toSignificant(token1.decimals / 2)
                : tickToPrice(token0, token1, tick + tickSpacing * direction).toSignificant(token0.decimals / 2);

            setSellPrice(limitOrderPrice);
            typeLimitOrderPrice(limitOrderPrice);
        },
        [invertPrice, token0, token1, sellPrice, tickSpacing]
    );

    const blockCreation = useMemo(() => {
        if (!currencies.INPUT || !currencies.OUTPUT || !token0 || !token1 || !tick || !tickSpacing) return true;

        const _priceTick = invertPrice
            ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
            : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

        if (_priceTick === undefined) return true;

        const priceTick = wasInverted ? -_priceTick : _priceTick;

        if (currencies.INPUT.wrapped.equals(token0) && priceTick < tick) return true;

        if (currencies.INPUT.wrapped.equals(token1) && priceTick + tickSpacing >= tick) return true;

        return false;
    }, [token0, token1, currencies, invertPrice, sellPrice, tick, wasInverted, tickSpacing]);

    console.log("BLOCK", blockCreation);

    const [plusDisabled, minusDisabled] = useMemo(() => {
        if (!currencies.INPUT || !currencies.OUTPUT || !token0 || !token1 || !tick || !tickSpacing) return [true, true];

        const _priceTick = invertPrice
            ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
            : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

        if (_priceTick === undefined) return [true, true];

        const priceTick = wasInverted ? -_priceTick : _priceTick;

        if (currencies.INPUT.wrapped.equals(token0) && priceTick - tickSpacing <= tick) return wasInverted ? [true, false] : [false, true];

        if (currencies.INPUT.wrapped.equals(token1) && priceTick + tickSpacing >= tick - tickSpacing)
            return wasInverted ? [true, false] : [false, true];

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

            const limitOrderPrice = invert
                ? newPrice.invert().toSignificant((token1?.decimals || 6) / 2)
                : newPrice.toSignificant((token0?.decimals || 6) / 2);

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
        if (initialSellPrice && !sellPrice) {
            setSellPrice(initialSellPrice);
            typeLimitOrderPrice(initialSellPrice);
        }
    }, [initialSellPrice, invertPrice]);

    useEffect(() => {
        setInitialSingleHop(singleHopOnly);

        return () => {
            typeLimitOrderPrice("");
            limitOrderPriceWasInverted(false);
        };
    }, [initialSingleHop]);

    return (
        <>
            <LimitPriceCard
                currency={currencies[SwapField.INPUT]}
                otherCurrency={currencies[SwapField.OUTPUT]}
                sellPrice={sellPrice}
                invertTick={(value: string) => {
                    handleSetSellPrice(value, true);
                    setWasInverted(!wasInverted);
                    limitOrderPriceWasInverted(!wasInverted);
                }}
                setSellPrice={handleSetSellPrice}
                tickStep={tickStep}
                setToMarketPrice={setToMarketPrice}
                plusDisabled={plusDisabled}
                minusDisabled={minusDisabled}
                disabled={showWrap || !isPoolExists}
            />
            <LimitOrderButton
                disabled={blockCreation}
                limitOrderPlugin={isPoolExists}
                token0={token0}
                token1={token1}
                poolAddress={limitOrderPoolAddress}
                sellPrice={sellPrice}
                tickSpacing={tickSpacing}
                wasInverted={wasInverted}
                zeroToOne={zeroToOne}
            />
        </>
    );
};

export default LimitOrder;
