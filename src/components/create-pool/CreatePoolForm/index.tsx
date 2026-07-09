import { Button } from "@/components/ui/button";
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { useEffect, useMemo, useState } from "react";
import { SwapField } from "@/types/swap-field";
import {
    computePoolAddress,
    computeCustomPoolAddress,
    NonfungiblePositionManager,
    ADDRESS_ZERO,
    INITIAL_POOL_FEE,
} from "@cryptoalgebra/integral-sdk";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { useAccount, useChainId } from "wagmi";
import { useDerivedMintInfo, useMintState } from "@/state/mintStore";
import Loader from "@/components/common/Loader";
import { PoolState, usePool } from "@/hooks/pools/usePool";
import Summary from "../Summary";
import SelectPair from "../SelectPair";
import { TOKENS, CUSTOM_POOL_DEPLOYER_TITLES, CUSTOM_POOL_DEPLOYER_ADDRESSES, NONFUNGIBLE_POSITION_MANAGER, enabledModules } from "config";
import { TransactionType } from "@/state/pendingTransactionsStore";
import FixBrokenPool from "../FixBrokenPool";
import { Address } from "viem";
import { useWriteAlgebraCustomPoolEntryPointCreateCustomPool, useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { cn, isDefined } from "@/utils";

type PoolDeployerType = typeof CUSTOM_POOL_DEPLOYER_TITLES[keyof typeof CUSTOM_POOL_DEPLOYER_TITLES];
const POOL_DEPLOYER_OPTIONS = Object.values(CUSTOM_POOL_DEPLOYER_TITLES);

const CreatePoolForm = () => {
    const { address: account } = useAccount();

    const { currencies } = useDerivedSwapInfo();

    const {
        actions: { selectCurrency },
    } = useSwapState();

    const {
        startPriceTypedValue,
        actions: { typeStartPriceInput },
    } = useMintState();

    const chainid = useChainId();

    const [poolDeployer, setPoolDeployer] = useState<PoolDeployerType>(CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC);

    const currencyA = currencies[SwapField.INPUT];
    const currencyB = currencies[SwapField.OUTPUT];

    const areCurrenciesSelected = currencyA && currencyB;

    const isSameToken = areCurrenciesSelected && currencyA.wrapped.equals(currencyB.wrapped);

    const customPoolDeployerAddresses = useMemo(
        () => ({
            [CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC]: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_DYNAMIC[chainid],
            [CUSTOM_POOL_DEPLOYER_TITLES.BASE_03]: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_03[chainid],
            [CUSTOM_POOL_DEPLOYER_TITLES.BASE_1]: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_1[chainid],
            [CUSTOM_POOL_DEPLOYER_TITLES.ALL_INCLUSIVE]: CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainid],
        }),
        [chainid],
    );

    const poolAddress =
        areCurrenciesSelected && !isSameToken
            ? (computePoolAddress({
                  tokenA: currencyA.wrapped,
                  tokenB: currencyB.wrapped,
              }) as Address)
            : undefined;

    const customPoolsAddresses =
        enabledModules.CustomPoolsModule && areCurrenciesSelected && !isSameToken
            ? [
                  CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainid],
                  CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_03[chainid],
                  CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE_1[chainid],
              ]
                  .filter(isDefined)
                  .map(
                      (customPoolDeployer) =>
                          computeCustomPoolAddress({
                              tokenA: currencyA.wrapped,
                              tokenB: currencyB.wrapped,
                              customPoolDeployer,
                          }) as Address,
                  )
            : [];

    const [poolState] = usePool(poolAddress);

    // TODO
    // All Inclusive
    const [poolState0] = usePool(customPoolsAddresses[0]);
    // Base 0.3%
    const [poolState1] = usePool(customPoolsAddresses[1]);
    // Base 1%
    const [poolState2] = usePool(customPoolsAddresses[2]);

    const isPoolExists = poolState === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC;
    const isPool0Exists = poolState0 === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.ALL_INCLUSIVE;
    const isPool1Exists = poolState1 === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_03;
    const isPool2Exists = poolState2 === PoolState.EXISTS && poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_1;

    const isSelectedCustomPoolExists = isPoolExists || isPool0Exists || isPool1Exists || isPool2Exists;

    const mintInfo = useDerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        poolAddress ?? undefined,
        INITIAL_POOL_FEE,
        currencyA ?? undefined,
        undefined,
    );

    const { calldata, value } = useMemo(() => {
        if (!mintInfo?.pool || !customPoolDeployerAddresses[poolDeployer])
            return {
                calldata: undefined,
                value: undefined,
            };

        console.log("expeceted pool", mintInfo.pool, customPoolDeployerAddresses[poolDeployer]);

        return NonfungiblePositionManager.createCallParameters(mintInfo.pool, customPoolDeployerAddresses[poolDeployer]);
    }, [customPoolDeployerAddresses, mintInfo.pool, poolDeployer]);

    const { data: createBasePoolData, writeContract: createBasePool, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const createBasePoolConfig = calldata
        ? {
              address: NONFUNGIBLE_POSITION_MANAGER[chainid],
              args: Array.isArray(calldata) ? ([calldata as Address[]] as const) : ([[calldata] as Address[]] as const),
              value: BigInt(value || 0),
              enabled: Boolean(calldata),
          }
        : null;

    const { isLoading: isBasePoolLoading } = useTransactionAwait(
        createBasePoolData,
        {
            title: "Create Base Pool",
            tokenA: currencyA?.wrapped.address as Address,
            tokenB: currencyB?.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        "/pools",
    );

    const isCustomPoolDeployerReady = account && mintInfo.pool && poolDeployer !== CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC;

    const createCustomPoolConfig =
        isCustomPoolDeployerReady && customPoolDeployerAddresses[poolDeployer]
            ? {
                  address: customPoolDeployerAddresses[poolDeployer],
                  args: [account, mintInfo.pool?.token0.address as Address, mintInfo.pool?.token1.address as Address, "0x0"] as const,
              }
            : undefined;

    const { data: createCustomPoolData, writeContract: createCustomPool } = useWriteAlgebraCustomPoolEntryPointCreateCustomPool();

    const { isLoading: isCustomPoolLoading } = useTransactionAwait(createCustomPoolData, {
        title: "Create Custom Pool",
        tokenA: currencyA?.wrapped.address as Address,
        tokenB: currencyB?.wrapped.address as Address,
        type: TransactionType.POOL,
    });

    const isLoading = isCustomPoolLoading || isBasePoolLoading || isPending || mintInfo.poolState === PoolState.LOADING;
    const isBaseDynamicDeployer = poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC;
    const showSummary = areCurrenciesSelected && !isSameToken && !isSelectedCustomPoolExists;
    const showPluginPicker = enabledModules.CustomPoolsModule;

    useEffect(() => {
        selectCurrency(SwapField.INPUT, undefined);
        selectCurrency(SwapField.OUTPUT, undefined);
        typeStartPriceInput("");

        return () => {
            selectCurrency(SwapField.INPUT, ADDRESS_ZERO);
            selectCurrency(SwapField.OUTPUT, TOKENS[chainid].USDC.address as Address);
            typeStartPriceInput("");
        };
    }, [chainid, selectCurrency, typeStartPriceInput]);

    const handlePoolDeployerChange = (poolDeployer: PoolDeployerType) => {
        setPoolDeployer(poolDeployer);
    };

    const handleCreatePool = () => {
        if (poolDeployer === CUSTOM_POOL_DEPLOYER_TITLES.BASE_DYNAMIC) {
            if (!createBasePool || !createBasePoolConfig) return;
            createBasePool(createBasePoolConfig);
        }
        if (!createCustomPoolConfig) return;
        createCustomPool(createCustomPoolConfig);
    };

    const isDisabled = Boolean(
        isLoading ||
            isSelectedCustomPoolExists ||
            !startPriceTypedValue ||
            !areCurrenciesSelected ||
            isSameToken ||
            isPending ||
            !mintInfo?.pool,
    );

    const primaryActionContent = isLoading ? (
        <Loader />
    ) : isSameToken ? (
        "Select another pair"
    ) : !areCurrenciesSelected ? (
        "Select currencies"
    ) : isSelectedCustomPoolExists ? (
        "Pool already exists"
    ) : !startPriceTypedValue ? (
        "Enter initial price"
    ) : (
        "Create Pool"
    );

    return (
        <div className="relative overflow-hidden flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-all duration-300 ease-out hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <SelectPair mintInfo={mintInfo} currencyA={currencyA} currencyB={currencyB} />

            {showPluginPicker ? (
                <div className="rounded-lg border border-border bg-panel px-4 py-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">Plugin</p>

                    <div className="mt-3 grid w-full grid-cols-2 gap-2">
                        {POOL_DEPLOYER_OPTIONS.map((pluginTitle) => (
                            <Button
                                variant={poolDeployer === pluginTitle ? "ghostActive" : "outline"}
                                key={pluginTitle}
                                onClick={() => handlePoolDeployerChange(pluginTitle)}
                                className={cn(
                                    "min-h-10 justify-start rounded-md px-3 py-2 text-left normal-case tracking-normal whitespace-normal",
                                )}
                            >
                                {pluginTitle}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="flex flex-col gap-2">
                <Button variant={"primary"} className="h-11 rounded-md" disabled={isDisabled} onClick={handleCreatePool}>
                    {primaryActionContent}
                </Button>

                {!isBaseDynamicDeployer && (
                    <Button
                        variant={"outline"}
                        disabled={isDisabled}
                        onClick={() => createBasePoolConfig && createBasePool(createBasePoolConfig)}
                        className="h-11 rounded-md"
                    >
                        {isCustomPoolLoading ? <Loader /> : "Initialize"}
                    </Button>
                )}
            </div>
            {showSummary && <Summary currencyA={currencyA} currencyB={currencyB} />}

            <FixBrokenPool currencyIn={currencyA} currencyOut={currencyB} deployer={customPoolDeployerAddresses[poolDeployer]} />
        </div>
    );
};

export default CreatePoolForm;
