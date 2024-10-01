import { Currency } from "@cryptoalgebra/sdk";
import React from "react";
import { Address } from "wagmi";
import USDTLogo from '@/assets/tokens/usdt.png'
import WBTCLogo from '@/assets/tokens/wbtc.svg'
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    ['0x542fda317318ebf1d3deaf76e0b632741a7e677d']: {
        symbol: 'WRBTC',
        logo: WBTCLogo
    },
    ['0xef213441a85df4d7acbdae0cf78004e1e486bb96']: {
        symbol: 'USDT',
        logo: USDTLogo
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
        return <img src={WBTCLogo} alt={'WRBTC'} width={size} height={size} className={classString} style={style} />
    }

    return <div className={`${classString} flex items-center justify-center bg-white text-black`} style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }}>
        {currency.symbol?.slice(0, 2)}
    </div>

}

export default CurrencyLogo;
