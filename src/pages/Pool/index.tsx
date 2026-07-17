import PageContainer from "@/components/common/PageContainer";
import MyPositions from "@/components/pool/MyPositions";
import PoolHeader from "@/components/pool/PoolHeader";
import PositionCard from "@/components/position/PositionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePool, SecurityState } from "@/hooks/pools/usePool";
import { usePoolStats } from "@/hooks/pools/usePoolStats";
import { usePositions } from "@/hooks/positions/usePositions";
import { FormattedPosition } from "@/types/formatted-position";
import { getPositionAPR } from "@/utils/positions/getPositionAPR";
import { getPositionFees } from "@/utils/positions/getPositionFees";
import { formatAmount } from "@/utils/common/formatAmount";
import { CurrencyAmount, Position, ZERO } from "@cryptoalgebra/integral-sdk";
import { MoveRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import JSBI from "jsbi";
import { Address, parseUnits } from "viem";
import ALMModule from "@/modules/ALMModule";
import NAVHookModule from "@/modules/NAVHookModule";
import FarmingModule from "@/modules/FarmingModule";
import MyPositionsToolbar from "@/components/pool/MyPositionsToolbar";
import { useAppKit } from "@reown/appkit/react";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import useSWR from "swr";
import { Deposit, useSinglePositionLazyQuery } from "@/graphql/generated/graphql";
import { useReadSecurityRegistryGlobalStatus } from "@/generated";
import { enabledModules } from "config";
import KYCModule from "@/modules/KYCModule";

const { ALMPositionCard } = ALMModule.components;
const { useUserALMVaultsByPool } = ALMModule.hooks;

const { NAVHookPoolLayout } = NAVHookModule.components;
const { useNAVHookPool } = NAVHookModule.hooks;

const { ActiveFarming, UnclaimedRewards } = FarmingModule.components;
const { useActiveFarming, useClosedFarmings, useUnclaimedRewards } = FarmingModule.hooks;
const { KycPoolInfo } = KYCModule.components;

const PoolPage = () => {
    const { address: account } = useAccount();

    const { pool: poolId } = useParams() as { pool: Address };

    const [, poolEntity, poolSecurityStatus] = usePool(poolId);

    const { formatted: token0PriceUSD } = useUSDCPrice(poolEntity?.token0);
    const { formatted: token1PriceUSD } = useUSDCPrice(poolEntity?.token1);

    const { positions, loading: positionsLoading } = usePositions();

    const { userVaults, isLoading: areUserVaultsLoading } = useUserALMVaultsByPool(poolId, account);

    const { farmingInfo, deposits, isFarmingLoading, areDepositsLoading } = useActiveFarming({
        poolId: poolId,
    });

    const { closedFarmings } = useClosedFarmings({
        poolId: poolId,
    });

    const { unclaimedRewards } = useUnclaimedRewards();

    const { data: globalStatus } = useReadSecurityRegistryGlobalStatus();

    const effectiveStatus = globalStatus !== SecurityState.ENABLED ? globalStatus : poolSecurityStatus;

    const poolStats = usePoolStats(poolId);
    const { isNAVHookPool } = useNAVHookPool(poolId);
    const showNAVHookPool = enabledModules.NAVHookModule && isNAVHookPool;

    const filteredPositions = useMemo(() => {
        if (!positions || !poolEntity) return [];

        return positions
            .filter(({ pool }) => pool.toLowerCase() === poolId.toLowerCase())
            .map((position) => ({
                positionId: position.tokenId,
                position: Position.fromExistingPosition({
                    pool: poolEntity,
                    liquidity: position.liquidity.toString(),
                    tickLower: Number(position.tickLower),
                    tickUpper: Number(position.tickUpper),
                }),
            }));
    }, [positions, poolEntity, poolId]);

    const { data: positionsFees, isLoading: positionsFeesLoading } = useSWR(
        ["positionsFees", filteredPositions, account, effectiveStatus],
        () => {
            if (!account) return [];

            return Promise.all(
                filteredPositions.map(({ positionId, position }) => {
                    if (JSBI.equal(position.liquidity, ZERO) || effectiveStatus !== SecurityState.ENABLED)
                        return [
                            CurrencyAmount.fromRawAmount(position.pool.token0, "0"),
                            CurrencyAmount.fromRawAmount(position.pool.token1, "0"),
                        ];

                    return getPositionFees(position.pool, positionId, account);
                }),
            );
        },
        {
            refreshInterval: 10000,
            keepPreviousData: true,
        },
    );

    const [getSinglePosition] = useSinglePositionLazyQuery();
    const { data: positionsAPRs, isLoading: positionsAPRsLoading } = useSWR(
        ["positionsAPRs", filteredPositions, positionsFees, token0PriceUSD, token1PriceUSD, effectiveStatus],
        async () => {
            if (!filteredPositions || !positionsFees) return [];

            const positionsAPRs = await Promise.all(
                filteredPositions.map(async ({ positionId, position }, idx) => {
                    if (JSBI.equal(position.liquidity, ZERO) || effectiveStatus !== SecurityState.ENABLED) return 0;

                    const result = await getSinglePosition({ variables: { tokenId: positionId.toString() } });
                    const singlePosition = result?.data?.position;
                    if (!singlePosition) return 0;

                    const { token0, token1 } = position.pool;
                    const { collectedFeesToken0, collectedFeesToken1 } = singlePosition;

                    return getPositionAPR(
                        position.amount0,
                        position.amount1,
                        positionsFees[idx][0],
                        positionsFees[idx][1],
                        CurrencyAmount.fromRawAmount(token0, parseUnits(collectedFeesToken0, token0.decimals).toString()),
                        CurrencyAmount.fromRawAmount(token1, parseUnits(collectedFeesToken1, token1.decimals).toString()),
                        position.pool.token0Price,
                        new Date(Number(singlePosition.transaction.timestamp) * 1000).getTime(),
                    );
                }),
            );

            return positionsAPRs;
        },
        {
            keepPreviousData: true,
        },
    );

    const positionsData = useMemo(() => {
        if (!filteredPositions || !poolEntity || !positionsFees || !positionsAPRs) return [];

        const positionsData = filteredPositions.map(({ positionId, position }, idx) => {
            const currentPositionInFarming = deposits?.deposits?.find((deposit) => Number(deposit.id) === Number(positionId));
            const range = `${formatAmount(position.token0PriceLower.toFixed(6), 6)} — ${formatAmount(
                position.token0PriceUpper.toFixed(6),
                6,
            )}`;
            const rangeLength = Number(position.tickUpper) - Number(position.tickLower);

            const amount0USD = Number(position.amount0.toSignificant(24)) * token0PriceUSD;
            const amount1USD = Number(position.amount1.toSignificant(24)) * token1PriceUSD;
            const liquidityUSD = amount0USD + amount1USD;

            const fees0USD = Number(positionsFees[idx]?.[0].toSignificant()) * token0PriceUSD;
            const fees1USD = Number(positionsFees[idx]?.[1].toSignificant()) * token1PriceUSD;
            const feesUSD = fees0USD + fees1USD;

            const apr = positionsAPRs[idx];

            return {
                id: positionId.toString(),
                isClosed: JSBI.EQ(position.liquidity, ZERO),
                outOfRange: poolEntity.tickCurrent < position.tickLower || poolEntity.tickCurrent > position.tickUpper,
                range,
                liquidityUSD,
                feesUSD,
                apr,
                onFarming: Boolean(currentPositionInFarming?.eternalFarming),
                rangeLength,
                position,
                isALM: false,
                almShares: null,
                almVaultAddress: null,
            } as FormattedPosition;
        });

        const almPositionsData =
            userVaults?.map(
                (vault) =>
                    ({
                        id: `${vault.vault.name}${vault.onFarming ? "-F" : ""}`,
                        isALM: true,
                        isClosed: false,
                        outOfRange: false,
                        range: "ALM Managed",
                        liquidityUSD: vault.amountsUsd,
                        feesUSD: null,
                        apr: Math.abs(vault.vault.apr),
                        onFarming: vault.onFarming,
                        rangeLength: 0,
                        position: null,
                        almShares: vault.shares,
                        almVaultAddress: vault.vault.id,
                    } as FormattedPosition),
            ) || [];

        return [...almPositionsData, ...positionsData];
    }, [filteredPositions, poolEntity, positionsFees, positionsAPRs, userVaults, deposits?.deposits, token0PriceUSD, token1PriceUSD]);

    const [selectedPosition, setSelectedPosition] = useState<FormattedPosition | null>(null);

    const noPositions = positionsData.length === 0 && (userVaults?.length === 0 || !userVaults) && poolEntity;

    const isLoading =
        (positionsLoading ||
            isFarmingLoading ||
            areDepositsLoading ||
            areUserVaultsLoading ||
            positionsFeesLoading ||
            positionsAPRsLoading) &&
        noPositions;

    return (
        <PageContainer>
            <PoolHeader
                currencyA={poolEntity && unwrappedToken(poolEntity.token0)}
                currencyB={poolEntity && unwrappedToken(poolEntity.token1)}
                poolId={poolId}
                poolStatus={effectiveStatus}
                stats={poolStats}
                showCreatePosition={effectiveStatus === SecurityState.ENABLED && !showNAVHookPool}
            />

            {enabledModules.KYCModule && <KycPoolInfo poolAddress={poolId} />}

            {showNAVHookPool ? (
                <NAVHookPoolLayout poolId={poolId} pool={poolEntity} poolStatus={effectiveStatus} poolStats={poolStats} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-3 md:gap-3 w-full">
                    <div className="col-span-2">
                        <MyPositionsToolbar positionsData={positionsData} />
                        {!account ? (
                            <NoAccount />
                        ) : isLoading ? (
                            <LoadingState />
                        ) : noPositions ? (
                            effectiveStatus === SecurityState.ENABLED ? (
                                <NoPositions poolId={poolId} />
                            ) : null
                        ) : (
                            <>
                                <MyPositions
                                    positions={positionsData}
                                    poolId={poolId}
                                    selectedPosition={selectedPosition?.id}
                                    selectPosition={(position) => setSelectedPosition(position)}
                                />
                                {unclaimedRewards &&
                                    Boolean(unclaimedRewards?.rewards?.length) &&
                                    effectiveStatus === SecurityState.ENABLED && (
                                        <UnclaimedRewards unclaimedRewards={unclaimedRewards && unclaimedRewards.rewards} />
                                    )}
                            </>
                        )}
                        {farmingInfo && !isFarmingLoading && !areDepositsLoading && effectiveStatus === SecurityState.ENABLED && (
                            <ActiveFarming
                                deposits={(deposits?.deposits as Deposit[]) || []}
                                farming={farmingInfo}
                                positionsData={positionsData}
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-8 w-full h-full">
                        <PositionCard
                            pool={poolEntity}
                            farming={farmingInfo}
                            closedFarmings={closedFarmings}
                            selectedPosition={selectedPosition?.isALM ? null : selectedPosition}
                            poolStatus={effectiveStatus}
                        />
                        <ALMPositionCard
                            farming={farmingInfo}
                            poolAddress={poolId}
                            userVault={userVaults?.find(
                                (v) => v.vault.id === selectedPosition?.almVaultAddress && v.shares === selectedPosition?.almShares,
                            )}
                            poolStatus={effectiveStatus}
                        />
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

const NoPositions = ({ poolId }: { poolId: Address }) => (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-card-border bg-card/70 p-6 text-center animate-fade-in">
        <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-left">No positions found</h2>
            <p className="text-sm font-semibold text-text-300 text-left">Create a position to start providing liquidity in this pool.</p>
        </div>
        <Button variant="primary" className="gap-2" size="md" asChild>
            <Link to={`/pool/${poolId}/new-position`}>
                Create Position
                <MoveRightIcon size={18} />
            </Link>
        </Button>
    </div>
);

const NoAccount = () => {
    const { open } = useAppKit();

    return (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-card-border bg-card/70 p-6 text-center animate-fade-in">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-left">Connect Wallet</h2>
                <p className="text-sm font-semibold text-text-300 text-left">Connect your account to view or create positions.</p>
            </div>
            <Button variant="primary" size="md" onClick={() => open()}>
                Connect Wallet
            </Button>
        </div>
    );
};

const LoadingState = () => (
    <div className="flex flex-col w-full gap-3 rounded-2xl border border-card-border bg-card/70 p-4">
        {[1, 2, 3, 4].map((v) => (
            <Skeleton key={`position-skeleton-${v}`} className="w-full h-[50px] bg-card-light rounded-xl" />
        ))}
    </div>
);

export default PoolPage;
