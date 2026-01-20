import { useUserState } from "@/state/userStore";
import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk";
import { useAccount, useChainId } from "wagmi";
import { OmegaRouter, OmegaTrade } from "@cryptoalgebra/omega-router-sdk";
import useSWR from "swr";
import { PermitSignature } from "../types";
import { OMEGA_ROUTER } from "config";

export function useOmegaSwapCallArguments(
    trade: Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent,
    permitSignature?: PermitSignature
) {
    const chainId = useChainId();
    const { address: account } = useAccount();

    const { txDeadline } = useUserState();

    const { data, isLoading } = useSWR(["swapCallParameters", trade, allowedSlippage, permitSignature, txDeadline], async () => {
        if (!trade || !account) return {};

        const routes = trade.swaps.map((swap) => ({
            route: swap.route,
            inputAmount: swap.inputAmount,
            outputAmount: swap.outputAmount,
        }));

        console.log("[OMEGA TRADE]:", {
            route: routes[0],
            inputAmount: routes[0].inputAmount.toSignificant(24),
            outputAmount: routes[0].outputAmount.toSignificant(24),
        });

        try {
            const omegaTrade = new OmegaTrade({
                integralRoutes: routes.filter((r) => !r.route.isBoosted) as any,
                integralBoostedRoutes: routes.filter((r) => r.route.isBoosted) as any,
                tradeType: trade.tradeType,
            });

            const omegaRouter = new OmegaRouter(OMEGA_ROUTER[chainId]);

            const { calldata, value } = omegaRouter.swapCallParameters(omegaTrade, {
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
