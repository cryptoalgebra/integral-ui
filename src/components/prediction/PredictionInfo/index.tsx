import { usePredictionUserInfo } from "@/hooks/prediction/useUserInfo";
import { useAccount } from "wagmi";
import PredictionTradesTable from "../PredictionTradesTable";
import { PredictionMarket } from "@/types/prediction";

const PredictionInfo = ({ market }: { market: PredictionMarket }) => {

    const { address: account } = useAccount()
    const { data: user } = usePredictionUserInfo(account, market.id)

    return <div className="flex">
            { user && <PredictionTradesTable trades={user.trades} /> }
    </div>

};

export default PredictionInfo;