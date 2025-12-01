import { useUserState } from "@/state/userStore";
import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount } from "wagmi";
import { OmegaRouter } from "@cryptoalgebra/omega-router-sdk";
import useSWR from "swr";
import { PermitSignature } from "../types";

export function useOmegaSwapCallArguments(
    trade: Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent,
    permitSignature?: PermitSignature,
    stepAmountsOut?: string[] | null
) {
    const { address: account } = useAccount();

    const { txDeadline } = useUserState();

    const { data, isLoading } = useSWR(
        ["swapCallParameters", trade, allowedSlippage, permitSignature, txDeadline, stepAmountsOut],
        async () => {
            if (!trade || !account) return {};
            const { calldata, value } = await OmegaRouter.swapCallParameters(trade, {
                feeOnTransfer: false,
                recipient: account,
                slippageTolerance: allowedSlippage,
                deadline: Date.now() + txDeadline * 1000,
                inputTokenPermit: permitSignature,
                stepAmountsOut: stepAmountsOut ?? undefined,
            });

            return {
                calldata,
                value,
            };
        }
    );

    return {
        data,
        isLoading,
    };
}
