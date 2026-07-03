import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import BTCLogo from "@/assets/tokens/wbtc.svg";
import USDCLogo from "@/assets/tokens/usdc.svg";
import USDCBlackLogo from "@/assets/tokens/usdc-black.png";
import USDTBlackLogo from "@/assets/tokens/usdt-black.png";
import m4626Logo from "@/assets/tokens/m4626.png";
import WTSGOVLogo from "@/assets/tokens/wtsgov.png";
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
    ["0x6045450424c527bee1a2638d822d11bbca4f2a46"]: {
        symbol: "AVUSDC",
        logo: USDCLogo,
    },
    ["0x65fe07029aef84048eb01a81b6d2bf86becea77f"]: {
        symbol: "AUSDT",
        logo: USDTBlackLogo,
    },
    ["0x39d39e0807a20615445c69e2b1bfead87dcec9e1"]: {
        symbol: "AUSC",
        logo: USDCBlackLogo,
    },
    ["0xf115d73823b3268aaaa58691a3778c08dee77a91"]: {
        symbol: "AVETH",
        logo: EtherLogo,
    },
    ["0x4db3fba9958f7ee9715875e485ceae299714029c"]: {
        symbol: "m4626",
        logo: m4626Logo,
    },
    ["0x0acae280cc7695e5bbbd6fb4b5b1b39c9594638d"]: {
        symbol: "USDC",
        logo: USDCLogo,
    },
    ["0xdDC1FD535E7243f43465094f43Ee8a03A5189acd"]: {
        symbol: "USDC",
        logo: USDCLogo,
    },
    ["0x980447AbF3B26B41c7f1777C2A8dF41cCd62ace6"]: {
        symbol: "WTSGOV",
        logo: WTSGOVLogo,
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
