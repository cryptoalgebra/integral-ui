import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_NAME } from "@/constants/default-chain-id";
import { ExtendedVault } from "@/hooks/alm/useALMVaults";
import { useApprove } from "@/hooks/common/useApprove";
import { useEthersSigner } from "@/hooks/common/useEthersProvider";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { ApprovalState } from "@/types/approve-state";
import { ChainId, Currency, CurrencyAmount, Percent } from "@cryptoalgebra/custom-pools-sdk";
import { deposit, depositNativeToken, SupportedChainId, SupportedDex, VAULT_DEPOSIT_GUARD } from "@cryptoalgebra/alm-sdk";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useCallback, useEffect, useState } from "react";
import { Address, useAccount, useChainId } from "wagmi";
import { useUserALMVaultsByPool } from "@/hooks/alm/useUserALMVaults";
import { useUserSlippageToleranceWithDefault } from "@/state/userStore";

const dex = SupportedDex.CLAMM;

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

    const { open } = useWeb3Modal();

    const { selectedNetworkId } = useWeb3ModalState();

    const currency = vault?.depositToken;
    const useNative = currency?.isNative ? currency : undefined;

    const { approvalState: approvalStateA, approvalCallback: approvalCallbackA } = useApprove(
        amount,
        VAULT_DEPOSIT_GUARD[chainId as SupportedChainId][dex] as Address
    );

    const isApprovePending = approvalStateA === ApprovalState.PENDING;

    const showApproveA = approvalStateA === ApprovalState.NOT_APPROVED || isApprovePending;

    const isReady = approvalStateA === ApprovalState.APPROVED;

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
                    dex,
                    Number(slippage.toSignificant(4))
                );
            } else {
                tx = await deposit(
                    account,
                    vault.allowTokenA ? amount.toExact() : "0",
                    vault.allowTokenB ? amount.toExact() : "0",
                    vault.id,
                    provider,
                    dex,
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
            type: TransactionType.POOL,
        },
        poolId ? `/pool/${poolId}` : undefined
    );

    useEffect(() => {
        if (!isSuccess) return;

        console.log("refetchUserVaults");
        refetchUserVaults();
    }, [isSuccess]);

    const isWrongChain = !selectedNetworkId || ![ChainId.Base, ChainId.BaseSepolia].includes(selectedNetworkId);

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return (
            <Button
                variant={"destructive"}
                onClick={() => open({ view: "Networks" })}
            >{`Connect to ${DEFAULT_CHAIN_NAME[chainId]}`}</Button>
        );

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
