import TokenSelectorModal from "@/components/modals/TokenSelectorModal";
import { SwapPageProps } from "./types";
import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import SwapChart from "@/components/swap/SwapChart";

const SwapPage = ({ type }: SwapPageProps) => {

    return <div>
        {/* <TokenSelectorModal/> */}
        <SwapPair />

        <SwapButton />

        <SwapParams/>

        <SwapChart />

    </div>

}

export default SwapPage;