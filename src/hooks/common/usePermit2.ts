import { Currency, CurrencyAmount, Token } from "@cryptoalgebra/custom-pools-sdk";
import { PermitSignature, PermitState } from "./usePermit";
import { useChainId } from "wagmi";
import { useCallback, useMemo } from "react";
import { PERMIT2 } from "config/contract-addresses";
import { useNeedAllowance } from "./useNeedAllowance";
import { useApprove, useRevokeApprove } from "./useApprove";
import { usePermit } from "./usePermit";
import { ApprovalState } from "@/types/approve-state";
import { Address } from "viem";

export enum AllowanceState {
    LOADING = 0,
    REQUIRED = 1,
    ALLOWED = 2,
}

interface AllowanceRequired {
    state: AllowanceState.REQUIRED;
    token: Token;
    approveAndPermit: () => void;
    approve: () => void;
    permit: () => void;
    revoke: () => void;
    needsSetupApproval: boolean;
    needsPermitSignature: boolean;
    isLoading: boolean;
}

export type Allowance =
    | { state: AllowanceState.LOADING }
    | {
          state: AllowanceState.ALLOWED;
          permitSignature?: PermitSignature;
      }
    | AllowanceRequired;

export function usePermit2({ amount, spender }: { amount?: CurrencyAmount<Currency>; spender?: string }): Allowance {
    const token = amount?.currency.wrapped;
    const chainId = useChainId();
    const permit2Address = PERMIT2[chainId] as Address;

    // Get permit state and callback using usePermit hook
    const { permitState, permitCallback, permitSignature } = usePermit(amount, spender);

    // Approval functions - using useApprove hook
    const { approvalCallback: approve, approvalState } = useApprove(amount, permit2Address);

    // Revoke allowance
    const { approvalCallback: revoke, approvalState: revokeState } = useRevokeApprove(token, permit2Address);

    // Check if permit is needed
    const needsTokenApproval = useNeedAllowance(token, amount, permit2Address);
    const needsPermitSignature = permitState === PermitState.NOT_PERMITTED || permitState === PermitState.LOADING;

    const approveAndPermit = useCallback(async () => {
        if (needsTokenApproval) {
            approve();
        }
        if (needsPermitSignature) {
            permitCallback();
        }
    }, [needsTokenApproval, approve, needsPermitSignature, permitCallback]);

    const isPermitLoading = permitState === PermitState.LOADING;
    const isApprovalLoading = approvalState === ApprovalState.PENDING;
    const isRevokeLoading = revokeState === ApprovalState.PENDING;

    const isLoading = isPermitLoading || isApprovalLoading || isRevokeLoading;

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
                permit: permitCallback,
                revoke,
                needsSetupApproval: needsTokenApproval,
                needsPermitSignature,
                isLoading,
            };
        }

        return {
            state: AllowanceState.ALLOWED,
            permitSignature,
        };
    }, [token, needsTokenApproval, needsPermitSignature, approveAndPermit, approve, permitCallback, revoke, isLoading, permitSignature]);
}
