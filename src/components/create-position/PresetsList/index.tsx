import { PresetProfits, Presets, PresetsArgs, PresetsType } from "@/types/presets";

interface PresetsListProps {
    activePreset: PresetsType | null;
    handlePresetRangeSelection: (preset: PresetsArgs | null) => void;
    isStablecoinPair: boolean;
}

const stablecoinsPreset = [
    {
        type: Presets.STABLE,
        title: `Stablecoins`,
        min: 0.984,
        max: 1.01,
        risk: PresetProfits.VERY_LOW,
        profit: PresetProfits.HIGH,
    },
]

const commonPresets = [
    {
        type: Presets.RISK,
        title: `Narrow`,
        min: 0.95,
        max: 1.1,
        risk: PresetProfits.HIGH,
        profit: PresetProfits.HIGH,
    },
    {
        type: Presets.NORMAL,
        title: `Common`,
        min: 0.9,
        max: 1.2,
        risk: PresetProfits.MEDIUM,
        profit: PresetProfits.MEDIUM,
    },
    {
        type: Presets.SAFE,
        title: `Wide`,
        min: 0.8,
        max: 1.4,
        risk: PresetProfits.LOW,
        profit: PresetProfits.LOW,
    },
    {
        type: Presets.FULL,
        title: `Full`,
        min: 0,
        max: Infinity,
        risk: PresetProfits.VERY_LOW,
        profit: PresetProfits.VERY_LOW,
    },
]

const PresetsList = ({ activePreset, handlePresetRangeSelection, isStablecoinPair }: PresetsListProps) => {

    const presets = isStablecoinPair ? stablecoinsPreset : commonPresets

    function onPresetSelect(range: PresetsArgs) {
        if (activePreset == range.type) {
            handlePresetRangeSelection(null);
        } else {
            handlePresetRangeSelection(range);
        }
    }

    return <div className="flex flex-col">
        {presets.map((range) => <button
            key={`preset-range-${range.title}`}
            onClick={() => onPresetSelect(range)}
            className={`px-8 py-2 text-left hover:bg-red-500 ${activePreset === range.type ? 'text-red-300 border-l-2 border-red-500' : 'white'}`}
        >{range.title}</button>)}
    </div>

}

export default PresetsList;