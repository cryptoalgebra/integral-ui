import PageContainer from '@/components/common/PageContainer';
import ActiveFarming from '@/components/farming/ActiveFarming';
import MyPositions from '@/components/pool/MyPositions';
import MyPositionsToolbar from '@/components/pool/MyPositionsToolbar';
import PoolHeader from '@/components/pool/PoolHeader';
import PositionCard from '@/components/position/PositionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useNativePriceQuery,
    usePoolFeeDataQuery,
    useSinglePoolQuery,
} from '@/graphql/generated/graphql';
import { useActiveFarming } from '@/hooks/farming/useActiveFarming';
import { useClosedFarmings } from '@/hooks/farming/useClosedFarmings';
import { usePool } from '@/hooks/pools/usePool';
import { usePositions } from '@/hooks/positions/usePositions';
import { FormattedPosition } from '@/types/formatted-position';
import { getPositionAPR } from '@/utils/positions/getPositionAPR';
import { getPositionFees } from '@/utils/positions/getPositionFees';
import { Position } from '@cryptoalgebra/integral-sdk';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { MoveRightIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Address, useAccount } from 'wagmi';

const PoolPage = () => {
    const { address: account } = useAccount();

    const { pool: poolId } = useParams() as { pool: Address };

    const [selectedPositionId, selectPosition] = useState<number | null>();

    const [, poolEntity] = usePool(poolId);

    const { data: poolInfo } = useSinglePoolQuery({
        variables: {
            poolId,
        },
    });

    const { data: poolFeeData } = usePoolFeeDataQuery({
        variables: {
            poolId,
        },
    });

    const { data: bundles } = useNativePriceQuery();

    const {
        farmingInfo,
        deposits,
        isLoading: isFarmingLoading,
    } = useActiveFarming({
        poolId: poolId,
        poolInfo: poolInfo,
    });

    const { closedFarmings } = useClosedFarmings({
        poolId: poolId,
        poolInfo: poolInfo,
    });

    const [positionsFees, setPositionsFees] = useState<any>();
    const [positionsAPRs, setPositionsAPRs] = useState<any>();

    const { positions, loading: positionsLoading } = usePositions();

    const filteredPositions = useMemo(() => {
        if (!positions || !poolEntity) return [];

        return positions
            .filter(({ pool }) => pool.toLowerCase() === poolId.toLowerCase())
            .map((position) => ({
                positionId: position.tokenId,
                position: new Position({
                    pool: poolEntity,
                    liquidity: position.liquidity.toString(),
                    tickLower: Number(position.tickLower),
                    tickUpper: Number(position.tickUpper),
                }),
            }));
    }, [positions, poolEntity]);

    useEffect(() => {
        async function getPositionsFees() {
            const fees = await Promise.all(
                filteredPositions.map(({ positionId, position }) =>
                    getPositionFees(position.pool, positionId)
                )
            );
            setPositionsFees(fees);
        }

        if (filteredPositions) getPositionsFees();
    }, [filteredPositions]);

    useEffect(() => {
        async function getPositionsAPRs() {
            const nativePrice = bundles?.bundles[0].maticPriceUSD;
            const aprs = await Promise.all(
                filteredPositions.map(({ position }) =>
                    getPositionAPR(
                        poolId,
                        position,
                        poolInfo?.pool,
                        poolFeeData?.poolDayDatas,
                        nativePrice
                    )
                )
            );
            setPositionsAPRs(aprs);
        }

        if (
            filteredPositions &&
            poolInfo?.pool &&
            poolFeeData?.poolDayDatas &&
            bundles?.bundles &&
            poolId
        )
            getPositionsAPRs();
    }, [filteredPositions, poolInfo, poolId, poolFeeData, bundles]);

    // should be reusable
    const formatLiquidityUSD = (position: Position) => {
        if (!poolInfo?.pool) return 0;

        const amount0USD =
            Number(position.amount0.toSignificant()) *
            Number(poolInfo.pool.token1Price);
        const amount1USD =
            Number(position.amount1.toSignificant()) *
            Number(poolInfo.pool.token0Price);

        return amount0USD + amount1USD;
    };

    const formatFeesUSD = (idx: number) => {
        if (!positionsFees || !positionsFees[idx] || !poolInfo?.pool) return 0;

        const fees0USD = positionsFees[idx][0]
            ? Number(positionsFees[idx][0].toSignificant()) *
              Number(poolInfo.pool.token0Price)
            : 0;
        const fees1USD = positionsFees[idx][1]
            ? Number(positionsFees[idx][1].toSignificant()) *
              Number(poolInfo.pool.token1Price)
            : 0;

        return fees0USD + fees1USD;
    };

    const formatAPR = (idx: number) => {
        if (!positionsAPRs || !positionsAPRs[idx]) return 0;
        return positionsAPRs[idx];
    };

    const positionsData = useMemo(() => {
        if (!filteredPositions || !poolEntity || !deposits) return [];

        return filteredPositions.map(({ positionId, position }, idx) => {
            const currentPosition = deposits.deposits.find(
                (deposit) => Number(deposit.id) === Number(positionId)
            );
            return {
                id: positionId,
                outOfRange:
                    poolEntity.tickCurrent < position.tickLower ||
                    poolEntity.tickCurrent > position.tickUpper,
                range: `${position.token0PriceLower.toFixed()} — ${position.token0PriceUpper.toFixed()}`,
                liquidityUSD: formatLiquidityUSD(position),
                feesUSD: formatFeesUSD(idx),
                apr: formatAPR(idx),
                inFarming: currentPosition?.eternalFarming ? true : false,
            } as FormattedPosition;
        });
    }, [
        filteredPositions,
        poolEntity,
        poolInfo,
        positionsFees,
        positionsAPRs,
        deposits,
    ]);

    const selectedPosition = useMemo(() => {
        if (!positionsData || !selectedPositionId) return;

        return positionsData.find(
            ({ id }) => Number(id) === Number(selectedPositionId)
        );
    }, [selectedPositionId, positionsData]);

    const noPositions =
        !positionsLoading && positionsData.length === 0 && poolEntity;

    return (
        <PageContainer>
            <PoolHeader pool={poolEntity} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-0 gap-y-8 w-full lg:gap-8 mt-8 lg:mt-16">
                <div className="col-span-2">
                    {!account ? (
                        <NoAccount />
                    ) : positionsLoading || isFarmingLoading ? (
                        <LoadingState />
                    ) : noPositions ? (
                        <NoPositions poolId={poolId} />
                    ) : (
                        <>
                            <MyPositionsToolbar
                                positionsData={positionsData}
                                poolId={poolId}
                            />
                            <MyPositions
                                positions={positionsData}
                                poolId={poolId}
                                selectedPosition={selectedPosition?.id}
                                selectPosition={(positionId) =>
                                    selectPosition((prev) =>
                                        prev === positionId ? null : positionId
                                    )
                                }
                            />
                            {farmingInfo && deposits && !isFarmingLoading && (
                                <div>
                                    <h2 className="font-semibold text-xl text-left mt-12">
                                        Farmings
                                    </h2>
                                    <ActiveFarming
                                        deposits={deposits && deposits.deposits}
                                        farming={farmingInfo}
                                        positionsData={positionsData}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-8 w-full h-full">
                    <PositionCard
                        farming={farmingInfo}
                        closedFarmings={closedFarmings}
                        selectedPosition={selectedPosition}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

const NoPositions = ({ poolId }: { poolId: Address }) => (
    <div className="flex flex-col items-start p-8 bg-card border border-card-border rounded-3xl animate-fade-in">
        <h2 className="text-2xl font-bold">
            You don't have positions for this pool
        </h2>
        <p className="text-md font-semibold my-4">Let's create one!</p>
        <Button className="gap-2" asChild>
            <Link to={`/pool/${poolId}/new-position`}>
                Create Position
                <MoveRightIcon />
            </Link>
        </Button>
    </div>
);

const NoAccount = () => {
    const { open } = useWeb3Modal();

    return (
        <div className="flex flex-col items-start p-8 bg-card border border-card-border rounded-3xl animate-fade-in">
            <h2 className="text-2xl font-bold">Connect Wallet</h2>
            <p className="text-md font-semibold my-4">
                Connect your account to view or create positions
            </p>
            <Button onClick={() => open()}>Connect Wallet</Button>
        </div>
    );
};

const LoadingState = () => (
    <div className="flex flex-col w-full gap-4 p-4">
        {[1, 2, 3, 4].map((v) => (
            <Skeleton
                key={`position-skeleton-${v}`}
                className="w-full h-[50px] bg-card-light rounded-xl"
            />
        ))}
    </div>
);

export default PoolPage;
