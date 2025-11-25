import CurrencyLogo from "@/components/common/CurrencyLogo";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { useNFTPermit, NFTPermitState } from "@/hooks/common/useNFTPermit";
import { usePositionFees } from "@/hooks/positions/usePositionFees";
import { IDerivedMintInfo } from "@/state/mintStore";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { formatAmount } from "@/utils";
import { ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { OmegaRouter } from "@cryptoalgebra/omega-router-sdk";
import { OMEGA_ROUTER } from "config/contract-addresses";
import { useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

interface CollectFeesModalProps {
    mintInfo: IDerivedMintInfo;
    positionId: number;
    amount0: ReturnType<typeof usePositionFees>["amount0"];
    amount1: ReturnType<typeof usePositionFees>["amount1"];
    amount0Usd: ReturnType<typeof usePositionFees>["amount0Usd"];
    amount1Usd: ReturnType<typeof usePositionFees>["amount1Usd"];
}

const CollectFeesModal = ({ mintInfo, positionId, amount0, amount1, amount0Usd, amount1Usd }: CollectFeesModalProps) => {
    const { address: account } = useAccount();
    const chainId = useChainId();

    const [isOpen, setIsOpen] = useState(false);
    const [token0Unwrap, setToken0Unwrap] = useState(false);
    const [token1Unwrap, setToken1Unwrap] = useState(false);

    const zeroRewards = amount0?.equalTo("0") && amount1?.equalTo("0");

    // Determine if tokens are boosted
    const token0 = amount0?.currency;
    const token1 = amount1?.currency;
    const isBoostedToken0 = token0 && token0.isBoosted;
    const isBoostedToken1 = token1 && token1.isBoosted;

    // NFT Permit for OmegaRouter
    const { permitState, permitCallback, permitSignature, isLoading: isPermitLoading } = useNFTPermit({
        tokenId: positionId,
        spender: chainId ? OMEGA_ROUTER[chainId] : undefined,
    });

    const needsPermit = permitState === NFTPermitState.NOT_PERMITTED;

    const { calldata, value } = useMemo(() => {
        if (!account || !amount0 || !amount1 || !permitSignature || !token0 || !token1) return { calldata: undefined, value: undefined };

        try {
            return OmegaRouter.collectCallParameters(token0.wrapped, token1.wrapped, {
                tokenId: positionId,
                recipient: account,
                token0Unwrap,
                token1Unwrap,
                permit: permitSignature,
            });
        } catch (error) {
            console.error(error);
            return { calldata: undefined, value: undefined };
        }
    }, [account, amount0, amount1, permitSignature, token0, token1, positionId, token0Unwrap, token1Unwrap]);

    const collectConfig = useMemo(() => {
        if (!calldata) return undefined;

        return {
            to: OMEGA_ROUTER[chainId],
            data: calldata as Address,
            value: BigInt(value || 0),
        };
    }, [calldata, value, chainId]);

    const { data: collectData, sendTransactionAsync: collect, isPending } = useSendTransaction();

    const { isLoading } = useTransactionAwait(collectData, {
        title: "Collect fees",
        tokenA: mintInfo.currencies.CURRENCY_A?.wrapped.address as Address,
        tokenB: mintInfo.currencies.CURRENCY_B?.wrapped.address as Address,
        type: TransactionType.POOL,
    });

    const isDisabled = zeroRewards || isLoading || isPending || isPermitLoading || (!needsPermit && !collectConfig);

    const handleCollectFees = async () => {
        if (needsPermit) {
            await permitCallback();
            return;
        }

        if (!collectConfig) return;

        await collect(collectConfig);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    size={"md"}
                    variant={"primary"}
                    disabled={zeroRewards || isLoading || isPending}
                    className="min-w-[108px] rounded-2xl"
                >
                    {isLoading || isPending ? <Loader /> : "Collect fees"}
                </Button>
            </DialogTrigger>
            <DialogContent className="md:min-w-[500px] rounded-xl! bg-card" style={{ borderRadius: "32px" }}>
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">Collect Fees</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col p-2 gap-2 bg-card-dark rounded-lg">
                        <div className="flex items-center gap-6 justify-between">
                            <div className="flex gap-2 items-center">
                                <CurrencyLogo className="inline" currency={amount0?.currency} size={20} />
                                <span>{amount0?.currency?.symbol}</span>
                            </div>

                            <div className="flex gap-1 items-end">
                                <span>{formatAmount(amount0?.toExact() || 0, 6)}</span>
                                <span className="opacity-50 text-sm">(${formatAmount(amount0Usd || 0, 2)})</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 justify-between">
                            <div className="flex gap-2 items-center">
                                <CurrencyLogo className="inline" currency={amount1?.currency} size={20} />
                                <span>{amount1?.currency?.symbol}</span>
                            </div>

                            <div className="flex gap-1 items-end">
                                <span>{formatAmount(amount1?.toExact() || 0, 6)}</span>
                                <span className="opacity-50 text-sm">(${formatAmount(amount1Usd || 0, 2)})</span>
                            </div>
                        </div>
                    </div>

                    {((isBoostedToken0 && amount0?.greaterThan(ZERO)) || (isBoostedToken1 && amount1?.greaterThan(ZERO))) && (
                        <div className="flex flex-col gap-3 p-4 bg-card-dark rounded-2xl border border-card-border">
                            <h3 className="text-sm font-semibold text-muted-foreground">Receive tokens as:</h3>

                            {isBoostedToken0 && amount0?.greaterThan(ZERO) && (
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">
                                            {token0Unwrap ? unwrappedToken(token0.underlying).symbol : token0.symbol}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {token0Unwrap
                                                ? `Receive ${unwrappedToken(token0.underlying).symbol} (underlying)`
                                                : `Receive ${token0.symbol} (boosted)`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{token0Unwrap ? "Underlying" : "Boosted"}</span>
                                        <Switch
                                            checked={token0Unwrap}
                                            onCheckedChange={setToken0Unwrap}
                                            disabled={isLoading || isPending}
                                        />
                                    </div>
                                </div>
                            )}

                            {isBoostedToken1 && amount1?.greaterThan(ZERO) && (
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">
                                            {token1Unwrap ? unwrappedToken(token1.underlying).symbol : token1.symbol}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {token1Unwrap
                                                ? `Receive ${unwrappedToken(token1.underlying).symbol} (underlying)`
                                                : `Receive ${token1.symbol} (boosted)`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{token1Unwrap ? "Underlying" : "Boosted"}</span>
                                        <Switch
                                            checked={token1Unwrap}
                                            onCheckedChange={setToken1Unwrap}
                                            disabled={isLoading || isPending}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Button variant={"primary"} disabled={isDisabled} onClick={handleCollectFees}>
                        {isLoading || isPending || isPermitLoading ? <Loader /> : needsPermit ? "Sign Permit" : "Collect Fees"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CollectFeesModal;
