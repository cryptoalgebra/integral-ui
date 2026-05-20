import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Checkbox } from "@/components/ui/checkbox";
import { truncateHash } from "@/utils";
import { cn } from "@/utils/common/cn";
import { Token } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

export interface MintableTokenRow {
    address: Address;
    symbol: string;
    name: string;
    decimals: number;
    tokenEntity: Token;
}

interface TokenRowProps {
    token: MintableTokenRow;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
}

const TokenRow = ({ token, checked, disabled, onCheckedChange }: TokenRowProps) => {
    return (
        <label
            className={cn(
                "w-full p-3 bg-card-light border cursor-pointer border-card-border rounded-lg hover:border-primary/35 flex items-center justify-between gap-3",
                checked && "border-primary/35",
                disabled && "opacity-60",
            )}
        >
            <div className="min-w-0 flex items-center gap-3">
                <CurrencyLogo currency={token.tokenEntity} size={28} />

                <div className="min-w-0 flex flex-col">
                    <span className="font-semibold leading-none">{token.symbol}</span>
                    <span className="text-sm text-muted-foreground truncate">{token.name}</span>
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{truncateHash(token.address, 6, 4)}</span>
                <Checkbox checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
            </div>
        </label>
    );
};

export default TokenRow;
