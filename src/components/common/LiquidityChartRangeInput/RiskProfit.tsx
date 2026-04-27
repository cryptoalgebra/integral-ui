import { useMemo } from "react";

interface IInteractive {
    title: string;
    value: number[];
}

function Interactive({ title, value }: IInteractive) {
    const borderColor = title === "Profit" ? "rgba(16, 182, 139, 1)" : "#F26262";
    const fillColor = title === "Profit" ? "rgba(16, 182, 139, 0.4)" : "rgba(242, 98, 98, 0.4)";

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs">{title}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v, i) => (
                    <div
                        key={v}
                        className="relative h-3 w-3 overflow-hidden rounded-xs border bg-card-dark"
                        style={{
                            borderColor: value[i] ? borderColor : "transparent",
                        }}
                    >
                        <div
                            className="absolute h-3 w-3"
                            style={{
                                backgroundColor: fillColor,
                                left: `calc(-120% + ${value[i]}%)`,
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RiskProfit({ priceUpper, priceLower, price }: { priceUpper: number; priceLower: number; price: number }) {
    const risk = useMemo(() => {
        if (!priceUpper || !priceLower || !price) return 0;

        const upperPercent = 100 - (+price / +priceUpper) * 100;
        const lowerPercent = Math.abs(100 - (+price / +priceLower) * 100);

        const rangePercent = +priceLower > +price && +priceUpper > 0 ? upperPercent - lowerPercent : upperPercent + lowerPercent;

        if (rangePercent < 7.5) {
            return 5;
        }
        if (rangePercent < 15) {
            return (15 - rangePercent) / 7.5 + 4;
        }
        if (rangePercent < 30) {
            return (30 - rangePercent) / 15 + 3;
        }
        if (rangePercent < 60) {
            return (60 - rangePercent) / 30 + 2;
        }
        if (rangePercent < 120) {
            return (120 - rangePercent) / 60 + 1;
        }
        return 1;
    }, [price, priceLower, priceUpper]);

    const RPValues = useMemo(() => {
        if (price < priceLower || price > priceUpper) {
            return [100, 100, 100, 100, 100];
        }
        const res: number[] = [];
        const split = risk?.toString().split(".");

        if (!split) return [];

        for (let i = 0; i < 5; i += 1) {
            if (i < +split[0]) {
                res.push(100);
            } else if (i === +split[0]) {
                res.push(parseFloat(`0.${split[1]}`) * 100);
            } else {
                res.push(0);
            }
        }

        return res;
    }, [risk]);

    return (
        <div className="flex items-center gap-4">
            <Interactive title="Profit" value={RPValues} />
            <Interactive title="Risk" value={RPValues} />
        </div>
    );
}
