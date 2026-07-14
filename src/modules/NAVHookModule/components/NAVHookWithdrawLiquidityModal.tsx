import { NAVHookTokenValueCard } from "./NAVHookTokenValueCard";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_CHAIN_NAME } from "config";
import { ApprovalState } from "@/types/approve-state";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useNAVHookPool, useNAVHookVaultState, useNAVHookWithdraw } from "../hooks";
import { getPercentAmount } from "../utils";

interface NAVHookWithdrawLiquidityModalProps {
    poolId: Address | undefined;
    onSuccess?: () => void;
    triggerClassName?: string;
}

export function NAVHookWithdrawLiquidityModal({ poolId, onSuccess, triggerClassName }: NAVHookWithdrawLiquidityModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [sliderValue, setSliderValue] = useState([50]);
    const percent = sliderValue[0] ?? 0;
    const { address: account } = useAccount();
    const appChainId = useChainId();
    const { chainId: userChainId } = useAppKitNetwork();
    const { open } = useAppKit();
    const { token0, token1 } = useNAVHookPool(poolId);
    const vaultState = useNAVHookVaultState(poolId, account);

    const { withdraw, approveShares, approvalState, isApproved, isPending, error, sharesToWithdrawRaw } = useNAVHookWithdraw({
        poolId,
        percent,
        onSuccess: () => {
            setIsOpen(false);
            onSuccess?.();
        },
    });

    const isWrongChain = !userChainId || appChainId !== userChainId;
    const amount0Raw = getPercentAmount(vaultState.userAmount0, percent);
    const amount1Raw = getPercentAmount(vaultState.userAmount1, percent);

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

        if (sharesToWithdrawRaw === 0n) {
            return (
                <Button variant="primary" disabled>
                    Select amount
                </Button>
            );
        }

        if (!isApproved) {
            return (
                <Button variant="primary" disabled={approvalState === ApprovalState.PENDING} onClick={approveShares}>
                    {approvalState === ApprovalState.PENDING ? <Loader /> : "Approve Vault Shares"}
                </Button>
            );
        }

        return (
            <Button variant="primary" disabled={isPending} onClick={withdraw}>
                {isPending ? <Loader /> : "Withdraw Liquidity"}
            </Button>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={triggerClassName}>
                    Withdraw Liquidity
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[520px] rounded-xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold select-none">Withdraw NAV Liquidity</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    <h2 className="text-2xl font-semibold select-none">{percent}%</h2>
                    <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 75, 100].map((value) => (
                            <Button
                                key={`nav-withdraw-percent-${value}`}
                                variant={percent === value ? "iconHover" : "icon"}
                                size="sm"
                                className="border border-card-border"
                                onClick={() => setSliderValue([value])}
                            >
                                {value}%
                            </Button>
                        ))}
                    </div>
                    <Slider
                        value={sliderValue}
                        max={100}
                        step={1}
                        onValueChange={setSliderValue}
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        aria-label="Liquidity Percent"
                        disabled={isPending}
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <NAVHookTokenValueCard currency={token0} amountRaw={amount0Raw} />
                        <NAVHookTokenValueCard currency={token1} amountRaw={amount1Raw} />
                    </div>
                    {error && <div className="rounded-lg border border-red-500 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div>}
                    {actionButton()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
