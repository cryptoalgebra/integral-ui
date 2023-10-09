import { Button } from "@/components/ui/button";
import { usePrepareAlgebraLimitOrderPluginPlace } from "@/generated";
import { useNeedAllowance } from "@/hooks/common/useNeedAllowance";
import { useApprove } from "@/hooks/common/useApprove";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import { useDerivedMintInfo } from "@/state/mintStore";
import { useLimitOrderInfo } from "@/state/swapStore";
import { INITIAL_POOL_FEE, Token, tryParseTick } from "@cryptoalgebra/integral-sdk";
import { Address, useContractWrite } from "wagmi";
import { ALGEBRA_LIMIT_ORDER_PLUGIN } from "@/constants/addresses";
import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { ApprovalState } from "@/types/approve-state";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Link } from "react-router-dom";

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

    console.log(limitOrder?.amount0, limitOrder?.amount1, limitOrderTick, limitOrder, isReady ? [
        {
            token0: token0.address as Address,
            token1: token1.address as Address
        },
        limitOrder.tickLower,
        zeroToOne,
        BigInt(limitOrder.liquidity.toString())
    ] : undefined)


    const needAllowance = useNeedAllowance(limitOrder?.amount1.currency, limitOrder?.amount1)

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

    const { data, write: placeLimitOrder, isLoading: isPlaceLoading } = useContractWrite(placeLimitOrderConfig)

    // const a = useTransitionAwait(data?.hash)

    console.log('isLoading', isPlaceLoading, data)

    const { toast } = useToast()

    // return (!disabled && needAllowance ?
    return ( true ?
        // <Button onClick={() => approvalCallback && approvalCallback()}>{ approvalState === ApprovalState.PENDING ? <Loader2Icon className="animate-spin" /> : 'Approve' }</Button> :
        <Button onClick={() => toast({
            title: 'Approve Token',
            description: 'Transaction was sent',
            action: <ToastAction altText="View on explorer" asChild>
                <Link to={'https://goerli.etherscan.io'} target={'_blank'} className="border-none gap-2 hover:bg-transparent hover:text-blue-400">
                    View on explorer
                    <ExternalLinkIcon size={16} />
                </Link>
            </ToastAction>,
            className: "bg-card border-card-border rounded-3xl text-left"
        })}>{ approvalState === ApprovalState.PENDING ? <Loader2Icon className="animate-spin" /> : 'Approve' }</Button> :
        <Button disabled={disabled || isPlaceLoading} onClick={() => placeLimitOrder && placeLimitOrder()}>
            { isPlaceLoading ? <Loader2Icon className="animate-spin" /> : 'Place an order' }
        </Button>);

}

export default LimitOrderButton;