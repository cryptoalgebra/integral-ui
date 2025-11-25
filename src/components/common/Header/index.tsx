import { Navigation } from "@/components/common/Navigation";
import SophonLogo from "@/assets/sophon-logo.png";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock, WalletIcon } from "lucide-react";
import Loader from "../Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { Address } from "viem";
import { TransactionCard } from "../TransactionCard";
import { useAccount } from "wagmi";
import { usePendingTransactions, usePendingTransactionsStore } from "@/state/pendingTransactionsStore";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { truncateHash } from "@/utils";

const Header = () => (
    <header className="md:sticky border-b px-4 top-0 z-10 flex h-full backdrop-blur-[6px] max-h-16 justify-between md:justify-between items-center gap-4 mx-auto w-full">
        <nav className="w-fit flex gap-4 h-full py-2">
            <Algebra />
            <Navigation />
        </nav>
        <Account />
    </header>
);

export const Algebra = () => (
    <div className="flex items-center gap-2 w-full py-2">
        <NavLink to={"/"}>
            <div className="flex items-center gap-2 md:mr-2 rounded-3xl duration-200">
                <div className="flex items-center justify-center w-[50px] h-[50px] rounded-lg">
                    <img src={SophonLogo} width={75} height={75} />
                </div>
            </div>
        </NavLink>
    </div>
);

const Account = () => {
    const { open } = useAppKit();

    const { caipNetwork: currentNetwork } = useAppKitNetwork();

    const { pendingTransactions } = usePendingTransactionsStore();

    const { address: account } = useAccount();

    const showTxHistory = account && pendingTransactions[account] ? Object.keys(pendingTransactions[account]).length > 0 : false;

    const pendingTxCount =
        account && pendingTransactions[account]
            ? Object.entries(pendingTransactions[account]).filter(([, transaction]) => transaction.loading).length
            : 0;

    return (
        <div className="flex h-full justify-end max-h-[64px] gap-4 whitespace-nowrap items-center">
            <div className="flex gap-2 h-full items-center">
                {showTxHistory && (
                    <TransactionHistoryPopover>
                        {pendingTxCount > 0 ? (
                            <Button variant={"secondary"} size={"sm"} aria-label="Transaction history">
                                <Loader color="white" />
                                <span>{pendingTxCount}</span>
                                <span>Pending</span>
                            </Button>
                        ) : (
                            <Button variant={"secondary"} size={"sm"} aria-label="Transaction history">
                                <Clock size={18} />
                            </Button>
                        )}
                    </TransactionHistoryPopover>
                )}
                {/* <Settings /> */}
                <Button variant={"secondary"} size={"sm"} onClick={() => open({ view: "Networks" })}>
                    <img src={currentNetwork?.assets?.imageUrl} width={20} height={20} /> <ChevronDown size={20} />
                </Button>
                <Button onClick={() => open()} variant={"primary"} size={"sm"}>
                    <WalletIcon size={16} className="md:hidden" />
                    <span className="max-md:hidden">{truncateHash(account as Address) || "Connect Wallet"}</span>
                </Button>
            </div>
        </div>
    );
};

const TransactionHistoryPopover = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const pendingTransactions = usePendingTransactions();
    const { address: account } = useAccount();

    if (account)
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>{children}</PopoverTrigger>
                <PopoverContent
                    className="w-fit max-h-80 flex flex-col gap-4 -translate-x-28 translate-y-2 max-xl:-translate-x-8 max-xs:-translate-x-4"
                    sideOffset={6}
                >
                    Transaction History
                    <hr />
                    <ul className="flex flex-col gap-3 w-64 overflow-auto ">
                        {Object.entries(pendingTransactions[account])
                            .reverse()
                            .map(([hash, transaction]) => (
                                <TransactionCard key={hash} hash={hash as Address} transaction={transaction} />
                            ))}
                    </ul>
                </PopoverContent>
            </Popover>
        );
};

export default Header;
