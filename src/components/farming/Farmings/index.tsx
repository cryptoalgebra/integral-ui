import { Deposit } from '@/graphql/generated/graphql';
import { Farming } from '@/types/farming-info';
import { Loader } from 'lucide-react';
import { FormattedPosition } from '@/types/formatted-position';
import ActiveFarming from '../ActiveFarming';

interface FarmingsProps {
    farming: Farming;
    deposits: Deposit[];
    positionsData: FormattedPosition[];
}

const Farmings = ({ farming, deposits, positionsData }: FarmingsProps) => {
    return (
        <div className="flex items-center justify-center min-h-[377px] pb-2 bg-card border border-card-border/60 rounded-3xl mt-8">
            {!farming || !deposits ? (
                <Loader />
            ) : (
                <>
                    <ActiveFarming
                        deposits={deposits}
                        farming={farming}
                        positionsData={positionsData}
                    />
                    {/* <ClosedFarmings farmings={closedFarmings} /> */}
                </>
            )}
        </div>
    );
};

export default Farmings;
