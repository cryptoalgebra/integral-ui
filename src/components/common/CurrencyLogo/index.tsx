import { ChainId, Currency } from "@cryptoalgebra/custom-pools-sdk";
import React from "react";
import USDCLogo from "@/assets/tokens/usdc.svg";
import USDTLogo from "@/assets/tokens/usdt.png";
import EtherLogo from "@/assets/tokens/ether.svg";
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
    ["0x4200000000000000000000000000000000000006"]: {
        symbol: "ETH",
        logo: EtherLogo,
    },
    ["0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1".toLowerCase()]: {
        symbol: "ETH",
        logo: EtherLogo,
    },
    [TOKENS[ChainId.Base].USDC.address.toLowerCase()]: {
        symbol: "USDC",
        logo: USDCLogo,
    },
    [TOKENS[ChainId.Base].USDT.address.toLowerCase()]: {
        symbol: "USDT",
        logo: USDTLogo,
    },
    [TOKENS[ChainId.BaseSepolia].USDC.address.toLowerCase()]: {
        symbol: "USDC",
        logo: USDCLogo,
    },
    ["0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A".toLowerCase()]: {
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
