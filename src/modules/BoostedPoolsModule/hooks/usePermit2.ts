import { AnyToken, Currency, CurrencyAmount, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useChainId } from "wagmi";
import { useCallback, useMemo } from "react";
import { PERMIT2 } from "config/contract-addresses";
import { useNeedAllowance } from "../../../hooks/common/useNeedAllowance";
import { useApprove, useRevokeApprove } from "../../../hooks/common/useApprove";
import { usePermit } from "./usePermit";
import { ApprovalState } from "@/types/approve-state";
import { Address } from "viem";
import { AllowanceState, PermitSignature, PermitState } from "../types";
import { MaxAllowanceTransferAmount } from "@uniswap/permit2-sdk";

interface AllowanceRequired {
    state: AllowanceState.REQUIRED;
    token: AnyToken;
    approveAndPermit: () => void;
    approve: () => void;
    permit: () => void;
    revoke: () => void;
    removePermitSign: () => void;
    refetchPermit2Data: () => void;
    needsSetupApproval: boolean;
    needsPermitSignature: boolean;
    isLoading: boolean;
}

export type Allowance =
    | { state: AllowanceState.LOADING }
    | {
          state: AllowanceState.ALLOWED;
          permitSignature?: PermitSignature;
          refetchPermit2Data: () => void;
          removePermitSign: () => void;
      }
    | AllowanceRequired;

export function usePermit2({ amount, spender }: { amount?: CurrencyAmount<Currency>; spender?: string }): Allowance {
    const token = amount?.currency.wrapped;
    const chainId = useChainId();
    const permit2Address = PERMIT2[chainId] as Address;

    // Get permit state and callback using usePermit hook
    const { permitState, permitCallback, permitSignature, refetchPermit, removePermitSign } = usePermit(amount, spender);

    // Approval functions - using useApprove hook
    const { approvalCallback: approve, approvalState } = useApprove(
        amount ? tryParseAmount(MaxAllowanceTransferAmount.toString(), amount?.currency) : undefined,
        permit2Address
    );

    // Revoke allowance
    const { approvalCallback: revoke, approvalState: revokeState } = useRevokeApprove(token, permit2Address);

    // Check if ERC20 approval to Permit2 is needed
    const { needAllowance: needsTokenApproval, refetchAllowance } = useNeedAllowance(token, amount, permit2Address, true);

    // Check if Permit2 signature is needed
    // permitState includes expiration check inside usePermit
    const needsPermitSignature = permitState === PermitState.NOT_PERMITTED || permitState === PermitState.LOADING;

    const approveAndPermit = useCallback(async () => {
        // Always check permit state at the moment of action
        // to ensure expiration hasn't occurred since last render
        if (needsTokenApproval) {
            await approve();
        }

        // Re-check if permit is needed (could be expired or insufficient)
        if (permitState === PermitState.NOT_PERMITTED) {
            await permitCallback();
        }
    }, [needsTokenApproval, approve, permitState, permitCallback]);

    const permit = useCallback(async () => {
        // Check expiration before permitting
        if (permitState === PermitState.NOT_PERMITTED) {
            await permitCallback();
        }
    }, [permitState, permitCallback]);

    const isPermitLoading = permitState === PermitState.LOADING;
    const isApprovalLoading = approvalState === ApprovalState.PENDING;
    const isRevokeLoading = revokeState === ApprovalState.PENDING;

    const isLoading = isPermitLoading || isApprovalLoading || isRevokeLoading;

    // Combined refetch callback
    const refetchPermit2Data = useCallback(() => {
        refetchPermit();
        refetchAllowance();
    }, [refetchPermit, refetchAllowance]);

    // Determine state
    return useMemo(() => {
        if (!token) {
            return { state: AllowanceState.LOADING };
        }

        if (needsTokenApproval || needsPermitSignature) {
            return {
                state: AllowanceState.REQUIRED,
                token,
                approveAndPermit,
                approve,
                permit,
                revoke,
                refetchPermit2Data,
                removePermitSign,
                needsSetupApproval: needsTokenApproval,
                needsPermitSignature,
                isLoading,
            };
        }

        return {
            state: AllowanceState.ALLOWED,
            permitSignature,
            refetchPermit2Data,
            removePermitSign
        };
    }, [
        token,
        needsTokenApproval,
        needsPermitSignature,
        approveAndPermit,
        approve,
        permit,
        revoke,
        isLoading,
        permitSignature,
        refetchPermit2Data,
    ]);
}
