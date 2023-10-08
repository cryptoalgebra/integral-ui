import Card from "@/components/common/Card";

const PositionAPR = () => {

    return <Card>
        <div className="min-w-[200px] h-full flex flex-col gap-2 items-center justify-center">
            <div className="text-[20px] font-bold">APR</div>
            <div className="text-[#FF78D9] text-[48px] font-bold drop-shadow-[0_0_5px_rgba(255,120,217,0.7)]">12%</div>
        </div>
    </Card>

}

export default PositionAPR;