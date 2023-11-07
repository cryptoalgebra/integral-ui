import { ALGEBRA_POSITION_MANAGER } from "@/constants/addresses";
import { useAlgebraPositionManagerTokenUri } from "@/generated";
import { ExternalLinkIcon } from "lucide-react";
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

    const openSeaLink = `https://testnets.opensea.io/assets/goerli/${ALGEBRA_POSITION_MANAGER}/${positionId}`

    useEffect(() => {

        if (!imgRef?.current || !json) return

        imgRef.current.src = json.image

    }, [imgRef, json])

    return <div className="inline-block relative w-[160px] h-[160px] overflow-hidden rounded-full">
        <img ref={imgRef} style={{ transform: 'scale(2)' }} className="mt-4 absolute" />
        <div className="absolute w-full h-full flex items-center justify-center duration-200 bg-black/40 opacity-0 hover:opacity-100">
            <a href={openSeaLink} target={'_blank'} rel={'noreferrer noopener'} className="inline-flex gap-2 p-2 hover:bg-gray-600/60 rounded-xl">
                <span className="font-semibold">OpenSea</span>
                <ExternalLinkIcon />
            </a>
        </div>
    </div>
}

export default PositionNFT;