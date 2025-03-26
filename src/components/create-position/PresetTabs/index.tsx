import { useMemo } from "react";
import { Currency, encodeSqrtRatioX96, Percent, TickMath, tickToPrice } from "@cryptoalgebra/custom-pools-sdk";
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
        min: 98,
        max: 101,
        risk: PresetProfits.VERY_LOW,
        profit: PresetProfits.HIGH,
    },
];

const commonPresets = [
    {
        type: Presets.RISK,
        title: `Narrow`,
        min: 95,
        max: 110,
        risk: PresetProfits.HIGH,
        profit: PresetProfits.HIGH,
    },
    {
        type: Presets.NORMAL,
        title: `Common`,
        min: 90,
        max: 120,
        risk: PresetProfits.MEDIUM,
        profit: PresetProfits.MEDIUM,
    },
    {
        type: Presets.SAFE,
        title: `Wide`,
        min: 80,
        max: 140,
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
];

const PresetTabs = ({ currencyA, currencyB, mintInfo }: RangeSidebarProps) => {
    const {
        preset,
        actions: { updateSelectedPreset, setFullRange },
    } = useMintState();

    const { onLeftRangeInput, onRightRangeInput } = useMintActionHandlers(mintInfo.noLiquidity);

    const isStablecoinPair = useMemo(() => {
        if (!currencyA || !currencyB) return false;

        // const stablecoins = [USDC.address, USDT.address, DAI.address];
        const stablecoins = ["", ""];

        return (
            stablecoins.includes(currencyA.wrapped.address.toLowerCase()) && stablecoins.includes(currencyB.wrapped.address.toLowerCase())
        );
    }, [currencyA, currencyB]);

    const price = useMemo(() => {
        if (!mintInfo.price) return;

        return mintInfo.invertPrice ? mintInfo.price.invert() : mintInfo.price;
    }, [mintInfo]);

    function handlePresetRangeSelection(preset: any | null) {
        if (!price) return;

        updateSelectedPreset(preset ? preset.type : null);

        if (preset && preset.type === Presets.FULL) {
            setFullRange();
        } else if (preset) {
            const minPrice = mintInfo.invertPrice
                ? price.invert().asFraction.multiply(new Percent(preset.min, 100))
                : price.asFraction.multiply(new Percent(preset.min, 100));
            const maxPrice = mintInfo.invertPrice
                ? price.invert().asFraction.multiply(new Percent(preset.max, 100))
                : price.asFraction.multiply(new Percent(preset.max, 100));

            const sqrtPriceMin = encodeSqrtRatioX96(minPrice.numerator, minPrice.denominator);
            const sqrtPriceMax = encodeSqrtRatioX96(maxPrice.numerator, maxPrice.denominator);

            const minPriceTick = TickMath.getTickAtSqrtRatio(sqrtPriceMin);
            const maxPriceTick = TickMath.getTickAtSqrtRatio(sqrtPriceMax);

            let priceAtMinTick;
            let priceAtMaxTick;

            if (currencyA && currencyB) {
                const baseToken = mintInfo.invertPrice ? currencyB.wrapped : currencyA.wrapped;
                const quoteToken = mintInfo.invertPrice ? currencyA.wrapped : currencyB.wrapped;

                priceAtMinTick = tickToPrice(baseToken, quoteToken, mintInfo.invertPrice ? maxPriceTick : minPriceTick);
                priceAtMaxTick = tickToPrice(baseToken, quoteToken, mintInfo.invertPrice ? minPriceTick : maxPriceTick);
            }

            if (priceAtMinTick && priceAtMaxTick) {
                onLeftRangeInput(mintInfo.invertPrice ? priceAtMinTick.invert().toSignificant() : priceAtMinTick.toSignificant());
                onRightRangeInput(mintInfo.invertPrice ? priceAtMaxTick.invert().toSignificant() : priceAtMaxTick.toSignificant());
            }
        } else {
            onLeftRangeInput("");
            onRightRangeInput("");
        }
    }

    const presets = isStablecoinPair ? stablecoinsPreset : commonPresets;

    function onPresetSelect(range: PresetsArgs) {
        if (preset == range.type) {
            handlePresetRangeSelection(null);
        } else {
            handlePresetRangeSelection(range);
        }
    }

    return (
        <div className="flex h-fit bg-card rounded-3xl p-1">
            {presets.map((range) => (
                <Button
                    variant={preset === range.type ? "iconActive" : "icon"}
                    size={"sm"}
                    key={`preset-range-${range.title}`}
                    onClick={() => onPresetSelect(range)}
                >
                    {range.title}
                </Button>
            ))}
        </div>
    );
};

export default PresetTabs;
