import { useReadNonfungiblePositionManagerTokenUri } from "@/generated";
import { cn } from "@/utils/common/cn";
import { useEffect, useRef } from "react";

export const FarmingPositionImg = ({
    positionId,
    size,
    className,
    isALM,
}: {
    positionId: string;
    size: number;
    className?: string;
    isALM?: boolean;
}) => {
    const { data: uri } = useReadNonfungiblePositionManagerTokenUri({
        args: isALM ? [1n] : [BigInt(positionId)],
    });

    const imgRef = useRef<any>();
    const json = uri && JSON.parse(atob(uri.slice("data:application/json;base64,".length)));

    useEffect(() => {
        if (!imgRef?.current || !json) return;
        imgRef.current.src = json.image;
    }, [imgRef, json]);

    return (
        <div
            className={cn("rounded-full flex items-center justify-center overflow-hidden", className)}
            style={{
                background: "linear-gradient(181.1deg, #686EFF 0.93%, #141520 99.07%)",
                width: `${size * 4}px`,
                height: `${size * 4}px`,
                maxWidth: `${size * 4}px`,
                maxHeight: `${size * 4}px`,
                minWidth: `${size * 4}px`,
                minHeight: `${size * 4}px`,
            }}
        >
            {json ? <img ref={imgRef} className="w-full h-full object-cover" alt={`position ${positionId}`} /> : <p>{positionId}</p>}
        </div>
    );
};
