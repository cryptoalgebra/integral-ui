import { Bound } from "@cryptoalgebra/custom-pools-sdk";

export type ChartVariant = "default" | "dark";

export interface ChartEntry {
    activeLiquidity: number;
    price0: number;
    price1: number;
    isCurrent: boolean;
}

interface Dimensions {
    width: number;
    height: number;
}

interface Margins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface ZoomLevels {
    initialMin: number;
    initialMax: number;
    min: number;
    max: number;
}

export interface ChartStyles {
    main: {
        primary: string;
        secondary: string;
    };
    area: {
        selection: string;
        current: string;
    };
    brush: {
        handleStroke: string;
        handleAccent: string;
        handleBg: string;
    };
    tooltip: {
        bg: string;
        primary: string;
    };
}

export interface LiquidityChartRangeInputProps {
    id?: string;
    data: {
        series: ChartEntry[];
        current: number;
    };
    ticksAtLimit: { [bound in Bound]?: boolean | undefined };
    styles: ChartStyles;
    dimensions: Dimensions;
    margins: Margins;
    interactive?: boolean;
    brushLabels: (d: "w" | "e", x: number) => string;
    brushDomain?: [number, number];
    onBrushDomainChange: (domain: [number, number], mode: string | undefined) => void;
    zoomLevels: ZoomLevels;
    isMock?: boolean;
    isOnlyView?: boolean;
    labelA?: string;
    labelB?: string;
}
