import CurrencyLogo from "@/components/common/CurrencyLogo"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PoolFieldsFragment, usePoolsListQuery } from "@/graphql/generated/graphql"
import { useCurrency } from "@/hooks/common/useCurrency"
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins"
import { usePoolsList } from "@/hooks/pools/usePoolsList"
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore"
import { SwapField } from "@/types/swap-field"
import { CandlestickChartIcon, ChevronDown, ChevronDownIcon, Loader2, MoveRightIcon, TrendingUpIcon, ZapIcon } from "lucide-react"
import { memo } from "react"
import { Address } from "wagmi"

const IntegralPools = () => {

    const { currencies, poolAddress } = useDerivedSwapInfo()

    const { [SwapField.INPUT]: currencyA, [SwapField.OUTPUT]: currencyB } = currencies

    const title = currencyA && currencyB && `${currencyA.symbol} / ${currencyB.symbol}`

    const { isLoading: isPluginsLoading, dynamicFeePlugin, limitOrderPlugin, farmingPlugin } = usePoolPlugins(poolAddress)

    return <div className="flex flex-col w-full gap-2 py-2 px-4 bg-card rounded-3xl border border-card-border">

        <div className="text-sm font-bold text-left relative -mt-4 bg-[#771bff] w-fit px-2 rounded-lg">INTEGRAL POOLS</div>

        <div className="flex items-center justify-between">

            <Popover>
                <PopoverTrigger className="flex items-center gap-4 w-fit py-2 px-4 rounded-2xl  border-card-border hover:bg-card-hover">
                    <div className="flex">
                        <CurrencyLogo currency={currencyA} size={30} />
                        <CurrencyLogo currency={currencyB} size={30} style={{ marginLeft: '-8px' }} />
                    </div>
                    <div className="text-lg font-semibold">{title}</div>
                    <div>
                        <ChevronDownIcon size={20} />
                    </div>
                </PopoverTrigger>

                <PopoverContent className="bg-card rounded-3xl border border-card-border">
                    <IntegralPoolsList poolAddress={poolAddress} />
                </PopoverContent>
            </Popover>

            <div>
                {isPluginsLoading ? <Loader2 className="animate-spin" /> : <div className="flex">
                    {dynamicFeePlugin && <DynamicFeePluginIcon />}
                    {limitOrderPlugin && <LimitOrderPluginIcon />}
                </div>}
            </div>

        </div>
    </div>

}

const IntegralPoolsList = memo(({ poolAddress }: { poolAddress: Address | undefined }) => {

    const { data: pools, loading } = usePoolsListQuery()

    if (loading) return <span className="text-white">Loading...</span>

    return <div className="flex flex-col gap-2">{pools?.pools.filter((pool) => poolAddress?.toLowerCase() !== pool.id.toLowerCase()).map((pool, idx) => <IntegralPoolsListItem key={`integral-pool-item-${idx}`} pool={pool} />)}</div>

})

const IntegralPoolsListItem = memo(({ pool }: { pool: PoolFieldsFragment }) => {

    const { isLoading: isPluginsLoading, dynamicFeePlugin, limitOrderPlugin } = usePoolPlugins(pool.id as Address)

    const { actions: { selectCurrency, typeInput } } = useSwapState()

    const currencyA = useCurrency(pool.token0.id as Address)
    const currencyB = useCurrency(pool.token1.id as Address)

    const selectPool = () => {
        typeInput(SwapField.INPUT, '')
        typeInput(SwapField.OUTPUT, '')
        selectCurrency(SwapField.INPUT, pool.token0.id)
        selectCurrency(SwapField.OUTPUT, pool.token1.id)
    }

    return <div className="flex items-center gap-4 min-h-[40px] text-white px-2 py-1 rounded-2xl cursor-pointer hover:bg-card-hover" onClick={selectPool}>
        <div className="flex">
            <CurrencyLogo currency={currencyA} size={25} />
            <CurrencyLogo currency={currencyB} size={25} style={{marginLeft: '-8px'}} />
        </div>
        <div className="font-semibold">{`${pool.token0.symbol} / ${pool.token1.symbol}`}</div>
        <div className="ml-auto">
            {isPluginsLoading ? <Loader2 className="animate-spin" size={16} /> : <div className="flex">
                {dynamicFeePlugin && <DynamicFeePluginIcon />}
                {limitOrderPlugin && <LimitOrderPluginIcon />}
            </div>}
        </div>
    </div>
})

const DynamicFeePluginIcon = () => <HoverCard>
    <HoverCardTrigger>
        <div className="text-sm h-fit p-2">
            <ZapIcon size={16} fill={'#d84eff'} stroke={'#d84eff'} />
        </div>
    </HoverCardTrigger>
    <HoverCardContent className="flex flex-col gap-2 bg-card rounded-3xl border border-card-border text-white w-fit">
        <div className="flex items-center">
            <DynamicFeePluginIcon />
            <span className="font-bold">Dynamic Fees</span>
        </div>
        <div className="text-left">This pool uses <b>Dynamic Fees</b> plugin</div>
        <a className="w-fit text-left text-cyan-300 hover:underline" href={'https://cryptoalgebra.gitbook.io/algebra-integral/core-logic/plugins'} target={'_blank'}>
            Learn more →
        </a>
    </HoverCardContent>
</HoverCard>

const LimitOrderPluginIcon = () => <HoverCard>
    <HoverCardTrigger>
        <div className="text-sm h-fit p-2">
            <TrendingUpIcon size={16} stroke={'#29ff69'} />
        </div>
    </HoverCardTrigger>
    <HoverCardContent className="flex flex-col gap-2 bg-card rounded-3xl border border-card-border text-white w-fit">
        <div className="flex items-center">
            <LimitOrderPluginIcon />
            <span className="font-bold">Limit Orders</span>
        </div>
        <div className="text-left">This pool uses <b>Limit Orders</b> plugin</div>
        <a className="w-fit text-left text-cyan-300 hover:underline" href={'https://cryptoalgebra.gitbook.io/algebra-integral/core-logic/plugins'} target={'_blank'}>
            Learn more →
        </a>
    </HoverCardContent>
</HoverCard>


export default IntegralPools