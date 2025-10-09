import { Button } from "@/components/ui/button";
import { useVeTOKENRewards, useVeTOKENs } from "../../hooks";
import { CreateLockModal } from "../CreateLockModal";
import { useCallback, useMemo } from "react";
import { LocksTable } from "../Table";
import { isDefined } from "@/utils";

export const LocksList = () => {
    const { veTOKENs, isLoading: isVeTOKENsLoading, refetch: refetchVeTOKENs } = useVeTOKENs();
    const { data: veRewards, isLoading: veRewardsLoading, refetch: refetchVeTOKENRewards } = useVeTOKENRewards();

    const extendedVePositions = useMemo(() => {
        if (!veTOKENs || !veRewards) return [];

        return veTOKENs
            .map((veTOKEN) => {
                const reward = veRewards.find((reward) => reward.tokenId === veTOKEN.tokenId);
                return reward ? { ...veTOKEN, ...reward } : null;
            })
            .filter(isDefined);
    }, [veTOKENs, veRewards]);

    const handleRefetch = useCallback(() => {
        refetchVeTOKENs();
        refetchVeTOKENRewards();
    }, [refetchVeTOKENs, refetchVeTOKENRewards]);

    const isLoading = isVeTOKENsLoading || veRewardsLoading;

    return (
        <>
            {!isLoading && (!veTOKENs || veTOKENs.length === 0) && <NoVeTOKENPositions />}
            {veTOKENs && veTOKENs.length > 0 && (
                <div className="flex flex-col min-h-[377px] w-full pb-8 bg-card border border-card-border/60 rounded-xl">
                    <LocksTable data={extendedVePositions} refetch={handleRefetch} loading={isLoading} />
                </div>
            )}
        </>
    );
};

const NoVeTOKENPositions = () => (
    <div className="flex flex-col items-start w-full gap-4 p-6 bg-card border border-card-border rounded-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-left">You have no veTOKEN locks</h2>
        <p className="text-md font-semibold">Let's create one!</p>
        <CreateLockModal>
            <Button>Get veTOKEN</Button>
        </CreateLockModal>
    </div>
);
