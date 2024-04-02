import { Button } from '@/components/ui/button';
import { FormattedPosition } from '@/types/formatted-position';
import { formatPlural } from '@/utils/common/formatPlural';
import { formatUSD } from '@/utils/common/formatUSD';
import { Link } from 'react-router-dom';
import { Address } from 'viem';
import FilterPopover from '../FilterPopover';
import { SlidersHorizontal } from 'lucide-react';

interface MyPositionsToolbar {
    positionsData: FormattedPosition[];
    poolId: Address;
}

const MyPositionsToolbar = ({ positionsData, poolId }: MyPositionsToolbar) => {
    const [myLiquidityUSD, myFeesUSD] = positionsData
        ? positionsData.reduce(
              (acc, { liquidityUSD, feesUSD }) => [
                  acc[0] + liquidityUSD,
                  acc[1] + feesUSD,
              ],
              [0, 0]
          )
        : [];

    return (
        <div className="flex flex-col md:flex-row items-center justify-between w-full mb-6">
            <div className="flex items-center gap-4 flex-wrap">
                <h3 className="font-semibold text-xl text-left">
                    My Positions
                </h3>
                <div className="self-center w-[1px] h-[20px] border border-card-border/40"></div>
                <div className="text-gray-300 font-semibold">{`${
                    positionsData?.length
                } ${formatPlural(
                    positionsData.length,
                    'position',
                    'positions'
                )}`}</div>
                <div className="self-center w-[1px] h-[20px] border border-card-border/40"></div>
                <div className="text-cyan-300 font-semibold">{`${formatUSD.format(
                    myLiquidityUSD || 0
                )} TVL`}</div>
                <div className="self-center w-[1px] h-[20px] border border-card-border/40"></div>
                <div className="text-green-300 font-semibold">{`${formatUSD.format(
                    myFeesUSD || 0
                )} Fees`}</div>
            </div>
            <div className="flex w-full md:w-fit mt-4 md:mt-0 gap-4">
                <FilterPopover>
                    <SlidersHorizontal size={20} />
                </FilterPopover>
                <Button size={'md'} className="font-semibold" asChild>
                    <Link to={`/pool/${poolId}/new-position`}>
                        Create Position
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default MyPositionsToolbar;
