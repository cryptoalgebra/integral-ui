import { algebraPositionManagerABI } from "@/generated";
import { Address, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useEffect } from "react";
import { useFarmCheckApprove } from "./useFarmCheckApprove";
import { useTransactionAwait } from "../common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";

import AlgebraConfig from "@/algebra.config";

export function useFarmApprove(tokenId: bigint) {
  const APPROVE = true;

  const { config } = usePrepareContractWrite({
    address: tokenId
      ? (AlgebraConfig.V3_CONTRACTS
          .NONFUNGIBLE_POSITION_MANAGER_ADDRESS as Address)
      : undefined,
    abi: algebraPositionManagerABI,
    functionName: "approveForFarming",
    args: [
      tokenId,
      APPROVE,
      AlgebraConfig.V3_CONTRACTS.FARMING_CENTER_ADDRESS as Address,
    ],
  });

  const { data: data, writeAsync: onApprove } = useContractWrite(config);

  const { isLoading, isSuccess } = useTransactionAwait(data?.hash, {
    title: `Farm Approve`,
    tokenId: tokenId.toString(),
    type: TransactionType.FARM,
  });

  const { handleCheckApprove } = useFarmCheckApprove(tokenId);

  useEffect(() => {
    if (isSuccess) {
      handleCheckApprove();
    }
  }, [isSuccess]);

  return {
    isLoading,
    isSuccess,
    onApprove,
  };
}
