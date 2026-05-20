import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import BTCLogo from "@/assets/tokens/wbtc.svg";
import USDCLogo from "@/assets/tokens/usdc.svg";
import EtherLogo from "@/assets/tokens/ether.svg";
import ProjectXLogo from "@/assets/tokens/project-x.jpg";
import TOKENLogo from "@/assets/algebra-logo.svg";
import YesLogo from "@/assets/tokens/yes.png";
import NoLogo from "@/assets/tokens/no.png";
import BaseLogo from "@/assets/tokens/base.svg";
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
    ["0x4200000000000000000000000000000000000006"]: {
        symbol: "ETH",
        logo: EtherLogo,
    },
    ["0xabac6f23fdf1313fc2e9c9244f666157ccd32990"]: {
        symbol: "USDC",
        logo: USDCLogo,
    },
    ["0x50d22384026efc4b5bd3734a7456bfab35c929a4"]: {
        symbol: "BTC",
        logo: BTCLogo,
    },
    ["0x253f3460bc16074b960f80421d72e6fa6ef786c8"]: {
        symbol: "TOKEN",
        logo: TOKENLogo,
    },
    ["0x0ebdc0b736b34207f6e8abe10c282b4003021a22"]: {
        symbol: "PROJECTX",
        logo: ProjectXLogo,
    },
    ["0x1111111111111111111111111111111111111111"]: {
        symbol: "YES",
        logo: YesLogo,
    },
    ["0x2222222222222222222222222222222222222222"]: {
        symbol: "NO",
        logo: NoLogo,
    },
    ["0xc414eb715a9644349d6870362703ae119586555e"]: {
        symbol: "BASE",
        logo: BaseLogo,
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
