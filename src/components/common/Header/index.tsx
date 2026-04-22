// import AlgebraIntegral from "@/assets/algebra-itegral.svg";
import AlgebraLogo from "@/assets/algebra-logo.png";
import NewAlgebraIntegral from "@/assets/new-integral-logo.svg";
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
import { cn, truncateHash } from "@/utils";
import Settings from "../Settings";
import { Navigation } from "../Navigation";

const Header = () => (
    <header className="sticky top-0 z-20 backdrop-blur-sm ">
        <div className="max-w-[1280px] mx-auto w-full p-4 flex items-center justify-between gap-6 md:py-8 ">
            <Algebra />
            <nav className="flex min-w-0 items-center gap-8 lg:gap-10">
                <Navigation />
            </nav>
            <Account />
        </div>
    </header>
);

export const Algebra = () => (
    <NavLink to={"/"} className="flex items-center gap-3">
        <img className="max-md:hidden" src={NewAlgebraIntegral} width={220} />
        <img className="md:hidden" src={AlgebraLogo} width={48} height={48} />
        {/* <div className="flex items-center justify-center min-w-[32px] min-h-[32px]">
            <img src={AlgebraLogo} width={32} height={32} />
        </div>
        <img className="invert min-w-[140px]" src={AlgebraIntegral} width={140} height={25} /> */}
    </NavLink>
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
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            <div className="flex items-center gap-2">
                {showTxHistory && (
                    <TransactionHistoryPopover>
                        {pendingTxCount > 0 ? (
                            <Button
                                variant={"primary"}
                                size={"sm"}
                                className="h-8 px-3.5 text-xs font-medium"
                                aria-label="Transaction history"
                            >
                                <Loader />
                                <span>{pendingTxCount}</span>
                                <span>Pending</span>
                            </Button>
                        ) : (
                            <Button variant={"icon"} size={"sm"} className="h-8 px-3" aria-label="Transaction history">
                                <Clock size={20} />
                            </Button>
                        )}
                    </TransactionHistoryPopover>
                )}
                <Settings />
                <Button className="h-8 px-3" variant={"icon"} size={"sm"} onClick={() => open({ view: "Networks" })}>
                    <img src={currentNetwork?.assets?.imageUrl} width={20} height={20} /> <ChevronDown size={20} />
                </Button>
                <Button
                    className={cn("h-8 px-4 text-xs font-medium", account ? "border-border" : "border-transparent")}
                    onClick={() => open()}
                    variant={account ? "secondary" : "primary"}
                    size={"sm"}
                >
                    <WalletIcon size={16} className="md:hidden" />
                    <span className="max-md:hidden">{truncateHash(account as Address) || "Connect"}</span>
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
                <PopoverContent className="flex max-h-90 w-[294px] flex-col gap-4 rounded-xl bg-card -translate-y-1 p-5" sideOffset={10}>
                    <div className="text-sm font-medium text-text">Transaction History</div>
                    <hr className="border-border" />
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
