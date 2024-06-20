import { useMemo } from 'react';
import { Address } from 'viem';
import { useContractWrite } from 'wagmi';

import { ALGEBRA_ROUTER } from '@/constants/addresses';

import { useTransactionAwait } from '../common/useTransactionAwait';
import { TransactionType } from '@/state/pendingTransactionsStore';
import {algebraRouterABI} from "@/abis";

export function useSmartRouterCallback(
  calldata: Address | undefined,
  value: string | undefined,
) {

  const { data: swapData, writeAsync: callback } = useContractWrite({
    address: ALGEBRA_ROUTER,
    abi: algebraRouterABI,
    functionName: 'multicall',
    args: calldata ? [[calldata]] : undefined,
    value: BigInt(value || 0),
  });

  const { isLoading } = useTransactionAwait(swapData?.hash, {
    title: 'Swap',
    type: TransactionType.SWAP
  });

  return useMemo(
    () => ({
      callback,
      isLoading,
    }),
    [callback, isLoading],
  );
}
