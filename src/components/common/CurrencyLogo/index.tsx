import { ChainId, Currency, WNATIVE } from "@cryptoalgebra/integral-sdk";
import React from "react";
import USDCLogo from "@/assets/tokens/usdc.svg";
import EtherLogo from "@/assets/tokens/adi.png";
import { cn } from "@/utils/common/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { Address } from "viem";
import { TOKENS } from "config";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties;
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    [WNATIVE[ChainId.ADI].wrapped.address.toLowerCase()]: {
        symbol: "ETH",
        logo: EtherLogo,
    },
    [TOKENS[ChainId.ADI].USDC.address.toLowerCase()]: {
        symbol: "USDC",
        logo: USDCLogo,
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
        return <img src={EtherLogo} alt={"ETH"} width={size} height={size} className={classString} style={style} />;
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
