import { Currency, WNATIVE, ChainId } from "@cryptoalgebra/integral-sdk";
import React from "react";
import EtherLogo from "@/assets/tokens/ether.svg";
import USDGLogo from "@/assets/tokens/usdg.png";
import { cn } from "@/utils/common/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { Address } from "viem";
import { TOKENS } from "config/tokens";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties;
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    [WNATIVE[ChainId.Robinhood].address]: {
        symbol: "ETH",
        logo: EtherLogo,
    },
    [TOKENS[ChainId.Robinhood].USDG.address]: {
        symbol: "USDG",
        logo: USDGLogo,
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
