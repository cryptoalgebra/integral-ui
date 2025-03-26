import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_ID, DEFAULT_CHAIN_NAME } from "@/constants/default-chain-id";
import { ExtendedVault } from "@/hooks/alm/useALMVaults";
import { useApprove } from "@/hooks/common/useApprove";
import { useEthersSigner } from "@/hooks/common/useEthersProvider";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { ApprovalState } from "@/types/approve-state";
import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { deposit, depositNativeToken, SupportedDex } from "@cryptoalgebra/alm-sdk";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { Address, useAccount } from "wagmi";

const VAULT_DEPOSIT_GUARD = "0xc7944fB8e8F4c89e7D8a997F59F2efec3Ce02B12";

interface AddAutomatedLiquidityButtonProps {
    vault: ExtendedVault | undefined;
    amount: CurrencyAmount<Currency> | undefined;
}

export const AddAutomatedLiquidityButton = ({ vault, amount }: AddAutomatedLiquidityButtonProps) => {
    const { address: account } = useAccount();

    const { open } = useWeb3Modal();

    const { selectedNetworkId } = useWeb3ModalState();

    const { poolId } = useParams();

    const currency = vault?.depositToken;
    const useNative = currency?.isNative ? currency : undefined;

    const { approvalState: approvalStateA, approvalCallback: approvalCallbackA } = useApprove(amount, VAULT_DEPOSIT_GUARD);

    const isApprovePending = approvalStateA === ApprovalState.PENDING;

    const showApproveA = approvalStateA === ApprovalState.NOT_APPROVED || isApprovePending;

    const isReady = approvalStateA === ApprovalState.APPROVED;

    // const { config: addLiquidityConfig } = usePrepareAlgebraPositionManagerMulticall({
    //     args: calldata && [calldata as `0x${string}`[]],
    //     enabled: Boolean(calldata && isReady),
    //     value: BigInt(value || 0),
    // });

    // const { data: addLiquidityData, write: addLiquidity } = useContractWrite(addLiquidityConfig);

    const provider = useEthersSigner();

    const [isPending, setIsPending] = useState(false);
    const [txHash, setTxHash] = useState<Address | undefined>();

    const callback = useCallback(async () => {
        if (!vault || !amount || !account || !provider) return;
        setIsPending(true);
        try {
            let tx;
            if (useNative) {
                tx = await depositNativeToken(
                    account,
                    vault.allowTokenA ? amount.toExact() : "0",
                    vault.allowTokenB ? amount.toExact() : "0",
                    vault.id,
                    provider,
                    SupportedDex.Henjin
                );
            } else {
                tx = await deposit(
                    account,
                    vault.allowTokenA ? amount.toExact() : "0",
                    vault.allowTokenB ? amount.toExact() : "0",
                    vault.id,
                    provider,
                    SupportedDex.Henjin
                );
            }

            setTxHash(tx.hash as Address);
        } catch (e) {
            console.log(e);
        } finally {
            setIsPending(false);
        }
    }, [vault, amount?.quotient.toString(), account, provider, useNative]);

    const { isLoading: isAddingLiquidityLoading } = useTransactionAwait(
        txHash,
        {
            title: "Add automated liquidity",
            tokenA: currency?.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        `/pool/${poolId}`
    );

    const isWrongChain = selectedNetworkId !== DEFAULT_CHAIN_ID;

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    // if (mintInfo.errorMessage) return <Button disabled>{mintInfo.errorMessage}</Button>;

    if (showApproveA)
        return (
            <div className="flex w-full gap-2">
                {showApproveA && (
                    <Button disabled={isApprovePending} className="w-full" onClick={approvalCallbackA}>
                        {isApprovePending ? <Loader /> : `Approve ${currency?.symbol}`}
                    </Button>
                )}
            </div>
        );

    return (
        <Button disabled={!isReady || isPending || isAddingLiquidityLoading} onClick={callback}>
            {isAddingLiquidityLoading || isPending ? <Loader /> : "Create Position"}
        </Button>
    );
};

export default AddAutomatedLiquidityButton;
