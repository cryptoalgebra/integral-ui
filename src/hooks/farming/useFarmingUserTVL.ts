import { Deposit } from "@/graphql/generated/graphql";
import { FormattedPosition } from "@/types/formatted-position";

export function useFarmingUserTVL({deposits, positionsData}: {deposits: Deposit[], positionsData: FormattedPosition[]}) {
    const TVL = deposits.reduce((acc, deposit) => {
        const currentFormattedPosition = positionsData.find(
            (position) => Number(position.id) === Number(deposit.id)
        );
        if (deposit.eternalFarming !== null && currentFormattedPosition) {
            return acc + currentFormattedPosition.liquidityUSD;
        } else {
            return acc;
        }
    }, 0);

    if (TVL >= 100) return TVL.toFixed();

    if (TVL < 100) return TVL.toFixed(2);
}