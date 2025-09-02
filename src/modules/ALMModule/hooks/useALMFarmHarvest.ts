import { useAccount } from "wagmi";
import { UserALMVault } from "./useUserALMVaults";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { useCallback, useState } from "react";
import { Address } from "viem";
import { harvest } from "@cryptoalgebra/alm-sdk";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";

export function useALMFarmHarvest(almPosition: UserALMVault) {
    const { address: account } = useAccount();
    const signer = useEthersProvider();
    const [isPending, setIsPending] = useState(false);
    const [harvestHash, setHarvestHash] = useState<Address>();

    const onHarvest = useCallback(async () => {
        if (!account || !signer) return;

        setIsPending(true);

        try {
            const tx = await harvest(account, almPosition.vault.id, signer);
            setHarvestHash(tx.hash as Address);
        } catch (e) {
            console.log(e);
        } finally {
            setIsPending(false);
        }
    }, [account, almPosition.vault.id, signer]);

    const { isLoading, isSuccess } = useTransactionAwait(harvestHash, {
        title: "Harvest farming rewards",
        type: TransactionType.FARM,
    });

    return {
        isLoading: isLoading || isPending,
        isSuccess,
        onHarvest,
    };
}
