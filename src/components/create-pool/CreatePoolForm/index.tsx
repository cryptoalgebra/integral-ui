import { Button } from "@/components/ui/button";
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { useEffect, useMemo, useState } from "react";
import { SwapField } from "@/types/swap-field";
import { computePoolAddress, computeCustomPoolAddress, NonfungiblePositionManager, ADDRESS_ZERO, INITIAL_POOL_FEE } from '@cryptoalgebra/custom-pools-sdk'
import {
  usePrepareAlgebraCustomPoolDeployerCreateCustomPool,
  usePrepareAlgebraPositionManagerMulticall,
} from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { Address, useAccount, useContractWrite } from "wagmi";
import { useDerivedMintInfo, useMintState } from "@/state/mintStore";
import Loader from "@/components/common/Loader";
import { PoolState, usePool } from "@/hooks/pools/usePool";
import Summary from "../Summary";
import SelectPair from "../SelectPair";
import { STABLECOINS } from "@/constants/tokens";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { cn } from "@/lib/utils";
import {
  CUSTOM_POOL_DEPLOYER_BLANK,
  CUSTOM_POOL_DEPLOYER_FEE_CHANGER,
  CUSTOM_POOL_DEPLOYER_VOLUME_FEE,
} from "@/constants/addresses";

const POOL_DEPLOYER = {
  BASE: "Base",
  FEE_CHANGER: "Fee Changer",
  BLANK: "Blank",
  VOLUME_FEE: "Volume Fee"
};

type PoolDeployerType = (typeof POOL_DEPLOYER)[keyof typeof POOL_DEPLOYER];

