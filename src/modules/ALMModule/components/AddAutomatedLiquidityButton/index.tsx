import Loader from "@/components/common/Loader";
import { useChainId } from "@/hooks/common/useChainId";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_NAME, DEFAULT_CHAIN_ID } from "config";
import { useApprove } from "@/hooks/common/useApprove";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { ApprovalState } from "@/types/approve-state";
import { Currency, CurrencyAmount, Percent } from "@cryptoalgebra/custom-pools-sdk";
import { deposit, depositNativeToken, SupportedChainId, VAULT_DEPOSIT_GUARD } from "@cryptoalgebra/alm-sdk";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useUserSlippageToleranceWithDefault } from "@/state/userStore";
import { Address } from "viem";
import { ExtendedVault, useUserALMVaultsByPool } from "../../hooks";
import { useWeb3AuthConnect } from "@web3auth/modal/react";

interface AddAutomatedLiquidityButtonProps {
    vault: ExtendedVault | undefined;
    amount: CurrencyAmount<Currency> | undefined;
    poolId?: string;
}

export const AddAutomatedLiquidityButton = ({ vault, amount, poolId }: AddAutomatedLiquidityButtonProps) => {
    const { address: account } = useAccount();

    const slippage = useUserSlippageToleranceWithDefault(new Percent(50, 1_000));
    const chainId = useChainId();

    const { refetch: refetchUserVaults } = useUserALMVaultsByPool(poolId as Address, account);

    const { connect: open } = useWeb3AuthConnect();

    const currency = vault?.depositToken;
    const useNative = currency?.isNative ? currency : undefined;

    const { approvalState: approvalStateA, approvalCallback: approvalCallbackA } = useApprove(
        amount,
        VAULT_DEPOSIT_GUARD[chainId as SupportedChainId] as Address
    );

    const isApprovePending = approvalStateA === ApprovalState.PENDING;

    const showApproveA = approvalStateA === ApprovalState.NOT_APPROVED || isApprovePending;

    const isReady = approvalStateA === ApprovalState.APPROVED;

    const provider = useEthersProvider();

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
                    Number(slippage.toSignificant(4))
                );
            } else {
                tx = await deposit(
                    account,
                    vault.allowTokenA ? amount.toExact() : "0",
                    vault.allowTokenB ? amount.toExact() : "0",
                    vault.id,
                    provider,
                    Number(slippage.toSignificant(4))
                );
            }

            setTxHash(tx.hash as Address);
        } catch (e) {
            console.log(e);
        } finally {
            setIsPending(false);
        }
    }, [vault, amount?.quotient.toString(), account, provider, useNative, slippage.quotient.toString()]);

    const { isLoading: isAddingLiquidityLoading, isSuccess } = useTransactionAwait(
        txHash,
        {
            title: "Add automated liquidity",
            tokenA: currency?.wrapped.address as Address,
            type: TransactionType.POOL },
        poolId ? `/pool/${poolId}` : undefined
    );

    useEffect(() => {
        if (!isSuccess) return;

        refetchUserVaults();
    }, [isSuccess]);

    const isWrongChain = chainId !== DEFAULT_CHAIN_ID;

    if (!account) return <Button variant={'primary'} onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open()}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    // if (mintInfo.errorMessage) return <Button disabled>{mintInfo.errorMessage}</Button>;

    if (showApproveA)
        return (
            <div className="flex w-full gap-2">
                {showApproveA && (
                    <Button variant={'primary'} disabled={isApprovePending} className="w-full" onClick={approvalCallbackA}>
                        {isApprovePending ? <Loader /> : `Approve ${currency?.symbol}`}
                    </Button>
                )}
            </div>
        );

    return (
        <Button variant={'primary'} disabled={!isReady || isPending || isAddingLiquidityLoading} onClick={callback}>
            {isAddingLiquidityLoading || isPending ? <Loader /> : "Create Position"}
        </Button>
    );
};

export default AddAutomatedLiquidityButton;
