import { ChainId, Currency, WNATIVE } from "@cryptoalgebra/integral-sdk";
import React from "react";
import USDTLogo from "@/assets/tokens/usdt.png";
import USDCLogo from "@/assets/tokens/usdc.svg";
import EtherLogo from "@/assets/tokens/ether.svg";
import TOKENLogo from "@/assets/algebra-logo.png";
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
    [WNATIVE[ChainId.Ethereum].wrapped.address.toLowerCase()]: {
        symbol: "ETH",
        logo: EtherLogo,
    },
    ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase()]: {
        symbol: "USDC",
        logo: USDCLogo,
    },
    ["0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase()]: {
        symbol: "USDT",
        logo: USDTLogo,
    },
    ["0x253f3460bc16074b960f80421d72e6fa6ef786c8"]: {
        symbol: "TOKEN",
        logo: TOKENLogo,
    },
    ["0x6fA0BE17e4beA2fCfA22ef89BF8ac9aab0AB0fc9".toLowerCase()]: {
        symbol: "A7A5",
        logo: "https://etherscan.io/token/images/a7a5_32.svg",
    },
    ["0xf442ff10b8def89514560a66c0ad28777094636a".toLowerCase()]: {
        symbol: "wA7A5",
        logo: "https://etherscan.io/token/images/wrapa7a5_64.png",
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
