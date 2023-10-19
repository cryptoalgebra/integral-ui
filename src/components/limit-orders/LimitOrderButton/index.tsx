import { Button } from "@/components/ui/button";
import { usePrepareAlgebraLimitOrderPluginPlace } from "@/generated";
import { useNeedAllowance } from "@/hooks/common/useNeedAllowance";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import { useDerivedSwapInfo, useLimitOrderInfo } from "@/state/swapStore";
import { Token, tryParseTick } from "@cryptoalgebra/integral-sdk";
import { Address, useAccount, useContractWrite } from "wagmi";
import { ALGEBRA_LIMIT_ORDER_PLUGIN } from "@/constants/addresses";
import { ApprovalState } from "@/types/approve-state";
import Loader from "@/components/common/Loader";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id";
import { SwapField } from "@/types/swap-field";
import { formatCurrency } from "@/utils/common/formatCurrency";

interface LimitOrderButtonProps {
    token0: Token | undefined;
    token1: Token | undefined;
    poolAddress: Address | undefined;
    disabled: boolean;
    sellPrice: string;
    wasInverted: boolean;
    tickSpacing: number | undefined;
    zeroToOne: boolean;
    limitOrderPlugin: boolean;
}

const LimitOrderButton = ({ disabled, token0, token1, poolAddress, wasInverted, sellPrice, tickSpacing, zeroToOne, limitOrderPlugin }: LimitOrderButtonProps) => {

    const { address: account } = useAccount()

    const { open } = useWeb3Modal()
    const { selectedNetworkId } = useWeb3ModalState()

    const { currencies: { [SwapField.INPUT]: inputCurrency }, toggledTrade: trade, inputError } = useDerivedSwapInfo()
    const amount = trade && trade.inputAmount

    const limitOrderTick = zeroToOne ? tryParseTick(token0, token1, sellPrice, tickSpacing) : tryParseTick(token1, token0, sellPrice, tickSpacing)

    const formattedTick = limitOrderTick ? wasInverted ? -limitOrderTick : limitOrderTick : undefined

    const limitOrder = useLimitOrderInfo(poolAddress, amount, formattedTick)
    
    const needAllowance = useNeedAllowance(inputCurrency?.isNative ? undefined : inputCurrency?.wrapped, amount, ALGEBRA_LIMIT_ORDER_PLUGIN)
    
    const isReady = token0 && token1 && amount && limitOrder && !disabled && !inputError && !needAllowance

    const { approvalState, approvalCallback } = useApprove(amount, ALGEBRA_LIMIT_ORDER_PLUGIN)

    const { config: placeLimitOrderConfig } = usePrepareAlgebraLimitOrderPluginPlace({
        args: isReady ? [
            {
                token0: token0.address as Address,
                token1: token1.address as Address
            },
            limitOrder.tickLower,   
            zeroToOne,
            BigInt(limitOrder.liquidity.toString())
        ] : undefined,
        value: amount?.currency.isNative ? BigInt(amount.quotient.toString()) : BigInt(0),
        enabled: Boolean(isReady),
    })

    const { data: placeData, write: placeLimitOrder } = useContractWrite(placeLimitOrderConfig)

    const { isLoading: isPlaceLoading } = useTransitionAwait(placeData?.hash, `Buy ${formatCurrency.format(Number(amount?.toSignificant()))} ${amount?.currency.symbol}`)

    const isWrongChain = selectedNetworkId !== DEFAULT_CHAIN_ID

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>

    if (isWrongChain) return <Button variant={'destructive'} onClick={() => open({ view: 'Networks' })}>Connect to Goerli</Button>

    if (!limitOrderPlugin) return <Button disabled>This pool doesn't support Limit Orders</Button>

    if (!disabled && inputError) return <Button disabled>{inputError}</Button>

    if (!disabled && needAllowance) return <Button disabled={approvalState === ApprovalState.PENDING} onClick={() => approvalCallback && approvalCallback()}>{approvalState === ApprovalState.PENDING ? <Loader /> : `Approve ${amount?.currency.symbol}`}</Button>

    return <Button disabled={disabled || isPlaceLoading || approvalState === ApprovalState.PENDING} onClick={() => {
        console.log('[PLACE LIMIT ORDER]', isReady && [
            {
                token0: token0.address as Address,
                token1: token1.address as Address
            },
            limitOrder.tickLower,
            zeroToOne,
            BigInt(limitOrder.liquidity.toString())
        ])
        placeLimitOrder && placeLimitOrder()
    }}>
        {isPlaceLoading ? <Loader /> : 'Place an order'}
    </Button>

}

export default LimitOrderButton;