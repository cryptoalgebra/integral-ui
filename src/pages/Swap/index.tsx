import SwapPair from '@/components/swap/SwapPair';
import SwapButton from '@/components/swap/SwapButton';
import SwapParams from '@/components/swap/SwapParams';
import PageContainer from '@/components/common/PageContainer';
import PageTitle from '@/components/common/PageTitle';
import PoweredByAlgebra from '@/components/common/PoweredByAlgebra';
import SwapChart from '@/components/swap/SwapChart';

const SwapPage = () => {
    return (
        <PageContainer>
            <PageTitle title={'Swap'} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-0 gap-y-8 w-full lg:gap-8 mt-8 lg:mt-16">
                <div className="flex flex-col gap-2">
                    {/* <IntegralPools /> */}

                    <div className="flex flex-col gap-1 w-full bg-card border border-card-border p-2 rounded-3xl">
                        <SwapPair />
                        <SwapParams />
                        <SwapButton />
                    </div>
                    <PoweredByAlgebra />
                </div>

                <div className="col-span-2">
                  <SwapChart />
                </div>
            </div>
        </PageContainer>
    );
};

export default SwapPage;
