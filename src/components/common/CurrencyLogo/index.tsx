import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import { Address } from "wagmi";
import USDTLogo from "@/assets/tokens/usdt.png";
import USDCLogo from "@/assets/tokens/usdc.svg";
import WBTCLogo from "@/assets/tokens/wbtc.svg";
import EtherLogo from "@/assets/tokens/ether.svg";
import WxdaiLogo from "@/assets/tokens/wxdai-logo.png";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyLogoProps {
  currency: Currency | undefined | null;
  size: number;
  className?: string;
  style?: React.CSSProperties;
}
type SpecialToken = { id: Address; symbol: string; logo: string };

const specialTokens: SpecialToken[] = [
  {
    id: "0x94373a4919b3240d86ea41593d5eba789fef3848",
    symbol: "ETH",
    logo: EtherLogo,
  },
  {
    id: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
    symbol: "USDT",
    logo: USDTLogo,
  },
  {
    id: "0x9dad8a1f64692adeb74aca26129e0f16897ff4bb",
    symbol: "WBTC",
    logo: WBTCLogo,
  },
  {
    id: "0x6581e59a1c8da66ed0d313a0d4029dce2f746cc5",
    symbol: "USDC",
    logo: USDCLogo,
  },
  {
    id: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
    symbol: "WXDAI",
    logo: WxdaiLogo,
  },
];

const CurrencyLogo = ({
  currency,
  size = 24,
  className,
  style = {},
}: CurrencyLogoProps) => {
  if (!currency)
    return (
      <Skeleton
        className={cn(`flex rounded-full bg-card-dark`, className)}
        style={{
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          width: `${size}px`,
          height: `${size}px`,
          ...style,
        }}
      />
    );

  const address = currency.wrapped?.address?.toLowerCase() as Address;

  const classString = cn(
    `w-[${size}px] h-[${size}px] min-w-[${size}px] min-h-[${size}px] bg-card-dark rounded-full`,
    className
  );

  const selectedSpecialToken = specialTokens.find(
    (token) => token.id.toLowerCase() === address.toLowerCase()
  );
  if (selectedSpecialToken) {
    return (
      <img
        src={selectedSpecialToken.logo}
        alt={selectedSpecialToken.symbol}
        width={size}
        height={size}
        className={classString}
        style={style}
      />
    );
  }

  if (currency.isNative) {
    return (
      <img
        src={EtherLogo}
        alt={"ETH"}
        width={size}
        height={size}
        className={classString}
        style={style}
      />
    );
  }

  return (
    <div
      className={`${classString} flex items-center justify-center bg-white text-black`}
      style={{
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
    >
      {currency.symbol?.slice(0, 2)}
    </div>
  );
};

export default CurrencyLogo;
