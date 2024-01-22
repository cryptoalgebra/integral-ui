import CurrencyLogo from "@/components/common/CurrencyLogo"
import Loader from "@/components/common/Loader"
import { DynamicFeePluginIcon } from "@/components/common/PluginIcons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PoolFieldsFragment, usePoolsListQuery } from "@/graphql/generated/graphql"
import { useCurrency } from "@/hooks/common/useCurrency"
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins"
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore"
import { SwapField } from "@/types/swap-field"
// import { ChevronDownIcon } from "lucide-react"
import { memo, useState } from "react"
import { Address } from "wagmi"

const IntegralPools = () => {

    const { currencies, poolAddress } = useDerivedSwapInfo()

    const { [SwapField.INPUT]: currencyA, [SwapField.OUTPUT]: currencyB } = currencies

    const title = currencyA && currencyB && `${currencyA.symbol} / ${currencyB.symbol}`

    const { isLoading: isPluginsLoading, dynamicFeePlugin } = usePoolPlugins(poolAddress)

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return <div className="relative flex flex-col w-full gap-2 py-2 pt-3 px-4 bg-card rounded-3xl border border-card-border">

        <div className="absolute text-sm font-semibold text-left -top-[10px] text-[#e97fff] bg-[#450174] w-fit px-2 pb-1 rounded-lg">
            Integral Pools
        </div>

        <div className="flex items-center justify-between">

            <Popover open={isOpen} >
                <PopoverTrigger
                    // onMouseDown={() => setIsOpen(v => !v)}
                    className="flex items-center gap-4 w-fit py-2 px-4 rounded-2xl border-card-border duration-200">
                    <div className="flex">
                        <CurrencyLogo currency={currencyA} size={25} />
                        <CurrencyLogo currency={currencyB} size={25} style={{ marginLeft: '-8px' }} />
                    </div>
                    <div className="text-md md:text-lg font-semibold">{title}</div>
                    {/* <div>
                        <ChevronDownIcon size={20} className={`duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div> */}
                </PopoverTrigger>

                <PopoverContent className="bg-card rounded-3xl border border-card-border" onPointerDownOutside={() => setTimeout(() => setIsOpen(false), 0)}>
                    <IntegralPoolsList poolAddress={poolAddress} onPoolSelect={() => setIsOpen(false)} />
                </PopoverContent>
            </Popover>

            <div>
                {isPluginsLoading ? <Loader size={16} /> : <div className="flex">
                    {dynamicFeePlugin && <DynamicFeePluginIcon />}
                </div>}
            </div>

        </div>
    </div>

}

const IntegralPoolsList = memo(({ poolAddress, onPoolSelect }: { poolAddress: Address | undefined, onPoolSelect: () => void }) => {

    const { data: pools, loading } = usePoolsListQuery()

    if (loading) return <span className="flex w-full justify-center text-white !min-w-[240px] m-auto"> <Loader /> </span>

    return <div className="flex flex-col gap-2">{pools?.pools.filter((pool) => poolAddress?.toLowerCase() !== pool.id.toLowerCase()).map((pool, idx) => <IntegralPoolsListItem key={`integral-pool-item-${idx}`} pool={pool} onPoolSelect={onPoolSelect} />)}</div>

})

const IntegralPoolsListItem = memo(({ pool, onPoolSelect }: { pool: PoolFieldsFragment, onPoolSelect: () => void }) => {

    const { isLoading: isPluginsLoading, dynamicFeePlugin } = usePoolPlugins(pool.id as Address)

    const { actions: { selectCurrency, typeInput } } = useSwapState()

    const currencyA = useCurrency(pool.token0.id as Address)
    const currencyB = useCurrency(pool.token1.id as Address)

    const selectPool = () => {
        typeInput(SwapField.INPUT, '')
        typeInput(SwapField.OUTPUT, '')
        selectCurrency(SwapField.INPUT, pool.token0.id)
        selectCurrency(SwapField.OUTPUT, pool.token1.id)
        onPoolSelect()
    }

    return <div className="flex items-center gap-4 min-h-[40px] text-white px-2 py-1 rounded-2xl whitespace-nowrap cursor-pointer hover:bg-card-hover duration-200" onClick={selectPool}>
        <div className="flex">
            <CurrencyLogo currency={currencyA} size={25} />
            <CurrencyLogo currency={currencyB} size={25} style={{marginLeft: '-8px'}} />
        </div>
        <div className="font-semibold">{currencyA && currencyB ? `${currencyA?.symbol} / ${currencyB?.symbol}` : ''}</div>
        <div className="ml-auto">
            {isPluginsLoading ? <Loader size={16} /> : <div className="flex">
                {dynamicFeePlugin && <DynamicFeePluginIcon />}
            </div>}
        </div>
    </div>
})

export default IntegralPools