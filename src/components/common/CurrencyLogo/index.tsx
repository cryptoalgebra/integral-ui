import { Currency } from "@cryptoalgebra/sdk";
import React from "react";
import { Address } from "wagmi";
import USDTLogo from '@/assets/tokens/usdt.png'
import USDCLogo from '@/assets/tokens/usdc.svg'
import WBTCLogo from '@/assets/tokens/wbtc.svg'
import EtherLogo from '@/assets/tokens/ether.svg'
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties
}


export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    ['0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7']: {
        symbol: 'SEI',
        logo: EtherLogo
    },
    ['0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9']: {
        symbol: 'USDT',
        logo: USDTLogo
    },
    ['0x9dad8a1f64692adeb74aca26129e0f16897ff4bb']: {
        symbol: 'WBTC',
        logo: WBTCLogo
    },
    ['0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1']: {
        symbol: 'USDC',
        logo: USDCLogo
    }
}


const CurrencyLogo = ({ currency, size, className, style = {} }: CurrencyLogoProps) => {

    if (!currency) return <Skeleton className={cn(`flex rounded-full bg-card-dark`, className)} style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }} />

    const address = currency.wrapped.address.toLowerCase() as Address;

    const classString = cn(`w-[${size}px] h-[${size}px] min-w-[${size}px] min-h-[${size}px] bg-card-dark rounded-full`, className)

    if (address in specialTokens) {
        return <img src={specialTokens[address].logo} alt={specialTokens[address].symbol} width={size} height={size} className={classString} style={style} />
    }

    if (currency.isNative) {
        return <img src={WBTCLogo} alt={'SEI'} width={size} height={size} className={classString} style={style} />
    }

    return <div className={`${classString} flex items-center justify-center bg-white text-black`} style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }}>
        {currency.symbol?.slice(0, 2)}
    </div>

}

export default CurrencyLogo;
