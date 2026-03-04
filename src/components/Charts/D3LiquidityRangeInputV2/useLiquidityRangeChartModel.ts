import { useCallback, useMemo, useReducer, useRef } from "react";
import {
    boundPanY,
    calculateDynamicZoomMin,
    calculateRangeViewport,
    calculateStrategyRange,
    detectStrategy,
    enforceMinRangeDistance,
    findClosestTick,
    ZOOM_FACTOR,
    ZOOM_MAX,
} from "./chartMathV2";
import {
    DragHandleV2,
    InputModeV2,
    LiquidityChartActionV2,
    LiquidityChartCommandsV2,
    LiquidityChartModelOptionsV2,
    LiquidityChartStateV2,
    StrategyPresetV2,
} from "./typesV2";

const DEFAULT_HEIGHT = 220;
const DEFAULT_WIDTH = 640;

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function reducer(state: LiquidityChartStateV2, action: LiquidityChartActionV2): LiquidityChartStateV2 {
    switch (action.type) {
        case "SET_DIMENSIONS":
            return {
                ...state,
                dimensions: {
                    width: action.payload.width,
                    height: action.payload.height,
                    initialized: true,
                },
            };
        case "SET_VIEWPORT":
            return {
                ...state,
                viewport: {
                    ...state.viewport,
                    ...action.payload,
                },
            };
        case "SET_RANGE":
            return {
                ...state,
                range: {
                    ...state.range,
                    ...action.payload,
                },
            };
        case "SET_INPUT_MODE":
            return {
                ...state,
                ui: {
                    ...state.ui,
                    inputMode: action.payload,
                },
            };
        case "SET_TIME_PERIOD":
            return {
                ...state,
                ui: {
                    ...state.ui,
                    selectedHistoryDuration: action.payload,
                },
            };
        case "SET_STRATEGY":
            return {
                ...state,
                ui: {
                    ...state.ui,
                    selectedStrategy: action.payload,
                },
            };
        case "SET_HOVER":
            return {
                ...state,
                interaction: {
                    ...state.interaction,
                    hoveredLiquidityIndex: action.payload.index,
                    hoveredPrice: action.payload.price,
                },
            };
        case "START_DRAG":
            return {
                ...state,
                interaction: {
                    ...state.interaction,
                    dragHandle: action.payload.handle,
                    dragStartRange: {
                        minPrice: action.payload.minPrice,
                        maxPrice: action.payload.maxPrice,
                    },
                    dragCurrentPrice: action.payload.startPrice,
                },
            };
        case "UPDATE_DRAG":
            return {
                ...state,
                interaction: {
                    ...state.interaction,
                    dragCurrentPrice: action.payload.price,
                },
            };
        case "END_DRAG":
            return {
                ...state,
                interaction: {
                    ...state.interaction,
                    dragHandle: null,
                    dragStartRange: null,
                    dragCurrentPrice: null,
                },
            };
        case "RESET":
            return {
                ...state,
                ...action.payload,
            };
        default:
            return state;
    }
}

function sortLiquidityData(liquidityData: LiquidityChartModelOptionsV2["liquidityData"]) {
    return [...liquidityData].sort((a, b) => a.price0 - b.price0);
}

