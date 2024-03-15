import CurrencyLogo from '@/components/common/CurrencyLogo';
import TokenSelectorModal from '@/components/modals/TokenSelectorModal';
import { Input } from '@/components/ui/input';
import { Currency } from '@cryptoalgebra/integral-sdk';
import { ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';

interface TokenCardProps {
    value: string;
    currency?: Currency;
    otherCurrency?: Currency;
    handleTokenSelection: (currency: Currency) => void;
    handleValueChange?: (value: string) => void;
    disabled?: boolean;
}

const TokenCard = ({
    value,
    currency,
    otherCurrency,
    handleTokenSelection,
    handleValueChange,
    disabled,
}: TokenCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleInput = useCallback((value: string) => {
        if (!handleValueChange) return;
        if (value === '.') value = '0.';
        handleValueChange(value);
    }, []);

    const handleTokenSelect = (newCurrency: Currency) => {
        setIsOpen(false);
        handleTokenSelection(newCurrency);
    };

    return (
        <div className="flex w-full items-center h-[100px] border border-border bg-card-dark rounded-3xl bg-dark">
            <TokenSelectorModal
                onSelect={handleTokenSelect}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                otherCurrency={otherCurrency}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex w-1/2 p-4 ml-4 rounded-2xl h-3/4 bg-card hover:bg-card-light items-center gap-4 cursor-pointer transition-all ease-in-out duration-200"
                >
                    <CurrencyLogo currency={currency} size={32} />
                    <span className="font-bold text-xl">
                        {currency ? currency.symbol : 'Select a token'}
                    </span>
                    <ChevronRight size={16} />
                </button>
            </TokenSelectorModal>

            <Input
                type={'text'}
                value={value}
                disabled={disabled}
                onUserInput={(v) => handleInput(v)}
                className={`text-right border-none text-xl font-bold w-2/3 pr-8 disabled:cursor-default disabled:text-white`}
                placeholder={'0.00'}
                maxDecimals={currency?.decimals}
            />
        </div>
    );
};

export default TokenCard;
