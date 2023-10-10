import Card from "@/components/common/Card";

const PositionLiquidity = () => {

    return <Card>
        <div className="h-full flex flex-col gap-4 p-6">
            <div className="flex justify-between">
                <div className="flex flex-col text-left gap-2">
                    <div className="text-[14px] font-bold">LIQUIDITY</div>
                    <div className="text-[#78FFD7] text-[32px] font-bold drop-shadow-[0_0_5px_rgba(7,142,253,0.8)]">$20</div>
                </div>
                <div className="flex flex-col text-right gap-2">
                    <div className="text-[14px] font-bold">APR</div>
                    <div className="text-[#78FFD7] text-[32px] font-bold drop-shadow-[0_0_5px_rgba(7,142,253,0.8)]">12%</div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-left">
                    <div>USDC: 12  51%</div>
                    <div>WETH: 1  49%</div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#31a7fd] px-3 py-2 rounded-xl">Add Liquidity</div>
                </div>
            </div>
        </div>
    </Card>

}

export default PositionLiquidity;