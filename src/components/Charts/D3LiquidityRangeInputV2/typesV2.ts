export type InputModeV2 = "price" | "percentage";

export type TimePeriodV2 = "1D" | "1W" | "1M" | "1Y";

export type StrategyPresetV2 =
    | "stable"
    | "wide"
    | "one-sided-lower"
    | "one-sided-upper"
    | "full-range"
    | "custom";

export interface PricePointV2 {
    time: number;
    value: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
}

export interface LiquidityPointV2 {
    tick: number;
    price0: number;
    activeLiquidity: number;
}

export interface RangeStateV2 {
    minPrice: number;
    maxPrice: number;
    minTick: number;
    maxTick: number;
    isFullRange: boolean;
}

export interface ViewportStateV2 {
    zoom: number;
    panY: number;
    dynamicZoomMin: number;
}

export interface UiStateV2 {
    inputMode: InputModeV2;
    selectedHistoryDuration: TimePeriodV2;
    selectedStrategy: StrategyPresetV2 | undefined;
}

export type DragHandleV2 = "min" | "max" | "center";

export interface InteractionStateV2 {
    hoveredLiquidityIndex: number | null;
    hoveredPrice: number | null;
    dragHandle: DragHandleV2 | null;
    dragStartRange: { minPrice: number; maxPrice: number } | null;
    dragCurrentPrice: number | null;
}

export interface DimensionsStateV2 {
    width: number;
    height: number;
    initialized: boolean;
}

export interface LiquidityChartStateV2 {
    range: RangeStateV2;
    viewport: ViewportStateV2;
    ui: UiStateV2;
    interaction: InteractionStateV2;
    dimensions: DimensionsStateV2;
}

export type LiquidityChartActionV2 =
    | { type: "SET_DIMENSIONS"; payload: { width: number; height: number } }
    | { type: "SET_VIEWPORT"; payload: Partial<ViewportStateV2> }
    | { type: "SET_RANGE"; payload: Partial<RangeStateV2> }
    | { type: "SET_INPUT_MODE"; payload: InputModeV2 }
    | { type: "SET_TIME_PERIOD"; payload: TimePeriodV2 }
    | { type: "SET_STRATEGY"; payload: StrategyPresetV2 | undefined }
    | { type: "SET_HOVER"; payload: { index: number | null; price: number | null } }
    | { type: "START_DRAG"; payload: { handle: DragHandleV2; minPrice: number; maxPrice: number; startPrice: number } }
    | { type: "UPDATE_DRAG"; payload: { price: number } }
    | { type: "END_DRAG" }
    | { type: "RESET"; payload: Partial<LiquidityChartStateV2> };

export interface LiquidityRangeChartV2Props {
    priceData: PricePointV2[];
    liquidityData: LiquidityPointV2[];
    quoteSymbol?: string;
    baseSymbol?: string;
    quoteTokenAddress?: string;
    baseTokenAddress?: string;
    currentPrice?: number;
    initialMinPrice?: number;
    initialMaxPrice?: number;
    initialInputMode?: InputModeV2;
    initialTimePeriod?: TimePeriodV2;
    initialFullRange?: boolean;
    width?: number;
    height?: number;
    useFullRangePreset?: boolean;
    disableRangeEditing?: boolean;
    onMinPriceChange: (price?: number, tick?: number) => void;
    onMaxPriceChange: (price?: number, tick?: number) => void;
    onInputModeChange: (mode: InputModeV2) => void;
    onTimePeriodChange: (period: TimePeriodV2) => void;
    onFullRangeChange: (isFullRange: boolean) => void;
}

export interface LiquidityChartCommandsV2 {
    reset: () => void;
    zoom: (direction: "in" | "out", cursorY?: number) => void;
    pan: (deltaY: number) => void;
    center: () => void;
    setRange: (next: { minPrice?: number; maxPrice?: number; isFullRange?: boolean }, commit?: boolean, fitViewport?: boolean) => void;
    setStrategy: (strategy: StrategyPresetV2) => void;
    setTimePeriod: (period: TimePeriodV2) => void;
    toggleMode: () => void;
    startDrag: (handle: DragHandleV2) => void;
    updateDrag: (price: number) => void;
    endDrag: () => void;
    setHover: (index: number | null, price: number | null) => void;
}

export interface LiquidityChartModelOptionsV2 {
    liquidityData: LiquidityPointV2[];
    currentPrice: number;
    initialMinPrice?: number;
    initialMaxPrice?: number;
    initialFullRange?: boolean;
    initialInputMode?: InputModeV2;
    initialTimePeriod?: TimePeriodV2;
    initialWidth: number;
    initialHeight: number;
    onMinPriceChange: (price?: number, tick?: number) => void;
    onMaxPriceChange: (price?: number, tick?: number) => void;
    onInputModeChange: (mode: InputModeV2) => void;
    onTimePeriodChange: (period: TimePeriodV2) => void;
    onFullRangeChange: (isFullRange: boolean) => void;
}
