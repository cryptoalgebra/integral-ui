import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import { EternalFarming } from '@/graphql/generated/graphql';
import { useFarmUnstake } from '@/hooks/farming/useFarmStake';
import { FormattedPosition } from '@/types/formatted-position';
import { ADDRESS_ZERO } from '@cryptoalgebra/integral-sdk';
import { useAccount } from 'wagmi';

interface ClosedFarmingCardProps {
    positionInEndedFarming: EternalFarming;
    selectedPosition: FormattedPosition;
}

const ClosedFarmingCard = ({
    positionInEndedFarming,
    selectedPosition,
}: ClosedFarmingCardProps) => {
    const { address: account } = useAccount();

    const farmingArgs = {
        tokenId: BigInt(selectedPosition.id ?? 0),
        rewardToken: positionInEndedFarming.rewardToken,
        bonusRewardToken: positionInEndedFarming.bonusRewardToken,
        pool: positionInEndedFarming.pool,
        nonce: positionInEndedFarming.nonce,
        account: account ?? ADDRESS_ZERO,
    };

    const { onUnstake, isLoading: isUnstaking } = useFarmUnstake(farmingArgs);

    return (
        <Button disabled={isUnstaking} onClick={onUnstake}>
            {isUnstaking ? <Loader /> : 'Exit from farming'}
        </Button>
    );
};

export default ClosedFarmingCard;
