import { usePredictionUserInfo } from "@/hooks/prediction/useUserInfo";
import { useAccount } from "wagmi";
import PredictionTradesTable from "../PredictionTradesTable";

const PredictionInfo = () => {

    const { address: account } = useAccount()
    const { data: user } = usePredictionUserInfo(account)

    return <div className="flex">
            { user && <PredictionTradesTable trades={user.trades} /> }
    </div>

};

export default PredictionInfo;