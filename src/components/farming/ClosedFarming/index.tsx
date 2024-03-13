import { EternalFarming } from '@/graphql/generated/graphql';
import React from 'react';

export interface ClosedFarmingProps {
    farming: EternalFarming;
}

const ClosedFarming = React.memo(({ farming }: ClosedFarmingProps) => {
    console.log(farming);
    return <div>ClosedFarming</div>;
});

export default ClosedFarming;
