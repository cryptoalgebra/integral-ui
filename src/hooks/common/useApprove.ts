import { Currency, CurrencyAmount, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk";
import { useAllowance } from "./useAllowance";
import { ApprovalState, ApprovalStateType } from "@/types/approve-state";
import { useMemo } from "react";
import { Address, erc20ABI, useContractWrite } from "wagmi";
import { ALGEBRA_ROUTER } from "@/constants/addresses";

export function useApprove(amountToApprove: CurrencyAmount<Currency> | undefined, spender: string) {

    const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
    const needAllowance = useAllowance(token, amountToApprove)
    // const pendingApproval = useHasPendingApproval(token?.address, spender)

    const approvalState: ApprovalStateType = useMemo(() => {
        if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
        if (amountToApprove.currency.isNative) return ApprovalState.APPROVED

        // if (!currentAllowance) return ApprovalState.UNKNOWN

        return needAllowance ? ApprovalState.NOT_APPROVED : ApprovalState.APPROVED
    }, [amountToApprove, needAllowance, spender])

    const { data: approvalData, writeAsync: approve } = useContractWrite({
        address: amountToApprove ? (amountToApprove.currency.wrapped.address as Address) : undefined,
        abi: erc20ABI,
        functionName: 'approve',
        args: [
            spender,
            amountToApprove ? BigInt(amountToApprove.quotient.toString()) : 0,
        ] as [Address, bigint],
        onSuccess() {
            //   generateToast(
            //     'Transaction sent',
            //     'Your transaction has been submitted to the network',
            //     'loading'
            //   );
        },
        onError(error) {
            //   generateToast(
            //     'Error meanwhile waiting for transaction',
            //     error.message,
            //     'error'
            //   );
        },
    });

    return {
        approvalState,
        approvalCallback: approve
    }

}


export function useApproveCallbackFromTrade(
    trade: Trade<Currency, Currency, TradeType> | undefined,
    allowedSlippage: Percent
) {
    const amountToApprove = useMemo(
        () => (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined),
        [trade, allowedSlippage]
    )
    return useApprove(amountToApprove, ALGEBRA_ROUTER)
}
