import { ChainId, Currency, WNATIVE } from "@cryptoalgebra/custom-pools-sdk";
import React from "react";
import USDTLogo from "@/assets/tokens/usdt.png";
import NXPCLogo from "@/assets/tokens/nxpc.png";
import { cn } from "@/utils/common/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { Address } from "viem";
import { STABLECOINS } from "config/tokens";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties;
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    [WNATIVE[ChainId.Henesys].address.toLowerCase()]: {
        symbol: "NXPC",
        logo: NXPCLogo,
    },
    [STABLECOINS[ChainId.Henesys].USDT.address.toLowerCase()]: {
        symbol: "USDT",
        logo: USDTLogo,
    },
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

    if (address in specialTokens) {
        return (
            <img
                src={specialTokens[address].logo}
                alt={specialTokens[address].symbol}
                width={size}
                height={size}
                className={classString}
                style={style}
            />
        );
    }

    if (currency.isNative) {
        return <img src={NXPCLogo} alt={"NXPC"} width={size} height={size} className={classString} style={style} />;
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
