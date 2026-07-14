import Loader from "@/components/common/Loader";
import EnterAmountCard from "@/components/create-position/EnterAmountsCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DEFAULT_CHAIN_NAME } from "config";
import { ApprovalState } from "@/types/approve-state";
import { Field } from "@cryptoalgebra/integral-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useNAVHookDeposit, useNAVHookDepositForm, useNAVHookPool } from "../hooks";

interface NAVHookAddLiquidityModalProps {
    poolId: Address | undefined;
    onSuccess?: () => void;
    triggerClassName?: string;
}

export function NAVHookAddLiquidityModal({ poolId, onSuccess, triggerClassName }: NAVHookAddLiquidityModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { address: account } = useAccount();
    const appChainId = useChainId();
    const { chainId: userChainId } = useAppKitNetwork();
    const { open } = useAppKit();
    const { token0, token1 } = useNAVHookPool(poolId);
    const depositForm = useNAVHookDepositForm(poolId);

    const {
        deposit,
        approveToken0,
        approveToken1,
        token0ApprovalState,
        token1ApprovalState,
        isToken0Approved,
        isToken1Approved,
        isPending,
        error,
    } = useNAVHookDeposit({
        poolId,
        amount0: depositForm.amount0,
        amount1: depositForm.amount1,
        onSuccess: () => {
            setIsOpen(false);
            depositForm.reset();
            onSuccess?.();
        },
    });

    const isWrongChain = !userChainId || appChainId !== userChainId;

    const actionButton = () => {
        if (!account) {
            return (
                <Button variant="primary" onClick={() => open()}>
                    Connect Wallet
                </Button>
            );
        }

        if (isWrongChain) {
            return (
                <Button variant="destructive" onClick={() => open({ view: "Networks" })}>
                    {`Connect to ${DEFAULT_CHAIN_NAME}`}
                </Button>
            );
        }

        if (!depositForm.hasAmounts) {
            return (
                <Button variant="primary" disabled>
                    Enter amounts
                </Button>
            );
        }

        if (depositForm.errorMessage) {
            return (
                <Button variant="primary" disabled>
                    {depositForm.errorMessage}
                </Button>
            );
        }

        if (!isToken0Approved) {
            return (
                <Button variant="primary" disabled={token0ApprovalState === ApprovalState.PENDING} onClick={approveToken0}>
                    {token0ApprovalState === ApprovalState.PENDING ? <Loader /> : `Approve ${token0?.symbol}`}
                </Button>
            );
        }

        if (!isToken1Approved) {
            return (
                <Button variant="primary" disabled={token1ApprovalState === ApprovalState.PENDING} onClick={approveToken1}>
                    {token1ApprovalState === ApprovalState.PENDING ? <Loader /> : `Approve ${token1?.symbol}`}
                </Button>
            );
        }

        return (
            <Button variant="primary" disabled={isPending} onClick={deposit}>
                {isPending ? <Loader /> : "Add Liquidity"}
            </Button>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="primary" className={triggerClassName}>
                    Add Liquidity
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[520px] rounded-xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold select-none">Add NAV Liquidity</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <EnterAmountCard
                        currency={token0}
                        value={depositForm.amount0Value}
                        handleChange={depositForm.onAmount0Change}
                        valueUsd={depositForm.amount0Usd}
                        field={Field.CURRENCY_A}
                        showBoostedToggle={false}
                    />
                    <EnterAmountCard
                        currency={token1}
                        value={depositForm.amount1Value}
                        handleChange={depositForm.onAmount1Change}
                        valueUsd={depositForm.amount1Usd}
                        field={Field.CURRENCY_B}
                        showBoostedToggle={false}
                    />
                    {error && <div className="rounded-lg  bg-red-500/20 px-3 py-2 text-sm text-red-300">{error}</div>}
                    {actionButton()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
