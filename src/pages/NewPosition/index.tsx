import PageContainer from "@/components/common/PageContainer"
import RangeSidebar from "@/components/create-position/RangeSidebar"
import LimitOrdersList from "@/components/limit-orders/LimitOrdersList"
import AddLiquidityButton from "@/components/liquidity/AddLiquidityButton"
import EnterAmounts from "@/components/create-position/EnterAmounts"
import RangeSelector from "@/components/create-position/RangeSelector"
import SelectRange from "@/components/liquidity/SelectRange"
import { useAlgebraPoolToken0, useAlgebraPoolToken1 } from "@/generated"
import { useNeedAllowance } from "@/hooks/common/useNeedAllowance"
import { useCurrency } from "@/hooks/common/useCurrency"
import { PoolState, usePool } from "@/hooks/pools/usePool"
import { useMintState, useDerivedMintInfo, useMintActionHandlers } from "@/state/mintStore"
import { Bound, Field, INITIAL_POOL_FEE } from "@cryptoalgebra/integral-sdk"
import { useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Address, useAccount } from "wagmi"
import LiquidityChart from "@/components/create-position/LiquidityChart"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useSwapPools } from "@/hooks/swap/useSwapPools"
import { useInfoTickData } from "@/hooks/pools/usePoolTickData"
import { usePositionAPR } from "@/hooks/positions/usePositionAPR"
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins"
import { Button } from "@/components/ui/button"

type NewPositionPageParams = Record<'pool', Address>

