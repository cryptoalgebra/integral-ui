import { useAlgebraPositionManagerTokenUri } from "@/generated";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export const FarmingPositionImg = ({ positionId, className }: { positionId: bigint; className?: string }) => {
    const { data: uri } = useAlgebraPositionManagerTokenUri({
        args: [positionId],
    });

    const imgRef = useRef<any>();

    const json = uri && JSON.parse(atob(uri.slice("data:application/json;base64,".length)));

    useEffect(() => {
        if (!imgRef?.current || !json) return;

        imgRef.current.src = json.image;
    }, [imgRef, json]);

    return (
        <div
            className={cn("rounded-full flex items-center justify-center overflow-hidden w-12", className)}
            style={{
                background: "linear-gradient(181.1deg, #686EFF 0.93%, #141520 99.07%)",
            }}
        >
            {json ? <img ref={imgRef} className="scale-[2]" /> : <p>{positionId.toString()}</p>}
        </div>
    );
};
