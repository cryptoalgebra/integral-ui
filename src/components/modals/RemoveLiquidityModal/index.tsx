import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBurnActionHandlers } from "@/state/burnStore";
import { useEffect } from "react";

interface RemoveLiquidityModalProps {
    positionId: string;
}

const RemoveLiquidityModal = ({ positionId }: RemoveLiquidityModalProps) => {

    console.log(positionId)
    // const [sliderValue, setSliderValue] = useState(0);

    // const { address: account } = useAccount();

    // const { position } = usePosition(positionId);

    // const { percent } = useBurnState();

    // const derivedInfo = useDerivedBurnInfo(position, false);

    // const {
    //     position: positionSDK,
    //     liquidityPercentage,
    //     liquidityValue0,
    //     // liquidityValue1,
    //     feeValue0,
    //     feeValue1,
    // } = derivedInfo;

    const { onPercentSelect } = useBurnActionHandlers();


    // function changeSliderValue(val: number) {
    //     setSliderValue(val);
    //     onPercentSelect(val);
    // }

    // const { calldata, value } = useMemo(() => {
    //     if (
    //         !positionSDK ||
    //         !positionId ||
    //         !liquidityPercentage ||
    //         !feeValue0 ||
    //         !feeValue1 ||
    //         !account ||
    //         !liquidityValue0 ||
    //         percent === 0
    //     )
    //         return { calldata: undefined, value: undefined };

    //     return NonfungiblePositionManager.removeCallParameters(positionSDK, {
    //         tokenId: positionId,
    //         liquidityPercentage,
    //         slippageTolerance: new Percent(1, 100),
    //         deadline: Date.now() + 300,
    //         collectOptions: {
    //             expectedCurrencyOwed0: feeValue0,
    //             expectedCurrencyOwed1: feeValue1,
    //             recipient: account,
    //         },
    //     });
    // }, [
    //     positionId,
    //     positionSDK,
    //     // slippage,
    //     // txDeadline,
    //     feeValue0,
    //     feeValue1,
    //     liquidityPercentage,
    //     account,
    //     percent,
    // ]);

    // const { config: removeLiquidityConfig } = usePrepareAlgebraPositionManagerMulticall({
    //     args: calldata && [calldata as `0x${string}`[]],
    //     value: BigInt(value || 0),
    //     onSuccess() {
    //         // generateToast(
    //         //   'Transaction sent',
    //         //   'Your transaction has been submitted to the network',
    //         //   'loading'
    //         // );
    //     },
    //     onError() {
    //         // generateToast(
    //         //   'Error meanwhile waiting for transaction',
    //         //   error.message,
    //         //   'error'
    //         // );
    //     },
    // });

    // const { write: removeLiqudiity } = useContractWrite(removeLiquidityConfig)

    useEffect(() => {
        return () => onPercentSelect(0);
    }, []);

    return <Dialog>
        <DialogTrigger asChild>
            <Button>Remove Liquidity</Button>
        </DialogTrigger>
        <DialogContent className="min-w-[500px] rounded-3xl" style={{ borderRadius: '32px' }}>
            <DialogHeader>
                <DialogTitle>Remove Liquidity</DialogTitle>
            </DialogHeader>

            {/* <h1>{sliderValue}</h1> */}
            {/* <Slider defaultValue={[50]} max={100} step={1} onValueChange={changeSliderValue} /> */}

        </DialogContent>
    </Dialog>

}

export default RemoveLiquidityModal;