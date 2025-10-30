import PageContainer from "@/components/common/PageContainer";
import MyPositions from "@/components/pool/MyPositions";
import PoolHeader from "@/components/pool/PoolHeader";
import PositionCard from "@/components/position/PositionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePool } from "@/hooks/pools/usePool";
import { usePositions } from "@/hooks/positions/usePositions";
import { FormattedPosition } from "@/types/formatted-position";
import { getPositionAPR } from "@/utils/positions/getPositionAPR";
import { getPositionFees } from "@/utils/positions/getPositionFees";
import { formatAmount } from "@/utils/common/formatAmount";
import { CurrencyAmount, ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { MoveRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import JSBI from "jsbi";
import { Address, parseUnits } from "viem";
import ALMModule from "@/modules/ALMModule";
import FarmingModule from "@/modules/FarmingModule";
import { createUncheckedPosition } from "@/utils/positions/createUncheckedPosition";
import MyPositionsToolbar from "@/components/pool/MyPositionsToolbar";
import { useAppKit } from "@reown/appkit/react";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import useSWR from "swr";
import { Deposit, useSinglePositionLazyQuery } from "@/graphql/generated/graphql";

const { ALMPositionCard } = ALMModule.components;
const { useUserALMVaultsByPool } = ALMModule.hooks;

const { ActiveFarming, UnclaimedRewards } = FarmingModule.components;
const { useActiveFarming, useClosedFarmings, useUnclaimedRewards } = FarmingModule.hooks;

const PoolPage = () => {
    const { address: account } = useAccount();

    const { pool: poolId } = useParams() as { pool: Address };

    const [, poolEntity] = usePool(poolId);

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
    }, [positions, poolEntity, poolId]);

    const { data: positionsFees, isLoading: positionsFeesLoading } = useSWR(
        ["positionsFees", filteredPositions, account],
        () => {
            if (!account) return [];

            return Promise.all(
                filteredPositions.map(({ positionId, position }) => {
                    if (JSBI.equal(position.liquidity, ZERO))
                        return [
                            CurrencyAmount.fromRawAmount(position.pool.token0, "0"),
                            CurrencyAmount.fromRawAmount(position.pool.token1, "0"),
                        ];

                    return getPositionFees(position.pool, positionId, account);
                })
            );
        },
        {
            refreshInterval: 10000,
            keepPreviousData: true,
        }
    );

    const [getSinglePosition] = useSinglePositionLazyQuery();
    const { data: positionsAPRs, isLoading: positionsAPRsLoading } = useSWR(
        ["positionsAPRs", filteredPositions, positionsFees, token0PriceUSD, token1PriceUSD],
        async () => {
            if (!filteredPositions || !positionsFees) return [];

            const positionsAPRs = await Promise.all(
                filteredPositions.map(async ({ positionId, position }, idx) => {
                    if (JSBI.equal(position.liquidity, ZERO)) return 0;

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
                        new Date(Number(singlePosition.transaction.timestamp) * 1000).getTime()
                    );
                })
            );

            return positionsAPRs;
        }
    );

    const positionsData = useMemo(() => {
        if (!filteredPositions || !poolEntity || !positionsFees || !positionsAPRs) return [];

        const positionsData = filteredPositions.map(({ positionId, position }, idx) => {
            const currentPositionInFarming = deposits?.deposits?.find((deposit) => Number(deposit.id) === Number(positionId));
            const range = `${formatAmount(position.token0PriceLower.toFixed(6), 6)} — ${formatAmount(
                position.token0PriceUpper.toFixed(6),
                6
            )}`;
            const rangeLength = Number(position.tickUpper) - Number(position.tickLower);

            const amount0USD = Number(position.amount0.toSignificant(24)) * token0PriceUSD;
            const amount1USD = Number(position.amount1.toSignificant(24)) * token1PriceUSD;
            const liquidityUSD = amount0USD + amount1USD;

            const fees0USD = Number(positionsFees[idx][0].toSignificant()) * token0PriceUSD;
            const fees1USD = Number(positionsFees[idx][1].toSignificant()) * token1PriceUSD;
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
                    } as FormattedPosition)
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
            <PoolHeader />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-3 md:gap-3 w-full mt-3">
                <div className="col-span-2">
                    <MyPositionsToolbar
                        currencyA={poolEntity && unwrappedToken(poolEntity.token0)}
                        currencyB={poolEntity && unwrappedToken(poolEntity.token1)}
                        positionsData={positionsData}
                    />
                    {!account ? (
                        <NoAccount />
                    ) : isLoading ? (
                        <LoadingState />
                    ) : noPositions ? (
                        <NoPositions poolId={poolId} />
                    ) : (
                        <>
                            <MyPositions
                                positions={positionsData}
                                poolId={poolId}
                                selectedPosition={selectedPosition?.id}
                                selectPosition={(position) => setSelectedPosition(position)}
                            />
                            {unclaimedRewards && Boolean(unclaimedRewards?.rewards?.length) && (
                                <UnclaimedRewards unclaimedRewards={unclaimedRewards && unclaimedRewards.rewards} />
                            )}
                        </>
                    )}
                    {farmingInfo && !isFarmingLoading && !areDepositsLoading && (
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
                    />
                    <ALMPositionCard
                        farming={farmingInfo}
                        poolAddress={poolId}
                        userVault={userVaults?.find(
                            (v) => v.vault.id === selectedPosition?.almVaultAddress && v.shares === selectedPosition?.almShares
                        )}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

const NoPositions = ({ poolId }: { poolId: Address }) => (
    <div className="flex flex-col items-start gap-4 p-6 bg-card border border-card-border rounded-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-left">You don't have positions for this pool</h2>
        <p className="text-md font-semibold">Let's create one!</p>
        <Button variant={"primary"} className="gap-2" asChild>
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
            <Button variant={"primary"} size={"lg"} onClick={() => open()}>
                Connect Wallet
            </Button>
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
