import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAlgebraPositionManagerTokenUri } from "@/generated";
import { useEffect, useRef } from "react";

interface PositionNFTProps {
    positionId: number;
}

const PositionNFT = ({ positionId }: PositionNFTProps) => {

    const { data: uri } = useAlgebraPositionManagerTokenUri({
        args: positionId ? [BigInt(positionId)] : undefined
    })

    const imgRef = useRef<any>()

    const json = uri && JSON.parse(atob(uri.slice('data:application/json;base64,'.length)))

    useEffect(() => {

        if (!imgRef?.current || !json) return

        imgRef.current.src = json.image

    }, [imgRef, json])

    return <Dialog>
        <DialogTrigger asChild>
            <div className="inline-block relative w-[155px] h-[155px] overflow-hidden rounded-full pointer-events-none">
                <img ref={imgRef} style={{ transform: 'scale(2)' }} className="mt-4" />
            </div>
        </DialogTrigger>
        <DialogContent className="min-w-[500px] min-h-[250px] rounded-3xl p-0" style={{ borderRadius: '32px' }}>
            <div className="relative flex w-full h-full">
                <img ref={imgRef} className="rounded-3xl"></img>
                <div className="absolute bottom-4 right-4 bg-card-light p-2 rounded-xl">View on OpenSea</div>
            </div>
        </DialogContent>
    </Dialog>

}

export default PositionNFT;