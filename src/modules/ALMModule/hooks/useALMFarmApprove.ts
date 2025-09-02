import { Address } from "viem";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { FormattedPosition } from "@/types/formatted-position";
import { useCurrency } from "@/hooks/common/useCurrency";
import { tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useApprove } from "@/hooks/common/useApprove";
import useSWR from "swr";
import { getFarmingRewardsDistributorAddress } from "@cryptoalgebra/alm-sdk";
import { ApprovalState } from "@/types/approve-state";

export function useALMFarmApprove(formattedPosition: FormattedPosition | undefined) {
    const provider = useEthersProvider();

    const almLPToken = useCurrency(formattedPosition?.almVaultAddress as Address);
    const parsedLPAmount = almLPToken && tryParseAmount(formattedPosition?.almShares || "0", almLPToken);

    const { data: farmingRewardsDistributorAddress, isLoading } = useSWR(
        formattedPosition?.almVaultAddress && provider ? ["farmingRewardsDistributor", formattedPosition.almVaultAddress, provider] : null,
        () => getFarmingRewardsDistributorAddress(formattedPosition!.almVaultAddress!, provider!)
    );

    const { approvalCallback: onApprove, approvalState: almApprovalState } = useApprove(
        parsedLPAmount,
        farmingRewardsDistributorAddress as Address
    );

    return {
        isLoading: isLoading || almApprovalState === ApprovalState.PENDING,
        isSuccess: almApprovalState === ApprovalState.APPROVED,
        onApprove,
    };
}
