import { TokenSelector } from "@/components/common/TokenSelector";
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaHeader,
    CredenzaDescription,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import { Currency } from "@cryptoalgebra/integral-sdk";

interface ITokenSelectorModal {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    onSelect: (currency: Currency) => void;
    otherCurrency: Currency | null | undefined;
    children: React.ReactNode;
    showNativeToken?: boolean;
}

const TokenSelectorModal = ({ isOpen, setIsOpen, onSelect, otherCurrency, children, showNativeToken }: ITokenSelectorModal) => {
    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent
                className="overflow-hidden border border-border bg-card p-0 shadow-sm md:max-w-lg"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader className="border-b border-border px-4 py-4 md:px-5">
                    <CredenzaTitle className="text-xl font-medium tracking-tight text-text">Select a token</CredenzaTitle>
                    <CredenzaDescription className="text-sm text-text-muted">Search by symbol, name, or token address.</CredenzaDescription>
                </CredenzaHeader>
                <CredenzaBody className="px-4 pb-4 md:px-5">
                    <TokenSelector showNativeToken={showNativeToken} onSelect={onSelect} otherCurrency={otherCurrency} />
                </CredenzaBody>
            </CredenzaContent>
        </Credenza>
    );
};

export default TokenSelectorModal;
