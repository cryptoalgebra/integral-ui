import { useMemo } from "react";
import { Bound, Currency } from "@cryptoalgebra/integral-sdk";
import { IDerivedMintInfo, useMintState, useRangeHopCallbacks, useMintActionHandlers } from "@/state/mintStore";
import { Presets } from "@/types/presets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PresetsList from "../PresetsList";
import RangeSelector from "../RangeSelector";

interface RangeSidebarProps {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
}

const RangeSidebar = ({ currencyA, currencyB, mintInfo }: RangeSidebarProps) => {

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

    const {
        startPriceTypedValue,
    } = useMintState();

    const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = useMemo(() => {
        return mintInfo.ticks;
    }, [mintInfo]);

    const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } =
        useMemo(() => {
            return mintInfo.pricesAtTicks;
        }, [mintInfo]);

    const {
        getDecrementLower,
        getIncrementLower,
        getDecrementUpper,
        getIncrementUpper,
    } = useRangeHopCallbacks(
        currencyA ?? undefined,
        currencyB ?? undefined,
        mintInfo.tickSpacing,
        tickLower,
        tickUpper,
        mintInfo.pool
    );

    // const tokenA = (currencyA ?? undefined)?.wrapped;
    // const tokenB = (currencyB ?? undefined)?.wrapped;

    // const isSorted = useMemo(() => {
    //     return tokenA && tokenB && tokenA.sortsBefore(tokenB);
    // }, [tokenA, tokenB, mintInfo]);


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

    return <div className="flex flex-col w-full h-full">
    <Tabs defaultValue={'presets'}>
        <TabsList className="bg-transparent text-white w-full justify-start text-xl pl-4 pt-4">
            <TabsTrigger value={'presets'} className="text-xl">Presets</TabsTrigger>
            <TabsTrigger value={'custom'} className="text-xl">Custom</TabsTrigger>
        </TabsList>
        <TabsContent value={'presets'}>
            <PresetsList
                isStablecoinPair={isStablecoinPair}
                activePreset={preset}
                handlePresetRangeSelection={handlePresetRangeSelection}
            />
        </TabsContent>
        <TabsContent value={'custom'}>
        <RangeSelector
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    getDecrementLower={getDecrementLower}
                    getIncrementLower={getIncrementLower}
                    getDecrementUpper={getDecrementUpper}
                    getIncrementUpper={getIncrementUpper}
                    onLeftRangeInput={onLeftRangeInput}
                    onRightRangeInput={onRightRangeInput}
                    currencyA={currencyA}
                    currencyB={currencyB}
                    mintInfo={mintInfo}
                    disabled={!startPriceTypedValue && !mintInfo.price}
                />
        </TabsContent>
    </Tabs>

    <div className="px-8 py-4 mt-auto text-left">
        <button className="text-[#898b95] hover:text-white">Reset</button>
    </div>

    </div>
}

export default RangeSidebar