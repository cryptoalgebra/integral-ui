import { Navigation } from "@/components/common/Navigation";
import AlgebraIntegral from "@/assets/clamm-logo.svg";
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

const Header = () => (
    <header className="md:sticky top-2 z-10 flex h-full max-h-[64px] mt-4 justify-between md:justify-between items-center gap-4">
        <nav className="w-fit flex gap-8 h-full py-2">
            <Algebra />
            <Navigation />
        </nav>
        <Account />
    </header>
);

export const Algebra = () => (
    <div className="flex items-center  gap-2 w-full p-2">
        <NavLink to={"/"}>
            <div className="flex items-center gap-2 md:mr-2 rounded-3xl duration-200">
                {/* <div className="flex items-center justify-center w-[32px] h-[32px] rounded-lg">
                    <img src={AlgebraLogo} width={25} height={25} />
                </div> */}
                <img className="max-lg:hidden mb-2" src={AlgebraIntegral} width={140} height={25} />
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
            <div className="flex p-2 gap-2 h-full">
                {showTxHistory && (
                    <TransactionHistoryPopover>
                        {pendingTxCount > 0 ? (
                            <Button
                                className="flex font-normal items-center my-auto h-full px-3 justify-center gap-2 cursor-pointer hover:bg-primary-button/80 border border-card bg-primary-button rounded-lg transition-all duration-200"
                                aria-label="Transaction history"
                            >
                                <Loader />
                                <span>{pendingTxCount}</span>
                                <span>Pending</span>
                            </Button>
                        ) : (
                            <Button
                                variant={"icon"}
                                size={"md"}
                                className="flex font-normal items-center my-auto h-full px-3 justify-center gap-2 cursor-pointerrounded-3xl transition-all duration-200 border border-card-border px-4"
                                aria-label="Transaction history"
                            >
                                <Clock size={20} />
                            </Button>
                        )}
                    </TransactionHistoryPopover>
                )}
                <Settings />
                <Button
                    className="flex gap-2 h-full rounded-lg border border-card-border"
                    variant={"icon"}
                    size={"sm"}
                    onClick={() => open({ view: "Networks" })}
                >
                    <img src={currentNetwork?.assets?.imageUrl} width={20} height={20} /> <ChevronDown size={20} />
                </Button>
                <Button
                    className={cn(
                        "flex gap-2 h-full rounded-lg border border-card-border",
                        account ? "hover:bg-primary-100/30 border-primary" : "bg-white text-black hover:bg-white/75"
                    )}
                    onClick={() => open()}
                    variant={"icon"}
                    size={"sm"}
                >
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
