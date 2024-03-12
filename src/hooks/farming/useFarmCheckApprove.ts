import { useAlgebraPositionManagerFarmingApprovals } from '@/generated';
import { ADDRESS_ZERO } from '@cryptoalgebra/integral-sdk';
import { useEffect, useState } from 'react';

export function useFarmCheckApprove(tokenId: bigint) {
    const [approved, setApproved] = useState<boolean>();

    const { data, isLoading: isApproveLoading } =
        useAlgebraPositionManagerFarmingApprovals({
            args: [tokenId],
        });

    useEffect(() => {
        setApproved(data !== ADDRESS_ZERO);
    }, [tokenId]);

    return {
        approved,
        isLoading: approved === undefined || isApproveLoading,
    };
}
