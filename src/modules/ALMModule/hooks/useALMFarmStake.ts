import { Address } from "viem";
import { useCallback, useState } from "react";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { useAccount } from "wagmi";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { FormattedPosition } from "@/types/formatted-position";
import { stake, unstake } from "@cryptoalgebra/alm-sdk";
import { UserALMVault } from "./useUserALMVaults";

export function useALMFarmStake(formattedPosition: FormattedPosition | undefined) {
    const { address: account } = useAccount();
    const signer = useEthersProvider();
    const [isPending, setIsPending] = useState(false);
    const [almStakeHash, setAlmStakeHash] = useState<Address>();

    const onStake = useCallback(async () => {
        if (!account || !signer || !formattedPosition) return;

        setIsPending(true);

        if (!formattedPosition?.almShares || !formattedPosition?.almVaultAddress) return;

        try {
            const tx = await stake(account, formattedPosition.almVaultAddress, signer, formattedPosition.almShares);
            setAlmStakeHash(tx.hash as Address);
        } catch (e) {
            console.error(e);
        } finally {
            setIsPending(false);
        }
    }, [account, formattedPosition?.almShares, formattedPosition?.almVaultAddress, signer]);

    const { isLoading, isSuccess } = useTransactionAwait(almStakeHash, {
        title: "Stake ALM position",
        type: TransactionType.FARM,
    });

    return {
        isLoading: isLoading || isPending,
        isSuccess,
        onStake,
    };
}

export function useALMFarmUnstake(almPosition: UserALMVault) {
    const { address: account } = useAccount();
    const signer = useEthersProvider();
    const [isPending, setIsPending] = useState(false);
    const [unstakeHash, setUnstakeHash] = useState<Address>();

    const onUnstake = useCallback(async () => {
        if (!account || !signer) return;

        setIsPending(true);

        const shares = almPosition.shares;
        try {
            const tx = await unstake(account, almPosition.vault.id, signer, shares);
            setUnstakeHash(tx.hash as Address);
        } catch (e) {
            console.log(e);
        } finally {
            setIsPending(false);
        }
    }, [account, almPosition.shares, almPosition.vault.id, signer]);

    const { isLoading, isSuccess } = useTransactionAwait(unstakeHash, {
        title: "Exiting farming",
        type: TransactionType.FARM,
    });

    return {
        isLoading: isLoading || isPending,
        isSuccess,
        onUnstake,
    };
}
