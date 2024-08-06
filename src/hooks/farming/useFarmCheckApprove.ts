import { useAlgebraPositionManagerFarmingApprovals } from '@/generated';
import { ADDRESS_ZERO } from '@cryptoalgebra/circuit-sdk';
import { useEffect, useState } from 'react';

export function useFarmCheckApprove(tokenId: bigint) {
    const [approved, setApproved] = useState<boolean>();

    const {
        data,
        isLoading: isApproveLoading,
        refetch,
    } = useAlgebraPositionManagerFarmingApprovals({
        args: [tokenId],
    });

    useEffect(() => {
        setApproved(data !== ADDRESS_ZERO);
    }, [tokenId, data]);

    return {
        approved,
        handleCheckApprove: refetch,
        isLoading: approved === undefined || isApproveLoading,
    };
}
