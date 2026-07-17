import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_NAME, enabledModules } from "config";
import { useApprove } from "@/hooks/common/useApprove";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { ApprovalState } from "@/types/approve-state";
import { KycStatus } from "@/types/kyc";
import { Currency, CurrencyAmount, Percent } from "@cryptoalgebra/integral-sdk";
import { deposit, depositNativeToken, SupportedChainId, VAULT_DEPOSIT_GUARD } from "@cryptoalgebra/alm-sdk";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { useUserSlippageToleranceWithDefault } from "@/state/userStore";
import { Address } from "viem";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { ExtendedVault, useUserALMVaultsByPool } from "../../hooks";
import KYCModule from "@/modules/KYCModule";

const { KycVerificationModal } = KYCModule.components;
const { usePoolKycRequirement, useKycIdentity } = KYCModule.hooks;

interface AddAutomatedLiquidityButtonProps {
    vault: ExtendedVault | undefined;
    amount: CurrencyAmount<Currency> | undefined;
    poolId?: string;
}

export const AddAutomatedLiquidityButton = ({ vault, amount, poolId }: AddAutomatedLiquidityButtonProps) => {
    const { address: account } = useAccount();
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const kycRequirement = usePoolKycRequirement(poolId as Address | undefined);
    const isKycRequired = enabledModules.KYCModule && Boolean(kycRequirement.isKycRequired);
    const kycIdentity = useKycIdentity(isKycRequired);

    const slippage = useUserSlippageToleranceWithDefault(new Percent(50, 1_000));
    const chainId = useChainId();

    const { refetch: refetchUserVaults } = useUserALMVaultsByPool(poolId as Address, account);

    const { open } = useAppKit();

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

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
            type: TransactionType.POOL,
        },
        poolId ? `/pool/${poolId}` : undefined
    );

    useEffect(() => {
        if (!isSuccess) return;

        refetchUserVaults();
    }, [isSuccess]);

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account)
        return (
            <Button variant={"primary"} onClick={() => open()}>
                Connect Wallet
            </Button>
        );

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    if (enabledModules.KYCModule && kycRequirement.isLoading)
        return <Button disabled><Loader /></Button>;

    if (enabledModules.KYCModule && kycRequirement.isError)
        return <Button variant="outline" onClick={() => kycRequirement.refetch()}>Retry KYC check</Button>;

    if (isKycRequired && kycIdentity.status !== KycStatus.VERIFIED)
        return (
            <>
                <Button variant="primary" onClick={() => setIsKycModalOpen(true)} disabled={kycIdentity.isLoading}>
                    {kycIdentity.isLoading ? <Loader /> : kycIdentity.status === KycStatus.IDENTITY_REQUIRED ? "Deploy Onchain ID" : "Complete verification"}
                </Button>
                <KycVerificationModal open={isKycModalOpen} onOpenChange={setIsKycModalOpen} identity={kycIdentity} />
            </>
        );

    // if (mintInfo.errorMessage) return <Button disabled>{mintInfo.errorMessage}</Button>;

    if (showApproveA)
        return (
            <div className="flex w-full gap-2">
                {showApproveA && (
                    <Button variant={"primary"} disabled={isApprovePending} className="w-full" onClick={approvalCallbackA}>
                        {isApprovePending ? <Loader /> : `Approve ${currency?.symbol}`}
                    </Button>
                )}
            </div>
        );

    return (
        <Button variant={"primary"} disabled={!isReady || isPending || isAddingLiquidityLoading} onClick={callback}>
            {isAddingLiquidityLoading || isPending ? <Loader /> : "Create Position"}
        </Button>
    );
};

export default AddAutomatedLiquidityButton;
