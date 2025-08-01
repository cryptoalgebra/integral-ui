import PageContainer from "@/components/common/PageContainer";
import MyPositions from "@/components/pool/MyPositions";
import PoolHeader from "@/components/pool/PoolHeader";
import PositionCard from "@/components/position/PositionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNativePriceQuery, usePoolFeeDataQuery, useSinglePoolQuery } from "@/graphql/generated/graphql";
import { usePool } from "@/hooks/pools/usePool";
import { usePositions } from "@/hooks/positions/usePositions";
import { FormattedPosition } from "@/types/formatted-position";
import { getPositionAPR } from "@/utils/positions/getPositionAPR";
import { getPositionFees } from "@/utils/positions/getPositionFees";
import { formatAmount } from "@/utils/common/formatAmount";
import { Position, ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { MoveRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import JSBI from "jsbi";
import { useClients } from "@/hooks/graphql/useClients";
import { Address } from "viem";

import ALMModule from "@/modules/ALMModule";
import FarmingModule from "@/modules/FarmingModule";
import { createUncheckedPosition } from "@/utils/positions/createUncheckedPosition";
import MyPositionsToolbar from "@/components/pool/MyPositionsToolbar";
import { useAppKit } from "@reown/appkit/react";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

const { ALMPositionCard } = ALMModule.components;
const { useUserALMVaultsByPool } = ALMModule.hooks;

const { ActiveFarming, UnclaimedRewards } = FarmingModule.components;
const { useActiveFarming, useClosedFarmings, useUnclaimedRewards } = FarmingModule.hooks;

const PoolPage = () => {
    const { address: account } = useAccount();

    const { pool: poolId } = useParams() as { pool: Address };

    const [selectedPositionId, selectPosition] = useState<string | null>();

    const { unclaimedRewards } = useUnclaimedRewards();

    const [, poolEntity] = usePool(poolId);

    const { infoClient } = useClients();
    const { userVaults, isLoading: areUserVaultsLoading } = useUserALMVaultsByPool(poolId, account);

    const { data: poolInfo } = useSinglePoolQuery({
        variables: {
            poolId,
        },
        client: infoClient,
    });

    const { data: poolFeeData } = usePoolFeeDataQuery({
        variables: {
            poolId,
        },
        client: infoClient,
    });

    const { data: bundles } = useNativePriceQuery({ client: infoClient });
    const nativePrice = bundles?.bundles[0].maticPriceUSD;

    const { farmingInfo, deposits, isFarmingLoading, areDepositsLoading } = useActiveFarming({
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
                position: createUncheckedPosition(
                    poolEntity,
                    position.liquidity.toString(),
                    Number(position.tickLower),
                    Number(position.tickUpper)
                ),
            }));
    }, [positions, poolEntity]);

    useEffect(() => {
        async function getPositionsFees() {
            const fees = await Promise.all(filteredPositions.map(({ positionId, position }) => getPositionFees(position.pool, positionId)));
            setPositionsFees(fees);
        }

        if (filteredPositions) getPositionsFees();
    }, [filteredPositions]);

    useEffect(() => {
        async function getPositionsAPRs() {
            const aprs = await Promise.all(
                filteredPositions.map(({ position }) =>
                    getPositionAPR(poolId, position, poolInfo?.pool, poolFeeData?.poolDayDatas, nativePrice)
                )
            );
            setPositionsAPRs(aprs);
        }

        if (filteredPositions && poolInfo?.pool && poolFeeData?.poolDayDatas && bundles?.bundles && poolId) getPositionsAPRs();
    }, [filteredPositions, poolInfo, poolId, poolFeeData, bundles]);

    const formatLiquidityUSD = (position: Position) => {
        if (!poolInfo?.pool) return 0;

        const amount0USD =
            Number(position.amount0.toSignificant()) * (Number(poolInfo.pool.token0.derivedMatic) * (Number(nativePrice) || 0));
        const amount1USD =
            Number(position.amount1.toSignificant()) * (Number(poolInfo.pool.token1.derivedMatic) * (Number(nativePrice) || 0));

        return amount0USD + amount1USD;
    };

    const formatFeesUSD = (idx: number) => {
        if (!positionsFees || !positionsFees[idx] || !poolInfo?.pool) return 0;

        const fees0USD = positionsFees[idx][0]
            ? Number(positionsFees[idx][0].toSignificant()) * (Number(poolInfo.pool.token0.derivedMatic) * Number(nativePrice))
            : 0;
        const fees1USD = positionsFees[idx][1]
            ? Number(positionsFees[idx][1].toSignificant()) * (Number(poolInfo.pool.token1.derivedMatic) * Number(nativePrice))
            : 0;

        return fees0USD + fees1USD;
    };

    const formatAPR = (idx: number) => {
        if (!positionsAPRs || !positionsAPRs[idx]) return 0;
        return positionsAPRs[idx];
    };

    const positionsData = useMemo(() => {
        if (!filteredPositions || !poolEntity) return [];

        const filteredALMPositions =
            userVaults?.map(
                (vault) =>
                    ({
                        id: vault.vault.name,
                        isALM: true,
                        isClosed: false,
                        outOfRange: false,
                        range: "ALM Managed",
                        liquidityUSD: vault.amountsUsd,
                        feesUSD: null,
                        apr: Math.abs(vault.vault.apr),
                        inFarming: false,
                    }) as FormattedPosition
            ) || [];

        const positionsData = filteredPositions.map(({ positionId, position }, idx) => {
            const currentPosition = deposits?.deposits?.find((deposit) => Number(deposit.id) === Number(positionId));
            return {
                id: positionId.toString(),
                isClosed: JSBI.EQ(position.liquidity, ZERO),
                outOfRange: poolEntity.tickCurrent < position.tickLower || poolEntity.tickCurrent > position.tickUpper,
                range: `${formatAmount(position.token0PriceLower.toFixed(6), 6)} — ${formatAmount(
                    position.token0PriceUpper.toFixed(6),
                    6
                )}`,
                liquidityUSD: formatLiquidityUSD(position),
                feesUSD: formatFeesUSD(idx),
                apr: formatAPR(idx),
                inFarming: Boolean(currentPosition?.eternalFarming),
            } as FormattedPosition;
        });

        return [...filteredALMPositions, ...positionsData];
    }, [filteredPositions, poolEntity, poolInfo, positionsFees, positionsAPRs, deposits, userVaults]);

    const selectedPosition = useMemo(() => {
        if (!positionsData || !selectedPositionId) return;

        return positionsData.find(({ id }) => Number(id) === Number(selectedPositionId));
    }, [selectedPositionId, positionsData]);

    const noPositions =
        (!positionsLoading || !isFarmingLoading || !areDepositsLoading || !areUserVaultsLoading) &&
        positionsData.length === 0 &&
        (userVaults?.length === 0 || !userVaults) &&
        poolEntity;

    return (
        <PageContainer>
            <PoolHeader />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 w-full mt-3">
                <div className="col-span-2">
                    <MyPositionsToolbar
                        currencyA={poolEntity && unwrappedToken(poolEntity.token0)}
                        currencyB={poolEntity && unwrappedToken(poolEntity.token1)}
                        positionsData={positionsData}
                    />
                    {!account ? (
                        <NoAccount />
                    ) : positionsLoading || isFarmingLoading || areDepositsLoading || areUserVaultsLoading ? (
                        <LoadingState />
                    ) : noPositions ? (
                        <NoPositions poolId={poolId} />
                    ) : (
                        <>
                            <MyPositions
                                positions={positionsData}
                                poolId={poolId}
                                selectedPosition={selectedPosition?.id}
                                selectPosition={(positionId) => selectPosition((prev) => (prev === positionId ? null : positionId))}
                            />
                            {unclaimedRewards && Boolean(unclaimedRewards?.rewards?.length) && (
                                <UnclaimedRewards unclaimedRewards={unclaimedRewards && unclaimedRewards.rewards} />
                            )}
                        </>
                    )}
                    {farmingInfo && !isFarmingLoading && !areDepositsLoading && (
                        <ActiveFarming deposits={deposits?.deposits || []} farming={farmingInfo} positionsData={positionsData} />
                    )}
                </div>

                <div className="flex flex-col gap-8 w-full h-full">
                    <PositionCard farming={farmingInfo} closedFarmings={closedFarmings} selectedPosition={selectedPosition} />
                    <ALMPositionCard poolAddress={poolId} userVault={userVaults?.find((v) => v.vault.name === selectedPositionId)} />
                </div>
            </div>
        </PageContainer>
    );
};

const NoPositions = ({ poolId }: { poolId: Address }) => (
    <div className="flex flex-col items-start gap-4 p-6 bg-card border border-card-border rounded-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-left">You don't have positions for this pool</h2>
        <p className="text-md font-semibold">Let's create one!</p>
        <Button className="gap-2" asChild>
            <Link to={`/pool/${poolId}/new-position`}>
                Create Position
                <MoveRightIcon />
            </Link>
        </Button>
    </div>
);

const NoAccount = () => {
    const { open } = useAppKit();

    return (
        <div className="flex flex-col items-start p-6 bg-card border border-card-border rounded-xl animate-fade-in">
            <h2 className="text-2xl font-bold">Connect Wallet</h2>
            <p className="text-md font-semibold my-4">Connect your account to view or create positions</p>
            <Button onClick={() => open()}>Connect Wallet</Button>
        </div>
    );
};

const LoadingState = () => (
    <div className="flex flex-col w-full gap-4 p-4 bg-card rounded-xl">
        {[1, 2, 3, 4].map((v) => (
            <Skeleton key={`position-skeleton-${v}`} className="w-full h-[50px] bg-card-light rounded-xl" />
        ))}
    </div>
);

export default PoolPage;
