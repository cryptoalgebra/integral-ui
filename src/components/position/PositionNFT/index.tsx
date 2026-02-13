import { NONFUNGIBLE_POSITION_MANAGER } from "config";
import { useReadNonfungiblePositionManagerTokenUri } from "@/generated";
import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { ExternalLinkIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useChainId } from "wagmi";

interface PositionNFTProps {
    positionId: number;
}

const PositionNFT = ({ positionId }: PositionNFTProps) => {
    const chainId = useChainId();

    const { data: uri } = useReadNonfungiblePositionManagerTokenUri({
        args: positionId ? [BigInt(positionId)] : undefined,
    });

    const imgRef = useRef<any>();

    const json = uri && JSON.parse(atob(uri.slice("data:application/json;base64,".length)));

    const openSeaLink = `https://${chainId === ChainId.MegaethMainnet ? "testnets." : ""}opensea.io/assets/base/${
        NONFUNGIBLE_POSITION_MANAGER[chainId]
    }/${positionId}`;

    useEffect(() => {
        if (!imgRef?.current || !json) return;

        imgRef.current.src = json.image;
    }, [imgRef, json]);

    return (
        <div className="inline-block relative w-[160px] h-[160px] overflow-hidden rounded-full">
            {json ? (
                <img ref={imgRef} style={{ transform: "scale(2)" }} className="mt-4 absolute" />
            ) : (
                <div className="w-full h-full bg-white/10"></div>
            )}
            {json && (
                <div className="absolute w-full h-full flex items-center justify-center duration-200 bg-black/40 opacity-0 hover:opacity-100">
                    <a
                        href={openSeaLink}
                        target={"_blank"}
                        rel={"noreferrer noopener"}
                        className="inline-flex gap-2 p-2 hover:bg-gray-600/60 rounded-xl"
                    >
                        <span className="font-semibold">OpenSea</span>
                        <ExternalLinkIcon />
                    </a>
                </div>
            )}
        </div>
    );
};

export default PositionNFT;
