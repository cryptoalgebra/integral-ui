export const brushHandlePath = (height: number) =>
    [
        "M 0 0",
        `v ${height}`,
        "M -5.5 -5.5",
        "a 5.5 5.5 0 1 1 11 0",
        "a 5.5 5.5 0 1 1 -11 0",
        "z",
    ].join(" ");

export const brushHandleAccentPath = () =>
    [
        "M -10.5 -5.5",
        "a 10.5 10.5 0 1 1 21 0",
        "a 10.5 10.5 0 1 1 -21 0",
        "z",
    ].join(" ");

export function OffScreenHandle({
    color,
    size = 10,
    margin = 10,
}: {
    color: string;
    size?: number;
    margin?: number;
}) {
    return (
        <polygon
            points={`0 0, ${size} ${size}, 0 ${size}`}
            transform={` translate(${size + margin}, ${margin}) rotate(45) `}
            fill={color}
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
        />
    );
}
