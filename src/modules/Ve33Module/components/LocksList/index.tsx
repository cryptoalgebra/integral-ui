import { Button } from "@/components/ui/button";
import { useVeALGBRewards, useVeALGBs } from "../../hooks";
import { CreateLockModal } from "../CreateLockModal";
import { useCallback, useMemo } from "react";
import { LocksTable } from "../Table";
import { isDefined } from "@/utils";

export const LocksList = () => {
    const { veALGBs, isLoading: isVeALGBsLoading, refetch: refetchVeALGBs } = useVeALGBs();
    const { data: veRewards, isLoading: veRewardsLoading, refetch: refetchVeALGBRewards } = useVeALGBRewards();

    const extendedVePositions = useMemo(() => {
        if (!veALGBs || !veRewards) return [];

        return veALGBs
            .map((veALGB) => {
                const reward = veRewards.find((reward) => reward.tokenId === veALGB.tokenId);
                return reward ? { ...veALGB, ...reward } : null;
            })
            .filter(isDefined);
    }, [veALGBs, veRewards]);

    const handleRefetch = useCallback(() => {
        refetchVeALGBs();
        refetchVeALGBRewards();
    }, [refetchVeALGBs, refetchVeALGBRewards]);

    const isLoading = isVeALGBsLoading || veRewardsLoading;

    return (
        <>
            {!isLoading && (!veALGBs || veALGBs.length === 0) && <NoVeALGBPositions />}
            {veALGBs && veALGBs.length > 0 && (
                <div className="flex flex-col min-h-[377px] w-full pb-8 bg-card border border-card-border/60 rounded-xl">
                    <LocksTable data={extendedVePositions} refetch={handleRefetch} loading={isLoading} />
                </div>
            )}
        </>
    );
};

const NoVeALGBPositions = () => (
    <div className="flex flex-col items-start w-full gap-4 p-6 bg-card border border-card-border rounded-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-left">You have no veALGB locks</h2>
        <p className="text-md font-semibold">Let's create one!</p>
        <CreateLockModal>
            <Button>Get veALGB</Button>
        </CreateLockModal>
    </div>
);
