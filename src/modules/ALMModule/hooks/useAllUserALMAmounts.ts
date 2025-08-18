import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { getAllUserAmounts } from "@cryptoalgebra/alm-sdk";
import useSWR from "swr";
import { Address } from "viem";

export function useAllUserALMAmounts(account: Address | undefined) {
    const provider = useEthersProvider();

    return useSWR(account && provider ? ["allUserVaults", account, provider] : null, async () => getAllUserAmounts(account!, provider!));
}