const NewPositionPage = () => {

    const { pool: poolAddress } = useParams<NewPositionPageParams>()

    const { address: account } = useAccount()

    const [poolState, pool] = usePool(poolAddress)

    console.log('Pool tick', pool && pool.tickCurrent)

    const { data: token0 } = useAlgebraPoolToken0({
        address: poolAddress
    })

    const { data: token1 } = useAlgebraPoolToken1({
        address: poolAddress
    })

    const currencyA = useCurrency(token0)
    const currencyB = useCurrency(token1)

    const mintInfo = useDerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        poolAddress,
        INITIAL_POOL_FEE,
        currencyA ?? undefined,
        undefined
    );

    //   const {
    //     onFieldAInput,
    //     onFieldBInput,
    //     onLeftRangeInput,
    //     onRightRangeInput,
    //     onStartPriceInput,
    //   } = useV3MintActionHandlers(mintInfo.noLiquidity);

    const {
        startPriceTypedValue,
        // independentField,
        // typedValue,
        // preset,
        // actions: {
        //   updateSelectedPreset,
        //   setInitialTokenPrice,
        //   updateCurrentStep,
        //   setFullRange,
        // },
    } = useMintState();


    const stepPair = useMemo(() => {
        return Boolean(
            currencyA &&
            currencyB &&
            mintInfo.poolState !== PoolState.INVALID &&
            mintInfo.poolState !== PoolState.LOADING
        );
    }, [currencyA, currencyB, mintInfo]);

    const stepRange = useMemo(() => {
        return Boolean(
            mintInfo.lowerPrice &&
            mintInfo.upperPrice &&
            !mintInfo.invalidRange &&
            account
        );
    }, [mintInfo]);

    const stepAmounts = useMemo(() => {
        if (mintInfo.outOfRange) {
            return Boolean(
                mintInfo.parsedAmounts[Field.CURRENCY_A] ||
                (mintInfo.parsedAmounts[Field.CURRENCY_B] && account)
            );
        }
        return Boolean(
            mintInfo.parsedAmounts[Field.CURRENCY_A] &&
            mintInfo.parsedAmounts[Field.CURRENCY_B] &&
            account
        );
    }, [mintInfo]);

    const stepInitialPrice = useMemo(() => {
        return mintInfo.noLiquidity
            ? Boolean(+startPriceTypedValue && account)
            : false;
    }, [mintInfo, startPriceTypedValue]);

    const needApproveA = useNeedAllowance(
        currencyA,
        mintInfo.parsedAmounts[Field.CURRENCY_B]
    );

    const needApproveB = useNeedAllowance(
        currencyB,
        mintInfo.parsedAmounts[Field.CURRENCY_B]
    );

    const isReady = Boolean(
        (mintInfo.depositADisabled ? true : !needApproveA) &&
        (mintInfo.depositBDisabled ? true : !needApproveB) &&
        !mintInfo.errorMessage &&
        !mintInfo.invalidRange
    );


    const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = mintInfo.pricesAtTicks


    const tokenA = (currencyA ?? undefined)?.wrapped
    const tokenB = (currencyB ?? undefined)?.wrapped

    const isSorted = useMemo(() => {
        return tokenA && tokenB && tokenA.sortsBefore(tokenB)
    }, [tokenA, tokenB, mintInfo])

    const leftPrice = useMemo(() => {
        return isSorted ? priceLower : priceUpper?.invert()
    }, [isSorted, priceLower, priceUpper, mintInfo])

    const rightPrice = useMemo(() => {
        return isSorted ? priceUpper : priceLower?.invert()
    }, [isSorted, priceUpper, priceLower, mintInfo])

    const price = useMemo(() => {
        if (!mintInfo.price) return

        return mintInfo.invertPrice ? mintInfo.price.invert().toSignificant(5) : mintInfo.price.toSignificant(5)
    }, [mintInfo])

    const currentPrice = useMemo(() => {
        if (!mintInfo.price) return;

        if (Number(price) <= 0.0001) {
            return `< 0.0001 ${currencyB?.symbol}`;
        } else {
            return `${price} ${currencyB?.symbol}`;
        }
    }, [mintInfo.price, price]);


    const apr = usePositionAPR(poolAddress, mintInfo.position)

    const pluginList = usePoolPlugins(poolAddress)

    console.log('pluginList', pluginList)


    return <PageContainer>
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-4xl">
            Create Position
        </h1>

        <AddLiquidityButton baseCurrency={currencyA} quoteCurrency={currencyB} mintInfo={mintInfo} />

        <h2 className="my-8 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            1. Select Range
        </h2>

        <div className="grid grid-cols-5 w-full">

            <div className="col-span-4 w-full px-8 py-6 bg-card text-left rounded-l-3xl border border-card-border">

                <div className="flex w-full justify-between">
                    <div>
                    <div className="font-bold text-xs">RANGE</div>
                    <div className="font-bold text-xl">{`${leftPrice?.toSignificant(18)} - ${rightPrice?.toSignificant(18)} ${currencyA?.symbol}`}</div>
                    </div>
                    <div className="text-right">
                    <div className="font-bold text-xs">CURRENT PRICE</div>
                    <div className="font-bold text-xl">{`${currentPrice}`}</div>
                    </div>
                </div>

                <LiquidityChart currencyA={currencyA} currencyB={currencyB} currentPrice={price ? parseFloat(price) : undefined}
                    priceLower={priceLower}
                    priceUpper={priceUpper} />
            </div>

            <div className="bg-[#151722] rounded-r-3xl border-card-border border-y border-r">
                <RangeSidebar
                    currencyA={currencyA}
                    currencyB={currencyB}
                    mintInfo={mintInfo}
                />
            </div>
        </div>

        <div className="flex gap-16 w-full mt-4">

            <div className="flex flex-col items-start w-full">
                <h2 className="my-8 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                    2. Enter amounts
                </h2>
                <Card className="w-full">
                    <CardContent>
                        <EnterAmounts currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} />
                    </CardContent>
                    <CardFooter>
                        Amounts
                    </CardFooter>
                </Card>
            </div>

            <div className="flex flex-col items-start w-full">
                <h2 className="my-8 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                    3. Confirm
                </h2>
                <div className="flex w-full h-[300px] bg-yellow-500 p-4">
                    <Button className="w-full rounded-2xl p-6 mt-auto">Create Position</Button>
                </div>
            </div>
        </div>

        {/* <LimitOrdersList /> */}
    </PageContainer>

    {/* <LimitOrdersList />
        <SelectRange
            currencyA={currencyA}
            currencyB={currencyB}
            mintInfo={mintInfo}
            disabled={!stepPair}
            isCompleted={stepRange}
            additionalStep={stepInitialPrice}
            backStep={stepInitialPrice ? 1 : 0}
        />

        {mintInfo.price && mintInfo.lowerPrice && mintInfo.upperPrice && <EnterAmounts
            currencyA={currencyA ?? undefined}
            currencyB={currencyB ?? undefined}
            mintInfo={mintInfo}
        />}

        <AddLiquidityButton currencyA={currencyA}
            currencyB={currencyB}
            mintInfo={mintInfo}
            isReady={isReady} /> */}

}

export default NewPositionPage