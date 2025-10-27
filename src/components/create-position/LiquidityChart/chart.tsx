// import { formatNumber } from "app/functions"
import { BarChart, ResponsiveContainer, XAxis, Bar, Cell, Tooltip } from "recharts";
import { useState } from "react";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { cn } from "@/utils";

interface CustomBarProps {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: "primary" | "accent" | "muted" | "hover";
    percent: number | undefined;
    isCurrent: boolean;
}

interface CustomTooltipProps {
    props: any;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    currentPrice: number | undefined;
    isSorted: boolean;
}

interface ChartProps {
    formattedData: any;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    leftPrice: string | undefined;
    rightPrice: string | undefined;
    currentPrice: number | undefined;
    isSorted: boolean;
    zoom: number;
}

const CustomBar = ({ x, y, width, height, percent, isCurrent, fill }: CustomBarProps) => {
    return (
        <g>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="100%">
                    <stop offset="0" stopColor="#2797ff" />
                    <stop offset="1" stopColor="rgba(35, 133, 222, 0.05)" />
                </linearGradient>
            </defs>
            {percent && (
                <text x={x + 10} y={y - 10} fill="white" fontSize={"14px"} fontWeight={600} textAnchor="middle">{`${percent.toFixed(
                    0
                )}%`}</text>
            )}
            {isCurrent && (
                <text x={x + 10} y={y - 10} className="fill-text-100" fontSize={"14px"} fontWeight={600} textAnchor="middle">
                    Current Price
                </text>
            )}
            <rect
                x={x}
                y={y}
                className={cn(
                    fill === "primary"
                        ? "fill-primary-200"
                        : fill === "accent"
                        ? "fill-accent"
                        : fill === "muted"
                        ? "fill-muted"
                        : "fill-accent-foreground"
                )}
                width={width > 0 ? width : 0}
                height={height}
                rx="4"
            />
        </g>
    );
};

const CustomTooltip = ({ props, currencyA, currencyB }: CustomTooltipProps) => {
    const price0 = props?.payload?.[0]?.payload.price0;
    const price1 = props?.payload?.[0]?.payload.price1;
    // const tvlToken0 = props?.payload?.[0]?.payload.tvlToken0
    // const tvlToken1 = props?.payload?.[0]?.payload.tvlToken1

    return (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card-dark backdrop-blur-sm">
            <div className="flex gap-4 justify-between">
                <div>{`${currencyA?.symbol} Price:`}</div>
                <div>{`${
                    price0
                        ? `${Number(price0).toLocaleString(undefined, {
                              maximumSignificantDigits: 3,
                          })} ${currencyB?.symbol}`
                        : ""
                }`}</div>
            </div>
            <div className="flex gap-4 justify-between">
                <div>{`${currencyB?.symbol} Price:`}</div>
                <div>{`${
                    price1
                        ? `${Number(price1).toLocaleString(undefined, {
                              maximumSignificantDigits: 3,
                          })} ${currencyA?.symbol}`
                        : ""
                }`}</div>
            </div>
            {/* {currentPrice && price0 && currentPrice > price1 ? <div className="flex gap-4 justify-between">
            <div>{`${currencyA?.symbol} Locked: `}</div>
            <div>{`${tvlToken0 ? formatNumber(tvlToken0) : ''} ${currencyA?.symbol}`}</div>
        </div> : <div className="flex gap-4 justify-between">
            <div>{`${currencyB?.symbol} Locked: `}</div>
            <div>{`${tvlToken1 ? formatNumber(tvlToken1) : ''} ${currencyB?.symbol}`}</div>
        </div>} */}
        </div>
    );
};

export function Chart({ formattedData, currencyA, currencyB, leftPrice, rightPrice, currentPrice, isSorted, zoom }: ChartProps) {
    const [focusBar, setFocusBar] = useState<number | undefined>(undefined);

    return (
        <ResponsiveContainer width={"100%"} height={250}>
            <BarChart
                data={formattedData}
                margin={{
                    top: 30,
                    right: 0,
                    left: 0,
                    bottom: 0,
                }}
                barCategoryGap={zoom > 30 ? 3 : 1.5}
                onMouseMove={(state) => {
                    if (state.isTooltipActive) {
                        setFocusBar(state.activeTooltipIndex);
                    } else {
                        setFocusBar(undefined);
                    }
                }}
            >
                <Tooltip
                    cursor={false}
                    content={(props) => (
                        <CustomTooltip
                            props={props}
                            currencyA={currencyA}
                            currencyB={currencyB}
                            currentPrice={currentPrice}
                            isSorted={isSorted}
                        />
                    )}
                />

                <XAxis
                    reversed={isSorted}
                    tick={(props) => {
                        if (!props?.payload || props.index % 2 === 0) return <text></text>;

                        return (
                            <text
                                className="fill-primary-foreground"
                                x={props.x}
                                y={props.y + 20}
                                textAnchor="middle"
                                fontSize={"12px"}
                                width={"12px"}
                            >
                                {Number(props.payload.value).toFixed(3)}
                            </text>
                        );
                    }}
                    dataKey={isSorted ? "price0" : "price1"}
                    interval={6}
                    offset={0}
                    tickLine={false}
                    tickFormatter={(v) => Number(v).toFixed(3)}
                />

                <Bar
                    className="fill-muted"
                    dataKey="activeLiquidity"
                    isAnimationActive={false}
                    shape={(props) => {
                        const price = props[isSorted ? "price0" : "price1"];
                        let percent = 0;
                        if (price === +Number(leftPrice).toFixed(8) || price === +Number(rightPrice).toFixed(8)) {
                            const currentPriceIdx = formattedData.findIndex((v: any) => v.isCurrent);
                            const currentPriceRealIndex = formattedData[currentPriceIdx].index;
                            percent =
                                (props.payload.index < currentPriceRealIndex ? -1 : 1) *
                                ((Math.max(props.payload.index, currentPriceRealIndex) -
                                    Math.min(props.payload.index, currentPriceRealIndex)) /
                                    currentPriceRealIndex) *
                                100;
                        }

                        return (
                            <CustomBar
                                height={props.height}
                                width={props.width}
                                x={props.x}
                                y={props.y}
                                fill={props.fill}
                                percent={percent}
                                isCurrent={props.isCurrent}
                            />
                        );
                    }}
                >
                    {formattedData?.map((entry: any, index: number) => {
                        let fill = "muted";

                        const value = isSorted ? entry.price0 : entry.price1;

                        if (focusBar === index) {
                            fill = "hover";
                        } else if (entry.isCurrent) {
                            fill = "accent";
                        } else if (leftPrice && rightPrice) {
                            if (Number(value) >= Number(leftPrice) && Number(value) <= Number(rightPrice)) {
                                fill = "primary";
                            }
                        }

                        return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
