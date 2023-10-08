import { Button } from "@/components/ui/button";
import { useAlgebraLimitOrderPluginPlace, useAlgebraPositionManagerMulticall } from "@/generated";
import { IDerivedMintInfo } from "@/state/mintStore";
import { Currency, NonfungiblePositionManager, Percent } from "@cryptoalgebra/integral-sdk";
import { useEffect, useMemo } from "react";
import { Address, useAccount, useWaitForTransaction } from "wagmi";


interface AddLiquidityButtonProps {
  baseCurrency: Currency | undefined | null;
  quoteCurrency: Currency | undefined | null;
  mintInfo: IDerivedMintInfo;
}

const ZERO_PERCENT = new Percent('0');
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export const AddLiquidityButton = ({
  baseCurrency,
  quoteCurrency,
  mintInfo,
}: AddLiquidityButtonProps) => {
  const { address: account } = useAccount();

//   const { txDeadline } = useSwapStore();

  const useNative = baseCurrency?.isNative
    ? baseCurrency
    : quoteCurrency?.isNative
    ? quoteCurrency
    : undefined;

  const { calldata, value } = useMemo(() => {
    if (!mintInfo.position || !account)
      return { calldata: undefined, value: undefined };

    return NonfungiblePositionManager.addCallParameters(mintInfo.position, {
      slippageTolerance: mintInfo.outOfRange
        ? ZERO_PERCENT
        : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
      recipient: account,
      deadline: Date.now() + 300,
      useNative,
      createPool: mintInfo.noLiquidity,
    });
  }, [mintInfo, account]);


  const isReadyLimit = baseCurrency && quoteCurrency && mintInfo.positionLO

  const { data: addLimitOrderData, write: placeOrder } = useAlgebraLimitOrderPluginPlace({
    args: isReadyLimit && mintInfo.positionLO ? [
        {
            token0: baseCurrency.wrapped.address as Address,
            token1: quoteCurrency.wrapped.address as Address
        },
        mintInfo.positionLO.tickLower,
        true,
        BigInt(mintInfo.positionLO.liquidity.toString())
    ] : undefined
  })
  

  const { data: addLiquidityData, write: addLiquidity } = useAlgebraPositionManagerMulticall({
      args: calldata && [calldata as `0x${string}`[]],
      value: BigInt(value || 0),
      onSuccess() {
        // generateToast(
        //   'Transaction sent',
        //   'Your transaction has been submitted to the network',
        //   'loading'
        // );
      },
      onError(error) {
        // generateToast(
        //   'Error meanwhile waiting for transaction',
        //   error.message,
        //   'error'
        // );
      },
    });

  const { data: waitForProviding, isLoading: isProvidingLoading } =
    useWaitForTransaction({
      hash: addLiquidityData?.hash,
    });

  useEffect(() => {
    if (waitForProviding && waitForProviding.status === 'success') {
    //   generateToast(
    //     'New Position added',
    //     'New Position added succefully',
    //     'success',
    //     waitForProviding.transactionHash
    //   );
    }
  }, [waitForProviding]);

  return (
    <Button
    //   disabled={isProvidingLoading || !isReady}
    //   onClick={() => addLiquidity()}>
      onClick={() => placeOrder()}>
      {isProvidingLoading ? 'Loading...' : 'Create Position'}
    </Button>
  );
};

export default AddLiquidityButton;
