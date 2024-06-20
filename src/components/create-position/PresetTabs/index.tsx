import { useMemo } from "react";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { IDerivedMintInfo, useMintState, useMintActionHandlers } from "@/state/mintStore";
import { PresetProfits, Presets, PresetsArgs } from "@/types/presets";
import { Button } from "@/components/ui/button";

interface RangeSidebarProps {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
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

const PresetTabs = ({ currencyA, currencyB, mintInfo }: RangeSidebarProps) => {

    const {
        preset,
        actions: {
            updateSelectedPreset,
            setFullRange,
        },
    } = useMintState();

    const {
        onLeftRangeInput,
        onRightRangeInput,
    } = useMintActionHandlers(mintInfo.noLiquidity);

    const isStablecoinPair = useMemo(() => {
        if (!currencyA || !currencyB) return false;

        // const stablecoins = [USDC.address, USDT.address, DAI.address];
        const stablecoins = ['', ''];

        return (
            stablecoins.includes(currencyA.wrapped.address.toLowerCase()) &&
            stablecoins.includes(currencyB.wrapped.address.toLowerCase())
        );
    }, [currencyA, currencyB]);

    const price = useMemo(() => {
        if (!mintInfo.price) return;

        return mintInfo.invertPrice
            ? mintInfo.price.invert().toSignificant(5)
            : mintInfo.price.toSignificant(5);
    }, [mintInfo]);

    function handlePresetRangeSelection(preset: any | null) {
        if (!price) return;

        updateSelectedPreset(preset ? preset.type : null);

        if (preset && preset.type === Presets.FULL) {
            setFullRange();
        } else {
            onLeftRangeInput(preset ? String(+price * preset.min) : '');
            onRightRangeInput(preset ? String(+price * preset.max) : '');
        }
    }

    const presets = isStablecoinPair ? stablecoinsPreset : commonPresets

    function onPresetSelect(range: PresetsArgs) {
        if (preset == range.type) {
            handlePresetRangeSelection(null);
        } else {
            handlePresetRangeSelection(range);
        }
    }

    return <div className="flex h-fit bg-card rounded-3xl p-1">
        {presets.map((range) => <Button
            variant={preset === range.type ? 'iconActive' : 'icon'}
            size={'sm'}
            key={`preset-range-${range.title}`}
            onClick={() => onPresetSelect(range)}
        >{range.title}</Button>)}
    </div>
}

export default PresetTabs