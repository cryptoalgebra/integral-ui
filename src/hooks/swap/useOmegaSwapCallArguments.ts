import { useUserState } from "@/state/userStore";
import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { PermitSignature } from "../common/usePermit";
import { OmegaRouter } from "@cryptoalgebra/omega-router-sdk";

export function useOmegaSwapCallArguments(
    trade: Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent,
    permitSignature?: PermitSignature
) {
    const { address: account } = useAccount();

    const { txDeadline } = useUserState();

    return useMemo(() => {
        if (!trade || !account) return [];

        const swapMethods = [];

        swapMethods.push(
            OmegaRouter.swapCallParameters(trade, {
                feeOnTransfer: false,
                recipient: account,
                slippageTolerance: allowedSlippage,
                deadline: Date.now() + txDeadline * 1000,
                inputTokenPermit: permitSignature,
            })
        );

        return swapMethods.map(({ calldata, value }) => {
            return {
                calldata,
                value,
            };
        });
    }, [trade, account, txDeadline, allowedSlippage, permitSignature]);
}
