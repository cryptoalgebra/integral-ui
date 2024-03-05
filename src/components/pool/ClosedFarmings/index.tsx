import React from 'react';
import { EternalFarming } from '@/graphql/generated/graphql';

interface ActiveFarmingProps {
    farmings: EternalFarming[];
}

const ClosedFarmings = ({ farmings }: ActiveFarmingProps) => {
    return (
        <div className="flex flex-col w-1/2 h-64 border border-white p-12">
            Closed Farmings
            <ul>
                {farmings &&
                    farmings.length > 0 &&
                    farmings.map((farm) => (
                        <li key={farm.id}>{farm.id.slice(0, 12)}</li>
                    ))}
            </ul>
        </div>
    );
};

export default ClosedFarmings;
