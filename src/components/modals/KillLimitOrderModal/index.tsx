import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const KillLimitOrder = () => {

    return <Dialog>
        <DialogTrigger asChild>
            <Button>Kill</Button>
        </DialogTrigger>
        <DialogContent className="min-w-[500px] rounded-3xl" style={{ borderRadius: '32px' }}>
            <DialogHeader>
                <DialogTitle>Remove Liquidity</DialogTitle>
            </DialogHeader>

        

        </DialogContent>
    </Dialog>

}

export default KillLimitOrder;