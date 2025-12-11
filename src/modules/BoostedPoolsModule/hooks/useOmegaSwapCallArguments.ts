import { useUserState } from "@/state/userStore";
import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk";
import { useAccount } from "wagmi";
import { OmegaRouter, OmegaTrade } from "@cryptoalgebra/omega-router-sdk";
import useSWR from "swr";
import { PermitSignature } from "../types";

export function useOmegaSwapCallArguments(
    trade: Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent,
    permitSignature?: PermitSignature
) {
    const { address: account } = useAccount();

    const { txDeadline } = useUserState();

    const { data, isLoading } = useSWR(["swapCallParameters", trade, allowedSlippage, permitSignature, txDeadline], async () => {
        if (!trade || !account) return {};

        const routes = trade.swaps.map((swap) => ({
            route: swap.route,
            inputAmount: swap.inputAmount,
            outputAmount: swap.outputAmount,
        }));

        console.log("[OMEGA SWAP CALL ARGUMENTS] Computing swap call parameters for routes:", routes);

        try {
            const omegaTrade = new OmegaTrade({
                integralRoutes: routes.filter((r) => !r.route.isBoosted) as any,
                integralBoostedRoutes: routes.filter((r) => r.route.isBoosted) as any,
                tradeType: trade.tradeType,
            });

            const { calldata, value } = OmegaRouter.swapCallParameters(omegaTrade, {
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
        } catch (e) {
            console.error(e);
        }
    });

    return {
        data,
        isLoading,
    };
}
