import { Button } from "@/components/ui/button";
import { Credenza, CredenzaBody, CredenzaClose, CredenzaContent, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";
import { cn, truncateHash } from "@/utils";
import { useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { CHAIN_IMAGE, DEFAULT_CHAIN_ID, NATIVE_SYMBOL } from "config/default-chain";
import { Copy } from "lucide-react";
import { useState } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";

interface IAccountModal {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    children: React.ReactNode;
}

const AccountModal = ({
    isOpen,
    setIsOpen,
    children,
}: IAccountModal) => {

    const { address: account } = useAccount()
    const { data: balance } = useBalance({
        address: account
    })

    const { disconnect } = useWeb3AuthDisconnect()

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!account) return
        e.stopPropagation();
        navigator.clipboard.writeText(account).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        });
    };

    const handleDisconnect = () => {
        setIsOpen(false)
        disconnect()
    }

    return (
        <Credenza open={isOpen}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent
                className="bg-card-dark !rounded-xl max-w-[360px]"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader>
                    <CredenzaTitle>Account</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-white/60 border rounded-full p-4 shadow-lg">
                        <img src={CHAIN_IMAGE[DEFAULT_CHAIN_ID]} />
                    </div>
                    <div className="flex gap-2">
                        <div className="text-xl font-semibold">{truncateHash(account as Address)}</div>
                        <button
                            className={cn(
                                'relative duration-75 hover:text-black/50 after:absolute after:text-xs after:left-6 after:top-1 after:content-["Copied"] after:duration-100',
                                isCopied ? "after:block" : "after:hidden",
                            )}
                            onClick={handleCopy}
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                    { balance && <div className="flex gap-1 font-semibold text-black/50">
                        <span>{Number(balance.formatted).toFixed(3)}</span>
                        <span>{NATIVE_SYMBOL[DEFAULT_CHAIN_ID]}</span>
                    </div> }
                    <Button
                        variant={"outline"}
                        size={"sm"} 
                        onClick={handleDisconnect}
                    >
                        Disconnect
                    </Button>
                </CredenzaBody>
                <CredenzaClose asChild>
                    <button
                        className="absolute right-4 top-4 rounded-sm opacity-70"
                        onClick={() => setIsOpen(false)}
                        style={{ zIndex: 999 }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                        </svg>
                    </button>
                </CredenzaClose>
            </CredenzaContent>
        </Credenza>
    );
};

export default AccountModal;
