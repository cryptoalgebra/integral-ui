import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import { Address } from "wagmi";
import EthLogo from '@/assets/tokens/ether.svg'
import USDTLogo from '@/assets/tokens/usdt.png'
import USDCLogo from '@/assets/tokens/usdc.svg'
import WBTCLogo from '@/assets/tokens/wbtc.svg'
import ZkTestLogo from '@/assets/tokens/zksync.svg'
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    ['0x20b28b1e4665fff290650586ad76e977eab90c5d']: {
        symbol: 'ETH',
        logo: EthLogo
    },
    ['0x5aefba317baba46eaf98fd6f381d07673bca6467']: {
        symbol: 'USDT',
        logo: USDTLogo
    },
    ['0x49a390a3dfd2d01389f799965f3af5961f87d228']: {
        symbol: 'WBTC',
        logo: WBTCLogo
    },
    ['0x809689bce54aaf05d5729772657fd7f62af685d8']: {
        symbol: 'USDC',
        logo: USDCLogo
    },
    ['0x77d7ae70ba9b9f220795db6c9d04d24f4fb87f71']: {
        symbol: 'ZKTEST',
        logo: ZkTestLogo
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
        return <img src={EthLogo} alt={'ETH'} width={size} height={size} className={classString} style={style} />
    }

    return <div className={`${classString} bg-white text-black`} style={style}>
        {currency.symbol?.slice(0, 2)}
    </div>

}

export default CurrencyLogo;