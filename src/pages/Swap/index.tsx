import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import AlgebraLogo from '@/assets/algebra-logo.svg'
import AlgebraIntegral from '@/assets/algebra-itegral.svg'

const SwapPage = () => {

    return <PageContainer>

        <PageTitle title={'Swap'} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-0 gap-y-8 w-full lg:gap-8 mt-8 lg:mt-16">

            <div className="flex flex-col gap-2">

                {/* <IntegralPools /> */}

                <div className="flex flex-col gap-1 w-full bg-card border border-card-border p-2 rounded-3xl">
                    <SwapPair />
                    <SwapParams />
                    <SwapButton />
                </div>

                <a href={'https://algebra.finance'} className="flex items-center gap-2 p-2">
                        <span className="text-sm font-semibold">Powered by</span>
                        <div className="flex items-center gap-1">
                            <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full">
                                <img src={AlgebraLogo} width={18} height={18} />
                            </div>
                            <img  src={AlgebraIntegral} width={120} height={18} />
                        </div>
                    </a>

            </div>

            <div className="col-span-2">
                {/* <SwapChart /> */}
            </div>

        </div>

    </PageContainer>

}

export default SwapPage;