import { Button } from "@/components/ui/button";
import { usePrepareAlgebraLimitOrderPluginPlace } from "@/generated";
import { useNeedAllowance } from "@/hooks/common/useNeedAllowance";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import { useLimitOrderInfo } from "@/state/swapStore";
import { Token, tryParseTick } from "@cryptoalgebra/integral-sdk";
import { Address, useContractWrite } from "wagmi";
import { ALGEBRA_LIMIT_ORDER_PLUGIN } from "@/constants/addresses";
import { ApprovalState } from "@/types/approve-state";
import Loader from "@/components/common/Loader";

interface LimitOrderButtonProps {
    token0: Token | undefined;
    token1: Token | undefined;
    poolAddress: Address | undefined;
    disabled: boolean;
    sellPrice: string;
    wasInverted: boolean;
    tickSpacing: number | undefined;
    zeroToOne: boolean;
}

const LimitOrderButton = ({ disabled, token0, token1, poolAddress, wasInverted, sellPrice, tickSpacing, zeroToOne }: LimitOrderButtonProps) => {

    const limitOrderTick = tryParseTick(token0, token1, sellPrice, tickSpacing)

    const formattedTick = limitOrderTick ? wasInverted ? -limitOrderTick : limitOrderTick : undefined

    const limitOrder = useLimitOrderInfo(poolAddress, formattedTick)

    const isReady = token0 && token1 && limitOrder && !disabled

    const needAllowance = useNeedAllowance(limitOrder?.amount0.currency, limitOrder?.amount0, ALGEBRA_LIMIT_ORDER_PLUGIN)

    const { approvalState, approvalCallback } = useApprove(limitOrder?.amount0, ALGEBRA_LIMIT_ORDER_PLUGIN)

    const { config: placeLimitOrderConfig } = usePrepareAlgebraLimitOrderPluginPlace({
        args: isReady ? [
            {
                token0: token0.address as Address,
                token1: token1.address as Address
            },
            limitOrder.tickLower,
            zeroToOne,
            BigInt(limitOrder.liquidity.toString())
        ] : undefined
    })

    const { data: placeData, write: placeLimitOrder, isLoading: isPlaceLoading } = useContractWrite(placeLimitOrderConfig)

    useTransitionAwait(placeData?.hash, 'Place an order')

    return (!disabled && needAllowance ?
        <Button onClick={() => approvalCallback && approvalCallback()}>{approvalState === ApprovalState.PENDING ? <Loader  /> : 'Approve'}</Button> :
        <Button disabled={disabled || isPlaceLoading} onClick={() => placeLimitOrder && placeLimitOrder()}>
            {isPlaceLoading ? <Loader  /> : 'Place an order'}
        </Button>);

}

export default LimitOrderButton;