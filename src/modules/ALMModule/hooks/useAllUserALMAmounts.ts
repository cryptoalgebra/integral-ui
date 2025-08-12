import { useEthersSigner } from "@/hooks/common/useEthersProvider";
import { getAllUserAmounts } from "@cryptoalgebra/alm-sdk";
import useSWR from "swr";
import { Address } from "viem";

export function useAllUserALMAmounts(account: Address | undefined) {
    const signer = useEthersSigner();

    return useSWR(account && signer ? ["allUserVaults", account, signer] : null, async () => getAllUserAmounts(account!, signer!));
}