export function useLiquidityRangeChartModel(options: LiquidityChartModelOptionsV2) {
    const liquidityData = useMemo(() => sortLiquidityData(options.liquidityData), [options.liquidityData]);
    const currentPrice = options.currentPrice;
    const onMinPriceChange = options.onMinPriceChange;
    const onMaxPriceChange = options.onMaxPriceChange;
    const onInputModeChange = options.onInputModeChange;
    const onTimePeriodChange = options.onTimePeriodChange;
    const onFullRangeChange = options.onFullRangeChange;

    const initialCurrentPrice = currentPrice || liquidityData[Math.floor(liquidityData.length / 2)]?.price0 || 1;

    const initialRange = useMemo(() => {
        const defaultStrategy = options.initialFullRange ? "full-range" : "custom";
        const strategyRange = calculateStrategyRange({
            strategy: defaultStrategy,
            currentPrice: initialCurrentPrice,
            liquidityData,
        });

        const minPrice = options.initialMinPrice ?? strategyRange.minPrice;
        const maxPrice = options.initialMaxPrice ?? strategyRange.maxPrice;

        const snappedMin = findClosestTick(liquidityData, minPrice).point;
        const snappedMax = findClosestTick(liquidityData, maxPrice).point;

        const constrained = enforceMinRangeDistance({
            minIndex: findClosestTick(liquidityData, snappedMin.price0).index,
            maxIndex: findClosestTick(liquidityData, snappedMax.price0).index,
            liquidityLength: liquidityData.length,
        });

        const finalMin = liquidityData[constrained.minIndex] ?? snappedMin;
        const finalMax = liquidityData[constrained.maxIndex] ?? snappedMax;

        return {
            minPrice: finalMin.price0,
            maxPrice: finalMax.price0,
            minTick: finalMin.tick,
            maxTick: finalMax.tick,
            isFullRange: Boolean(options.initialFullRange),
        };
    }, [
        initialCurrentPrice,
        liquidityData,
        options.initialFullRange,
        options.initialMaxPrice,
        options.initialMinPrice,
    ]);

    const initialDynamicZoomMin = calculateDynamicZoomMin(liquidityData.length, options.initialHeight || DEFAULT_HEIGHT);
    const initialViewport = calculateRangeViewport({
        minTick: initialRange.minTick,
        maxTick: initialRange.maxTick,
        liquidityData,
        viewportHeight: options.initialHeight || DEFAULT_HEIGHT,
        dynamicZoomMin: initialDynamicZoomMin,
    });

    const [state, dispatch] = useReducer(reducer, {
        range: initialRange,
        viewport: {
            zoom: initialViewport.targetZoom,
            panY: initialViewport.targetPanY,
            dynamicZoomMin: initialDynamicZoomMin,
        },
        ui: {
            inputMode: options.initialInputMode ?? "price",
            selectedHistoryDuration: options.initialTimePeriod ?? "1M",
            selectedStrategy: options.initialFullRange ? "full-range" : undefined,
        },
        interaction: {
            hoveredLiquidityIndex: null,
            hoveredPrice: null,
            dragHandle: null,
            dragStartRange: null,
            dragCurrentPrice: null,
        },
        dimensions: {
            width: options.initialWidth || DEFAULT_WIDTH,
            height: options.initialHeight || DEFAULT_HEIGHT,
            initialized: false,
        },
    } as LiquidityChartStateV2);

    const stateRef = useRef(state);
    stateRef.current = state;

    const commitRangeToParent = useCallback(
        (minPrice: number, maxPrice: number, isFullRange: boolean) => {
            const minTick = findClosestTick(liquidityData, minPrice).point;
            const maxTick = findClosestTick(liquidityData, maxPrice).point;
            onMinPriceChange(minTick.price0, minTick.tick);
            onMaxPriceChange(maxTick.price0, maxTick.tick);
            onFullRangeChange(isFullRange);
        },
        [liquidityData, onFullRangeChange, onMaxPriceChange, onMinPriceChange]
    );

    const applyRange = useCallback(
        (
            next: {
                minPrice?: number;
                maxPrice?: number;
                isFullRange?: boolean;
            },
            commit: boolean,
            fitViewport = false
        ) => {
            const current = stateRef.current;
            const targetMinPrice = next.minPrice ?? current.range.minPrice;
            const targetMaxPrice = next.maxPrice ?? current.range.maxPrice;
            const targetIsFullRange = next.isFullRange ?? current.range.isFullRange;

            const minClosest = findClosestTick(liquidityData, targetMinPrice);
            const maxClosest = findClosestTick(liquidityData, targetMaxPrice);
            const constrained = enforceMinRangeDistance({
                minIndex: minClosest.index,
                maxIndex: maxClosest.index,
                liquidityLength: liquidityData.length,
            });

            const finalMinPoint = liquidityData[constrained.minIndex] ?? minClosest.point;
            const finalMaxPoint = liquidityData[constrained.maxIndex] ?? maxClosest.point;

            dispatch({
                type: "SET_RANGE",
                payload: {
                    minPrice: finalMinPoint.price0,
                    maxPrice: finalMaxPoint.price0,
                    minTick: finalMinPoint.tick,
                    maxTick: finalMaxPoint.tick,
                    isFullRange: targetIsFullRange,
                },
            });

            dispatch({
                type: "SET_STRATEGY",
                payload: detectStrategy({
                    minPrice: finalMinPoint.price0,
                    maxPrice: finalMaxPoint.price0,
                    currentPrice,
                    liquidityData,
                }),
            });

            if (commit) {
                commitRangeToParent(finalMinPoint.price0, finalMaxPoint.price0, targetIsFullRange);
            }

            if (fitViewport) {
                const viewport = calculateRangeViewport({
                    minTick: finalMinPoint.tick,
                    maxTick: finalMaxPoint.tick,
                    liquidityData,
                    viewportHeight: current.dimensions.height,
                    dynamicZoomMin: current.viewport.dynamicZoomMin,
                });

                dispatch({
                    type: "SET_VIEWPORT",
                    payload: {
                        zoom: viewport.targetZoom,
                        panY: viewport.targetPanY,
                    },
                });
            }
        },
        [commitRangeToParent, currentPrice, liquidityData]
    );

    const commands = useMemo<LiquidityChartCommandsV2>(() => {
        return {
            reset: () => {
                const current = stateRef.current;
                const dynamicZoomMin = calculateDynamicZoomMin(liquidityData.length, current.dimensions.height);
                const range = calculateStrategyRange({
                    strategy: "custom",
                    currentPrice,
                    liquidityData,
                });

                applyRange({ minPrice: range.minPrice, maxPrice: range.maxPrice, isFullRange: false }, true);

                const minPoint = findClosestTick(liquidityData, range.minPrice).point;
                const maxPoint = findClosestTick(liquidityData, range.maxPrice).point;
                const viewport = calculateRangeViewport({
                    minTick: minPoint.tick,
                    maxTick: maxPoint.tick,
                    liquidityData,
                    viewportHeight: current.dimensions.height,
                    dynamicZoomMin,
                });

                dispatch({
                    type: "SET_VIEWPORT",
                    payload: {
                        zoom: viewport.targetZoom,
                        panY: viewport.targetPanY,
                        dynamicZoomMin,
                    },
                });
            },
            zoom: (direction, cursorY) => {
                const current = stateRef.current;
                const factor = direction === "in" ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
                const nextZoom = clamp(current.viewport.zoom * factor, current.viewport.dynamicZoomMin, ZOOM_MAX);
                const anchorY = cursorY ?? current.dimensions.height / 2;
                const rawPanY = anchorY - ((anchorY - current.viewport.panY) * nextZoom) / current.viewport.zoom;

                dispatch({
                    type: "SET_VIEWPORT",
                    payload: {
                        zoom: nextZoom,
                        panY: boundPanY({
                            panY: rawPanY,
                            viewportHeight: current.dimensions.height,
                            liquidityLength: liquidityData.length,
                            zoom: nextZoom,
                        }),
                    },
                });
            },
            pan: (deltaY) => {
                const current = stateRef.current;
                dispatch({
                    type: "SET_VIEWPORT",
                    payload: {
                        panY: boundPanY({
                            panY: current.viewport.panY - deltaY,
                            viewportHeight: current.dimensions.height,
                            liquidityLength: liquidityData.length,
                            zoom: current.viewport.zoom,
                        }),
                    },
                });
            },
            center: () => {
                const current = stateRef.current;
                const viewport = calculateRangeViewport({
                    minTick: current.range.minTick,
                    maxTick: current.range.maxTick,
                    liquidityData,
                    viewportHeight: current.dimensions.height,
                    dynamicZoomMin: current.viewport.dynamicZoomMin,
                });
                dispatch({
                    type: "SET_VIEWPORT",
                    payload: {
                        zoom: viewport.targetZoom,
                        panY: viewport.targetPanY,
                    },
                });
            },
            setRange: (next, commit = true, fitViewport = false) => {
                applyRange(next, commit, fitViewport);
            },
            setStrategy: (strategy: StrategyPresetV2) => {
                const strategyRange = calculateStrategyRange({
                    strategy,
                    currentPrice,
                    liquidityData,
                });

                const isFullRange = strategy === "full-range";
                applyRange(
                    {
                        minPrice: strategyRange.minPrice,
                        maxPrice: strategyRange.maxPrice,
                        isFullRange,
                    },
                    true,
                    true
                );

                dispatch({ type: "SET_STRATEGY", payload: strategy });
            },
            setTimePeriod: (period) => {
                dispatch({ type: "SET_TIME_PERIOD", payload: period });
                onTimePeriodChange(period);
            },
            toggleMode: () => {
                const current = stateRef.current;
                const nextMode: InputModeV2 = current.ui.inputMode === "price" ? "percentage" : "price";
                dispatch({ type: "SET_INPUT_MODE", payload: nextMode });
                onInputModeChange(nextMode);
            },
            startDrag: (handle: DragHandleV2) => {
                const current = stateRef.current;
                const startPrice =
                    handle === "min"
                        ? current.range.minPrice
                        : handle === "max"
                        ? current.range.maxPrice
                        : (current.range.minPrice + current.range.maxPrice) / 2;
                dispatch({
                    type: "START_DRAG",
                    payload: {
                        handle,
                        minPrice: current.range.minPrice,
                        maxPrice: current.range.maxPrice,
                        startPrice,
                    },
                });
            },
            updateDrag: (price: number) => {
                const current = stateRef.current;
                if (!current.interaction.dragHandle || !current.interaction.dragStartRange || current.range.isFullRange) {
                    return;
                }

                dispatch({ type: "UPDATE_DRAG", payload: { price } });

                const { dragHandle, dragStartRange } = current.interaction;
                if (dragHandle === "min") {
                    applyRange({ minPrice: price }, false);
                    return;
                }

                if (dragHandle === "max") {
                    applyRange({ maxPrice: price }, false);
                    return;
                }

                const startCenter = (dragStartRange.minPrice + dragStartRange.maxPrice) / 2;
                const span = dragStartRange.maxPrice - dragStartRange.minPrice;
                const shift = price - startCenter;
                applyRange(
                    {
                        minPrice: dragStartRange.minPrice + shift,
                        maxPrice: dragStartRange.maxPrice + shift,
                    },
                    false
                );

                const updated = stateRef.current;
                const newSpan = updated.range.maxPrice - updated.range.minPrice;
                if (newSpan < span) {
                    applyRange(
                        {
                            minPrice: updated.range.minPrice,
                            maxPrice: updated.range.minPrice + span,
                        },
                        false
                    );
                }
            },
            endDrag: () => {
                const current = stateRef.current;
                if (current.interaction.dragHandle) {
                    commitRangeToParent(current.range.minPrice, current.range.maxPrice, current.range.isFullRange);
                }
                dispatch({ type: "END_DRAG" });
            },
            setHover: (index, price) => {
                dispatch({ type: "SET_HOVER", payload: { index, price } });
            },
        };
    }, [applyRange, commitRangeToParent, currentPrice, liquidityData, onInputModeChange, onTimePeriodChange]);

    return {
        state,
        dispatch,
        commands,
    };
}
