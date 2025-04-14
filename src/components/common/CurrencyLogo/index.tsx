import { Currency } from "@cryptoalgebra/sdk";
import React from "react";
import { Address } from "wagmi";
import WBTCLogo from "@/assets/tokens/wbtc.svg";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TOKENS } from "@/constants/tokens";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties;
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    [TOKENS.TON.address.toLowerCase()]: {
        symbol: "TON",
        logo: "https://cache.tonapi.io/imgproxy/0boBDKrVQY502vqLLXqwwZTS87PyqSQq0hke-x11lqs/rs:fill:200:200:1/g:no/aHR0cHM6Ly90b25jby5pby9zdGF0aWMvdG9rZW4vVE9OX1RPS0VOLndlYnA.webp",
    },
    [TOKENS.X.address.toLowerCase()]: {
        symbol: "X",
        logo: "https://xempire.io/token/x.png",
    },
    [TOKENS.durev.address.toLowerCase()]: {
        symbol: "durev",
        logo: "https://durev.xyz/images/256-b.png",
    },
    ["0x10253594A832f967994b44f33411940533302ACb".toLowerCase()]: {
        symbol: "WTAC",
        logo: "https://avatars.githubusercontent.com/u/187664190?s=200&v=4",
    },
};

const CurrencyLogo = ({ currency, size, className, style = {} }: CurrencyLogoProps) => {
    if (!currency)
        return (
            <Skeleton
                className={cn(`flex rounded-full bg-card-dark`, className)}
                style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }}
            />
        );

    const address = currency.wrapped.address.toLowerCase() as Address;

    const classString = cn(`w-[${size}px] h-[${size}px] min-w-[${size}px] min-h-[${size}px] bg-card-dark rounded-full`, className);

    if (address in specialTokens) {
        return (
            <img
                src={specialTokens[address.toLowerCase() as Address].logo}
                alt={specialTokens[address.toLowerCase() as Address].symbol}
                width={size}
                height={size}
                className={classString}
                style={style}
            />
        );
    }

    if (currency.isNative) {
        return <img src={WBTCLogo} alt={"ETH"} width={size} height={size} className={classString} style={style} />;
    }

    return (
        <div
            className={`${classString} flex items-center justify-center bg-white text-black`}
            style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }}
        >
            {currency.symbol?.slice(0, 2)}
        </div>
    );
};

export default CurrencyLogo;
