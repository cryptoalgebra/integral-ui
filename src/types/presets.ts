export const Presets = {
    SAFE: "SAFE",
    RISK: "RISK",
    NORMAL: "NORMAL",
    FULL: "FULL",
    STABLE: "STABLE",
};

export type PresetsType = (typeof Presets)[keyof typeof Presets];

export interface PresetsArgs {
    type: PresetsType;
    min: number;
    max: number;
}

export const PresetProfits = {
    VERY_LOW: "VERY_LOW",
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
};

export type PresetProfitsType = (typeof PresetProfits)[keyof typeof PresetProfits];
