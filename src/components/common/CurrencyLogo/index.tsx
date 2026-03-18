import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import React from "react";
import BTCLogo from "@/assets/tokens/wbtc.svg";
import USDTLogo from "@/assets/tokens/usdt.png";
import EtherLogo from "@/assets/tokens/ether.svg";
import TOKENLogo from "@/assets/algebra-logo.svg";
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
    ["0x0000000000000000000000000000000000000400"]: {
        symbol: "ETH",
        logo: EtherLogo,
    },
    ["0x9f068c81ab7743ea7b2d48c0feceadafcad2c95c"]: {
        symbol: "USDT",
        logo: USDTLogo,
    },
    ["0xaff9ae92ef4362117d64fe51c20011a6ee456815"]: {
        symbol: "BTC",
        logo: BTCLogo,
    },
    ["0x253f3460bc16074b960f80421d72e6fa6ef786c8"]: {
        symbol: "TOKEN",
        logo: TOKENLogo,
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
