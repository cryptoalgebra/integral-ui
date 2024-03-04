import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import { Address } from "wagmi";
import EthLogo from '@/assets/tokens/ether.svg'
import USDTLogo from '@/assets/tokens/usdt.png'
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties
}

export const specialTokens: { [key: Address]: { symbol: string; logo: string } } = {
    ['0x94373a4919b3240d86ea41593d5eba789fef3848']: {
        symbol: 'ETH',
        logo: EthLogo
    },
    ['0x7d98346b3b000c55904918e3d9e2fc3f94683b01']: {
        symbol: 'USDT',
        logo: USDTLogo
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