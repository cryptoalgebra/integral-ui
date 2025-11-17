import { useUserState } from "@/state/userStore";
import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount } from "wagmi";
import { PermitSignature } from "../common/usePermit";
import { OmegaRouter } from "@cryptoalgebra/omega-router-sdk";
import useSWR from "swr";

export function useOmegaSwapCallArguments(
    trade: Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent,
    permitSignature?: PermitSignature
) {
    const { address: account } = useAccount();

    const { txDeadline } = useUserState();

    const { data, isLoading } = useSWR(["swapCallParameters", trade, allowedSlippage, permitSignature, txDeadline], async () => {
        if (!trade || !account) return {};

        console.log('[TRADE]', trade);

        const { calldata, value } = await OmegaRouter.swapCallParameters(trade, {
            feeOnTransfer: false,
            recipient: account,
            slippageTolerance: allowedSlippage,
            deadline: Date.now() + txDeadline * 1000,
            inputTokenPermit: permitSignature,
        });

        return {
            calldata,
            value,
        };
    });

    return {
        data,
        isLoading,
    };
}
