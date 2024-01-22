import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import { Address } from "wagmi";
import BeraLogo from '@/assets/tokens/bera.png'
import USDTLogo from '@/assets/tokens/usdt.png'
import USDCLogo from '@/assets/tokens/usdc.svg'
import WBTCLogo from '@/assets/tokens/wbtc.svg'
import HoneyLogo from '@/assets/tokens/honey.png'
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    ['0x5806e416da447b267cea759358cf22cc41fae80f']: {
        symbol: 'BERA',
        logo: BeraLogo
    },
    ['0x5aefba317baba46eaf98fd6f381d07673bca6467']: {
        symbol: 'USDT',
        logo: USDTLogo
    },
    ['0x49a390a3dfd2d01389f799965f3af5961f87d228']: {
        symbol: 'WBTC',
        logo: WBTCLogo
    },
    ['0x6581e59a1c8da66ed0d313a0d4029dce2f746cc5']: {
        symbol: 'USDC',
        logo: USDCLogo
    },
    ['0x7eeca4205ff31f947edbd49195a7a88e6a91161b']: {
        symbol: 'HONEY',
        logo: HoneyLogo
    }
}


const CurrencyLogo = ({ currency, size, className, style = {} }: CurrencyLogoProps) => {

    if (!currency) return <Skeleton className={cn(`min-w-[${size}px] min-h-[${size}px] flex rounded-full bg-card`, className)} style={{ width: `${size}px`, height: `${size}px`, ...style }} />

    const address = currency.wrapped.address.toLowerCase() as Address;

    const classString = cn(`min-w-[${size}px] min-h-[${size}px] bg-card-dark rounded-full`, className)

    if (address in specialTokens) {
        return <img src={specialTokens[address].logo} alt={specialTokens[address].symbol} width={size} height={size} className={classString} style={style} />
    }

    if (currency.isNative) {
        return <img src={BeraLogo} alt={'BERA'} width={size} height={size} className={classString} style={style} />
    }

    return <div className={`${classString} bg-white text-black`} style={style}>
        {currency.symbol?.slice(0, 2)}
    </div>

}

export default CurrencyLogo;