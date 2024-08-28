import { useMemo } from "react";
import { Address } from "viem";
import { useContractWrite } from "wagmi";

import { ALGEBRA_ROUTER } from "@/constants/addresses";

import { useTransactionAwait } from "../common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { algebraRouterABI } from "@/abis";
import { Currency } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { formatAmount } from "@/utils/common/formatAmount";

export function useSmartRouterCallback(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  amount: string | undefined,
  calldata: Address | undefined,
  value: string | undefined
) {
  const { data: swapData, writeAsync: callback } = useContractWrite({
    address: ALGEBRA_ROUTER,
    abi: algebraRouterABI,
    functionName: "multicall",
    args: calldata ? [[calldata]] : undefined,
    value: BigInt(value || 0),
  });

  const { isLoading } = useTransactionAwait(swapData?.hash, {
    title: `Swap ${formatAmount(amount || "0", 6)} ${currencyA?.symbol}`,
    type: TransactionType.SWAP,
    tokenA: currencyA?.wrapped.address as Address,
    tokenB: currencyB?.wrapped.address as Address,
  });

  return useMemo(
    () => ({
      callback,
      isLoading,
    }),
    [callback, isLoading]
  );
}
