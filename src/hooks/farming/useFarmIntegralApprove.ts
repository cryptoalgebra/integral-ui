import { useAlgebraPositionManagerFarmingApprovals } from '@/generated';
import { ADDRESS_ZERO } from '@cryptoalgebra/integral-sdk';
import { useEffect, useState } from 'react';

export function useFarmIntegralApprove(tokenId: bigint) {
    const [approved, setApproved] = useState<boolean>();

    const { data } = useAlgebraPositionManagerFarmingApprovals({
        args: [tokenId],
    });

    useEffect(() => {
        setApproved(data !== ADDRESS_ZERO);
    }, [tokenId, data]);

    return {
        approved,
        isLoading: approved === undefined,
    };
}
