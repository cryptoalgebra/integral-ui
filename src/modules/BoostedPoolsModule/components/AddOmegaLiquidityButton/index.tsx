import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_NAME, OMEGA_ROUTER } from "config";
import { IDerivedMintInfo, useMintState } from "@/state/mintStore";
import { useUserState } from "@/state/userStore";
import { Field, Percent } from "@cryptoalgebra/custom-pools-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { OmegaMintOptions } from "@cryptoalgebra/omega-router-sdk";
import { useOmegaMintCallback } from "../../hooks/useOmegaMintCallback";
import { usePermit2 } from "../../hooks";
import { AllowanceState } from "../../types";

interface AddOmegaLiquidityButtonProps {
    mintInfo: IDerivedMintInfo;
    poolAddress?: Address;
    tokenId?: number;
    handleCloseModal?: () => void;
}

const ZERO_PERCENT = new Percent("0");
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export const AddOmegaLiquidityButton = ({ mintInfo, poolAddress, tokenId, handleCloseModal }: AddOmegaLiquidityButtonProps) => {
    const { address: account } = useAccount();

    const { open } = useAppKit();

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    const { txDeadline } = useUserState();

    const isIncreaseMode = tokenId !== undefined;

    const { token0InputMode: tokenAInputMode, token1InputMode: tokenBInputMode } = useMintState();

    const { token0, token1 } = mintInfo?.position?.pool || {};
    const { CURRENCY_A: tokenA, CURRENCY_B: tokenB } = mintInfo.currencies;

    const isSorted = useMemo(() => {
        return tokenA && tokenB && tokenA.wrapped.sortsBefore(tokenB.wrapped);
    }, [tokenA, tokenB]);

    const isBoostedToken0 = token0 && token0.isBoosted;
    const isBoostedToken1 = token1 && token1.isBoosted;

    const shouldWrapToken0 = isBoostedToken0 ? (isSorted ? tokenAInputMode === "underlying" : tokenBInputMode === "underlying") : false;
    const shouldWrapToken1 = isBoostedToken1 ? (isSorted ? tokenBInputMode === "underlying" : tokenAInputMode === "underlying") : false;
    const chainId = useChainId();

    const token0ForApproval = isSorted ? mintInfo.parsedAmounts[Field.CURRENCY_A] : mintInfo.parsedAmounts[Field.CURRENCY_B];
    const token1ForApproval = isSorted ? mintInfo.parsedAmounts[Field.CURRENCY_B] : mintInfo.parsedAmounts[Field.CURRENCY_A];

    const isSameTokens = token0ForApproval && token1ForApproval && token0ForApproval.currency.equals(token1ForApproval.currency);

    // Use Permit2 for both tokens (skip native tokens)
    const permit2Token0 = usePermit2({
        amount: token0ForApproval?.currency.isNative || isSameTokens ? undefined : token0ForApproval,
        spender: OMEGA_ROUTER[chainId],
    });

    const permit2Token1 = usePermit2({
        amount: token1ForApproval?.currency.isNative
            ? undefined
            : isSameTokens
            ? token1ForApproval.add(token0ForApproval)
            : token1ForApproval,
        spender: OMEGA_ROUTER[chainId],
    });

    const token0Permit =
        !token0ForApproval?.currency.isNative && permit2Token0.state === AllowanceState.ALLOWED && permit2Token0.permitSignature
            ? permit2Token0.permitSignature
            : undefined;

    const token1Permit =
        !token1ForApproval?.currency.isNative && permit2Token1.state === AllowanceState.ALLOWED && permit2Token1.permitSignature
            ? permit2Token1.permitSignature
            : undefined;

    const useNative = token0ForApproval?.currency.isNative || token1ForApproval?.currency.isNative;

    const mintOptions: OmegaMintOptions | null = useMemo(() => {
        if (!account) return null;

        const amount0Underlying = shouldWrapToken0 && token0ForApproval ? token0ForApproval : undefined;
        const amount1Underlying = shouldWrapToken1 && token1ForApproval ? token1ForApproval : undefined;

        return {
            slippageTolerance: mintInfo.outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
            recipient: account,
            deadline: Date.now() + txDeadline,
            useNative,
            createPool: mintInfo.noLiquidity,
            deployer: mintInfo.pool?.deployer as Address,
            token0Permit: token0Permit || null,
            token1Permit: token1Permit || null,
            amount0Underlying,
            amount1Underlying,
            tokenId,
        };
    }, [
        mintInfo,
        account,
        txDeadline,
        useNative,
        shouldWrapToken0,
        shouldWrapToken1,
        token0Permit,
        token1Permit,
        token0ForApproval,
        token1ForApproval,
        tokenId,
    ]);

    const { callback: addLiquidity, isLoading: isAddingLiquidityLoading, error: mintError } = useOmegaMintCallback(
        mintInfo.position,
        mintOptions,
        poolAddress,
        handleCloseModal
    );

    // Check if we need approval or permit for token0
    const needsToken0ApprovalOrPermit =
        !token0ForApproval?.currency.isNative &&
        permit2Token0.state === AllowanceState.REQUIRED &&
        (permit2Token0.needsSetupApproval || permit2Token0.needsPermitSignature);

    // Check if we need approval or permit for token1
    const needsToken1ApprovalOrPermit =
        !token1ForApproval?.currency.isNative &&
        permit2Token1.state === AllowanceState.REQUIRED &&
        (permit2Token1.needsSetupApproval || permit2Token1.needsPermitSignature);

    const isReady = useMemo(() => {
        return Boolean(
            (mintInfo.depositADisabled ? true : !needsToken0ApprovalOrPermit) &&
                (mintInfo.depositBDisabled ? true : !needsToken1ApprovalOrPermit) &&
                !mintInfo.errorMessage &&
                !mintInfo.invalidRange
        );
    }, [mintInfo, needsToken0ApprovalOrPermit, needsToken1ApprovalOrPermit]);

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account)
        return (
            <Button variant={"primary"} onClick={() => open()}>
                Connect Wallet
            </Button>
        );

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    if (mintInfo.errorMessage)
        return (
            <Button variant={"primary"} disabled>
                {mintInfo.errorMessage}
            </Button>
        );

    // Show approval/permit buttons for token0
    if (needsToken0ApprovalOrPermit && permit2Token0.state === AllowanceState.REQUIRED) {
        const { needsSetupApproval, needsPermitSignature, approveAndPermit, token, isLoading } = permit2Token0;

        if (needsSetupApproval && needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={approveAndPermit} disabled={isLoading}>
                    {isLoading ? <Loader /> : `Approve & Sign Permit for ${token.symbol}`}
                </Button>
            );
        }

        if (needsSetupApproval) {
            return (
                <Button variant={"primary"} onClick={permit2Token0.approve} disabled={isLoading}>
                    {isLoading ? <Loader /> : `Approve ${token.symbol}`}
                </Button>
            );
        }

        if (needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={permit2Token0.permit} disabled={isLoading}>
                    {isLoading ? <Loader /> : `Sign Permit for ${token.symbol}`}
                </Button>
            );
        }
    }

    // Show approval/permit buttons for token1
    if (needsToken1ApprovalOrPermit && permit2Token1.state === AllowanceState.REQUIRED) {
        const { needsSetupApproval, needsPermitSignature, approveAndPermit, token, isLoading } = permit2Token1;

        if (needsSetupApproval && needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={approveAndPermit} disabled={isLoading}>
                    {isLoading ? <Loader /> : `Approve & Sign Permit for ${token.symbol}`}
                </Button>
            );
        }

        if (needsSetupApproval) {
            return (
                <Button variant={"primary"} onClick={permit2Token1.approve} disabled={isLoading}>
                    {isLoading ? <Loader /> : `Approve ${token.symbol}`}
                </Button>
            );
        }

        if (needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={permit2Token1.permit} disabled={isLoading}>
                    {isLoading ? <Loader /> : `Sign Permit for ${token.symbol}`}
                </Button>
            );
        }
    }

    if (mintError)
        return (
            <Button variant={"primary"} disabled>
                {mintError}
            </Button>
        );

    return (
        <Button
            variant={"primary"}
            disabled={!isReady || isAddingLiquidityLoading || !addLiquidity}
            onClick={() => {
                try {
                    addLiquidity?.();
                } catch (e) {
                    console.error(e);
                }
            }}
        >
            {isAddingLiquidityLoading ? <Loader /> : isIncreaseMode ? "Add Liquidity" : "Create Position"}
        </Button>
    );
};