const customPoolDeployerAddresses = {
  [POOL_DEPLOYER.BASE]: ADDRESS_ZERO as Address,
  [POOL_DEPLOYER.BLANK]: CUSTOM_POOL_DEPLOYER_BLANK,
  [POOL_DEPLOYER.FEE_CHANGER]: CUSTOM_POOL_DEPLOYER_FEE_CHANGER,
  [POOL_DEPLOYER.VOLUME_FEE]: CUSTOM_POOL_DEPLOYER_VOLUME_FEE
};

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

  const [poolDeployer, setPoolDeployer] = useState<PoolDeployerType>(
    POOL_DEPLOYER.BASE
  );

  const currencyA = currencies[SwapField.INPUT];
  const currencyB = currencies[SwapField.OUTPUT];

  const areCurrenciesSelected = currencyA && currencyB;

  const isSameToken =
    areCurrenciesSelected && currencyA.wrapped.equals(currencyB.wrapped);

  const poolAddress =
    areCurrenciesSelected && !isSameToken
      ? (computePoolAddress({
          tokenA: currencyA.wrapped,
          tokenB: currencyB.wrapped,
        }) as Address)
      : undefined;

  const customPoolsAddresses = areCurrenciesSelected && !isSameToken ? [CUSTOM_POOL_DEPLOYER_BLANK, CUSTOM_POOL_DEPLOYER_FEE_CHANGER, CUSTOM_POOL_DEPLOYER_VOLUME_FEE].map(customPoolDeployer => computeCustomPoolAddress({
    tokenA: currencyA.wrapped,
    tokenB: currencyB.wrapped,
    customPoolDeployer
  }) as Address) : []

  const [poolState] = usePool(poolAddress);

  // TODO
  const [poolState0] = usePool(customPoolsAddresses[0])
  const [poolState1] = usePool(customPoolsAddresses[1])
  const [poolState2] = usePool(customPoolsAddresses[2])

  const isPoolExists = poolState === PoolState.EXISTS && poolDeployer === POOL_DEPLOYER.BASE;
  const isPool0Exists = poolState0 === PoolState.EXISTS && poolDeployer === POOL_DEPLOYER.BLANK;
  const isPool1Exists = poolState1 === PoolState.EXISTS && poolDeployer === POOL_DEPLOYER.FEE_CHANGER;
  const isPool2Exists = poolState2 === PoolState.EXISTS && poolDeployer === POOL_DEPLOYER.VOLUME_FEE;

  const isSelectedCustomPoolExists = isPoolExists || isPool0Exists || isPool1Exists || isPool2Exists

  const mintInfo = useDerivedMintInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
    poolAddress ?? undefined,
    INITIAL_POOL_FEE,
    currencyA ?? undefined,
    undefined
  );

  const { calldata, value } = useMemo(() => {
    if (!mintInfo?.pool)
      return {
        calldata: undefined,
        value: undefined,
      };

    return NonfungiblePositionManager.createCallParameters(mintInfo.pool, customPoolDeployerAddresses[poolDeployer]);
  }, [mintInfo?.pool, poolDeployer]);

  const { config: createBasePoolConfig } =
    usePrepareAlgebraPositionManagerMulticall({
      args: Array.isArray(calldata)
        ? [calldata as Address[]]
        : [[calldata] as Address[]],
      value: BigInt(value || 0),
      enabled: Boolean(calldata),
    });

  const { data: createBasePoolData, write: createBasePool } =
    useContractWrite(createBasePoolConfig);

  const { isLoading: isBasePoolLoading } = useTransactionAwait(
    createBasePoolData?.hash,
    {
      title: "Create Base Pool",
      tokenA: currencyA?.wrapped.address as Address,
      tokenB: currencyB?.wrapped.address as Address,
      type: TransactionType.POOL,
    },
    "/pools"
  );

  const isCustomPoolDeployerReady =
    account && mintInfo.pool && poolDeployer !== POOL_DEPLOYER.BASE;

  const { config: createCustomPoolConfig } =
    usePrepareAlgebraCustomPoolDeployerCreateCustomPool({
      address: isCustomPoolDeployerReady ? customPoolDeployerAddresses[poolDeployer] : undefined,
      args: isCustomPoolDeployerReady
        ? [
            customPoolDeployerAddresses[poolDeployer],
            account,
            mintInfo.pool?.token0.address as Address,
            mintInfo.pool?.token1.address as Address,
            "0x0",
          ]
        : undefined,
      enabled: Boolean(isCustomPoolDeployerReady),
    });

  const { data: createCustomPoolData, write: createCustomPool } =
    useContractWrite(createCustomPoolConfig);

  const { isLoading: isCustomPoolLoading } = useTransactionAwait(
    createCustomPoolData?.hash,
    {
      title: "Create Custom Pool",
      tokenA: currencyA?.wrapped.address as Address,
      tokenB: currencyB?.wrapped.address as Address,
      type: TransactionType.POOL,
    },
    "/pools"
  );

  const isLoading = isCustomPoolLoading || isBasePoolLoading;

  useEffect(() => {
    selectCurrency(SwapField.INPUT, undefined);
    selectCurrency(SwapField.OUTPUT, undefined);
    typeStartPriceInput("");

    return () => {
      selectCurrency(SwapField.INPUT, ADDRESS_ZERO);
      selectCurrency(SwapField.OUTPUT, STABLECOINS.USDT.address as Account);
      typeStartPriceInput("");
    };
  }, []);

  const handlePoolDeployerChange = (poolDeployer: PoolDeployerType) => {
    setPoolDeployer(poolDeployer);
  };

  const handleCreatePool = () => {
    if (poolDeployer === POOL_DEPLOYER.BASE) {
      if (!createBasePool) return;
      createBasePool();
    }
    if (!createCustomPool) return;
    createCustomPool();
  };

  const isDisabled = Boolean(
    isLoading ||
    isSelectedCustomPoolExists ||
      !startPriceTypedValue ||
      !areCurrenciesSelected ||
      isSameToken
  );

  return (
    <div className="flex flex-col gap-1 p-2 bg-card border border-card-border rounded-3xl">
      <h2 className="font-semibold text-xl text-left ml-2 mt-2">Select Pair</h2>
      <SelectPair
        mintInfo={mintInfo}
        currencyA={currencyA}
        currencyB={currencyB}
      />

      {areCurrenciesSelected && !isSameToken && !isSelectedCustomPoolExists && (
        <Summary currencyA={currencyA} currencyB={currencyB} />
      )}

      <div className="text-left font-bold">
        <div>Plugin</div>
        <div className="grid grid-cols-2 w-100 gap-4 my-2">
          {Object.entries(POOL_DEPLOYER).map(([, v]) => (
            <button
              key={v}
              onClick={() => handlePoolDeployerChange(v)}
              className={cn(
                "px-3 py-2 rounded-lg border",
                poolDeployer === v ? "border-blue-500" : "border-gray-600"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <Button className="mt-2" disabled={isDisabled} onClick={handleCreatePool}>
        {isLoading ? (
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
        )}
      </Button>

      {poolDeployer !== POOL_DEPLOYER.BASE && (
        <Button
          disabled={isDisabled}
          onClick={() => createBasePool && createBasePool()}
          className="mt-2"
        >
          { isBasePoolLoading ? <Loader /> : 'Initialize' }
        </Button>
      )}
    </div>
  );
};

export default CreatePoolForm;
