import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import USDCLogo from "@/assets/tokens/usdc.svg";
import BTCLogo from "@/assets/tokens/wbtc.svg";
import { cn } from "@/utils/common/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { Address } from "viem";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties;
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    ["0x10253594A832f967994b44f33411940533302ACb"]: {
        symbol: "sBTC",
        logo: BTCLogo,
    },
    ["0xd7cB0E0692f2D55A17bA81c1fE5501D66774fC4A"]: {
        symbol: "USDC",
        logo: USDCLogo,
    },
};

const getSpecialToken = (address: Address): { symbol: string; logo: string } | undefined => {
    return Object.entries(specialTokens).find(([key]) => key.toLowerCase() === address.toLowerCase())?.[1];
};

const CurrencyLogo = ({ currency, size, className, style = {} }: CurrencyLogoProps) => {
    if (!currency)
        return (
            <Skeleton
                className={cn(`flex rounded-full bg-white/5 border border-card-border animate-none`, className)}
                style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }}
            />
        );

    const address = currency.wrapped.address.toLowerCase() as Address;

    const classString = cn(`w-[${size}px] h-[${size}px] min-w-[${size}px] min-h-[${size}px] bg-card-dark rounded-full`, className);

    const specialToken = getSpecialToken(address);
    if (specialToken) {
        return <img src={specialToken.logo} alt={specialToken.symbol} width={size} height={size} className={classString} style={style} />;
    }

    if (currency.isNative) {
        return <img src={BTCLogo} alt={"sBTC"} width={size} height={size} className={classString} style={style} />;
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
