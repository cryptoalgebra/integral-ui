import type { LiquidityPointV2, StrategyPresetV2 } from "./typesV2";

export const ROW_HEIGHT = 4;
export const MIN_TICK_DISTANCE = 2;
export const ZOOM_MIN_FALLBACK = 0.01;
export const ZOOM_MAX = 3;
export const ZOOM_FACTOR = 1.25;
const STRATEGY_TOLERANCE = 0.02;

export function findClosestTick(liquidityData: LiquidityPointV2[], targetPrice: number) {
    if (liquidityData.length === 0) {
        return { point: { tick: 0, price0: targetPrice, activeLiquidity: 0 }, index: 0 };
    }

    let closestIndex = 0;
    let closestDelta = Math.abs(liquidityData[0].price0 - targetPrice);

    for (let i = 1; i < liquidityData.length; i++) {
        const nextDelta = Math.abs(liquidityData[i].price0 - targetPrice);
        if (nextDelta < closestDelta) {
            closestDelta = nextDelta;
            closestIndex = i;
        }
    }

    return { point: liquidityData[closestIndex], index: closestIndex };
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

export function priceToY({
    price,
    liquidityData,
    zoom,
    panY,
    viewportHeight,
}: {
    price: number;
    liquidityData: LiquidityPointV2[];
    zoom: number;
    panY: number;
    viewportHeight: number;
}) {
    if (liquidityData.length === 0) {
        return viewportHeight / 2;
    }

    const { index } = findClosestTick(liquidityData, price);
    const descendingIndex = liquidityData.length - 1 - index;
    const rowHeight = ROW_HEIGHT * zoom;
    return panY + descendingIndex * rowHeight + rowHeight / 2;
}

export function yToPrice({
    y,
    liquidityData,
    zoom,
    panY,
}: {
    y: number;
    liquidityData: LiquidityPointV2[];
    zoom: number;
    panY: number;
}) {
    if (liquidityData.length === 0) {
        return 0;
    }

    const rowHeight = ROW_HEIGHT * zoom;
    const normalizedIndex = Math.round((y - panY - rowHeight / 2) / rowHeight);
    const descendingIndex = clamp(normalizedIndex, 0, liquidityData.length - 1);
    const ascendingIndex = liquidityData.length - 1 - descendingIndex;
    return liquidityData[ascendingIndex].price0;
}

export function boundPanY({
    panY,
    viewportHeight,
    liquidityLength,
    zoom,
}: {
    panY: number;
    viewportHeight: number;
    liquidityLength: number;
    zoom: number;
}) {
    const contentHeight = liquidityLength * ROW_HEIGHT * zoom;
    const minPanY = Math.min(0, viewportHeight - contentHeight);
    return clamp(panY, minPanY, 0);
}

export function calculateDynamicZoomMin(liquidityLength: number, viewportHeight: number) {
    if (liquidityLength <= 0) {
        return ZOOM_MIN_FALLBACK;
    }

    const contentHeight = liquidityLength * ROW_HEIGHT;
    const ratio = viewportHeight / contentHeight;
    return Math.max(ZOOM_MIN_FALLBACK, Math.min(1, ratio));
}

export function enforceMinRangeDistance({
    minIndex,
    maxIndex,
    liquidityLength,
    minimumTickDistance = MIN_TICK_DISTANCE,
}: {
    minIndex: number;
    maxIndex: number;
    liquidityLength: number;
    minimumTickDistance?: number;
}) {
    if (liquidityLength === 0) {
        return { minIndex: 0, maxIndex: 0 };
    }

    let nextMin = clamp(minIndex, 0, liquidityLength - 1);
    let nextMax = clamp(maxIndex, 0, liquidityLength - 1);

    if (nextMax - nextMin < minimumTickDistance) {
        nextMax = clamp(nextMin + minimumTickDistance, 0, liquidityLength - 1);
        if (nextMax - nextMin < minimumTickDistance) {
            nextMin = clamp(nextMax - minimumTickDistance, 0, liquidityLength - 1);
        }
    }

    if (nextMin > nextMax) {
        const middle = Math.round((nextMin + nextMax) / 2);
        nextMin = clamp(middle - minimumTickDistance, 0, liquidityLength - 1);
        nextMax = clamp(nextMin + minimumTickDistance, 0, liquidityLength - 1);
    }

    return { minIndex: nextMin, maxIndex: nextMax };
}

export function calculateRangeViewport({
    minTick,
    maxTick,
    liquidityData,
    viewportHeight,
    dynamicZoomMin,
}: {
    minTick: number;
    maxTick: number;
    liquidityData: LiquidityPointV2[];
    viewportHeight: number;
    dynamicZoomMin: number;
}) {
    if (liquidityData.length <= 1) {
        return { targetZoom: 1, targetPanY: 0 };
    }

    const minIndex = liquidityData.findIndex((item) => item.tick === minTick);
    const maxIndex = liquidityData.findIndex((item) => item.tick === maxTick);
    const safeMin = minIndex === -1 ? 0 : minIndex;
    const safeMax = maxIndex === -1 ? liquidityData.length - 1 : maxIndex;
    const span = Math.max(1, Math.abs(safeMax - safeMin));

    const paddedRows = span * 1.25;
    const rowsVisible = viewportHeight / ROW_HEIGHT;
    const targetZoom = clamp(rowsVisible / paddedRows, dynamicZoomMin, ZOOM_MAX);

    const centerIndexAsc = (safeMin + safeMax) / 2;
    const centerIndexDesc = liquidityData.length - 1 - centerIndexAsc;
    const targetPanY = viewportHeight / 2 - (centerIndexDesc + 0.5) * ROW_HEIGHT * targetZoom;

    return {
        targetZoom,
        targetPanY: boundPanY({
            panY: targetPanY,
            viewportHeight,
            liquidityLength: liquidityData.length,
            zoom: targetZoom,
        }),
    };
}

export function calculateStrategyRange({
    strategy,
    currentPrice,
    liquidityData,
}: {
    strategy: StrategyPresetV2;
    currentPrice: number;
    liquidityData: LiquidityPointV2[];
}) {
    if (liquidityData.length === 0) {
        return { minPrice: currentPrice, maxPrice: currentPrice };
    }

    const { index } = findClosestTick(liquidityData, currentPrice);
    const minIndex = 0;
    const maxIndex = liquidityData.length - 1;

    switch (strategy) {
        case "stable": {
            const from = clamp(index - 3, 0, maxIndex);
            const to = clamp(index + 3, 0, maxIndex);
            return {
                minPrice: liquidityData[from].price0,
                maxPrice: liquidityData[to].price0,
            };
        }
        case "wide":
            return {
                minPrice: currentPrice * 0.5,
                maxPrice: currentPrice * 2,
            };
        case "one-sided-lower":
            return {
                minPrice: currentPrice * 0.5,
                maxPrice: liquidityData[clamp(index - 1, 0, maxIndex)].price0,
            };
        case "one-sided-upper":
            return {
                minPrice: liquidityData[clamp(index + 1, 0, maxIndex)].price0,
                maxPrice: currentPrice * 2,
            };
        case "full-range":
            return {
                minPrice: liquidityData[minIndex].price0,
                maxPrice: liquidityData[maxIndex].price0,
            };
        case "custom":
            return {
                minPrice: liquidityData[clamp(index - 2, 0, maxIndex)].price0,
                maxPrice: liquidityData[clamp(index + 2, 0, maxIndex)].price0,
            };
        default:
            return {
                minPrice: currentPrice,
                maxPrice: currentPrice,
            };
    }
}

export function detectStrategy({
    minPrice,
    maxPrice,
    currentPrice,
    liquidityData,
}: {
    minPrice: number;
    maxPrice: number;
    currentPrice: number;
    liquidityData: LiquidityPointV2[];
}) {
    const candidates: StrategyPresetV2[] = ["stable", "wide", "one-sided-lower", "one-sided-upper", "full-range"];

    for (const candidate of candidates) {
        const expected = calculateStrategyRange({ strategy: candidate, currentPrice, liquidityData });
        const minDelta = Math.abs(minPrice - expected.minPrice) / Math.max(expected.minPrice, Number.EPSILON);
        const maxDelta = Math.abs(maxPrice - expected.maxPrice) / Math.max(expected.maxPrice, Number.EPSILON);

        if (minDelta <= STRATEGY_TOLERANCE && maxDelta <= STRATEGY_TOLERANCE) {
            return candidate;
        }
    }

    return undefined;
}
