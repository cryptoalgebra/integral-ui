import { useAccount } from "wagmi";
import { PredictionTradesTable } from "../";
import { usePredictionUserInfo } from "../../hooks";
import { PredictionMarket } from "../../types";

export function PredictionInfo({ market }: { market: PredictionMarket }) {
    const { address: account } = useAccount();
    const { data: user } = usePredictionUserInfo(account, market.id);

    return <div className="flex">{user && <PredictionTradesTable trades={user.trades} />}</div>;
}
