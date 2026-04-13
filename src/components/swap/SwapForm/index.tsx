import { FormContainer } from "@/components/common/FormContainer";
import { SwapPageView } from "@/pages/Swap/types";
import { IDerivedSwapInfo } from "@/state/swapStore";
import { SwapTypeSelector } from "../SwapTypeSelector";
import SwapButton from "../SwapButton";
import SwapPair from "../SwapPair";
import SwapParams from "../SwapParams";

export function SwapForm({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) {
    return (
        <>
            <FormContainer>
                <SwapTypeSelector type={SwapPageView.SWAP} />
                <SwapPair derivedSwap={derivedSwap} />
                <SwapParams derivedSwap={derivedSwap} />
            </FormContainer>
            <SwapButton derivedSwap={derivedSwap} />
        </>
    );
}
