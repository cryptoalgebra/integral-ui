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
import { usePendingTransactions } from "@/state/pendingTransactionsStore";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { cn, truncateHash } from "@/utils";
import Settings from "../Settings";

const Header = () => (
    <header className="md:px-8 px-4 z-50 flex h-full md:backdrop-blur-2xl max-md:border-b border-card-border left-0 top-0 absolute md:fixed w-full max-h-[72px] md:max-h-[82px] justify-between md:justify-between items-center gap-4">
        <nav className="w-fit flex gap-4 h-full py-2">
            <Algebra />
            <Navigation />
        </nav>
        <AccountActions />
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

const AccountActions = () => {
    return (
        <div className="flex h-full justify-end max-h-[64px] gap-4 whitespace-nowrap items-center">
            <div className="flex py-2 gap-2 h-full">
                <TransactionHistoryAction />
                <Settings />
                <NetworkSelectorAction />
                <WalletAction />
            </div>
        </div>
    );
};

const NetworkSelectorAction = () => {
    const { open } = useAppKit();

    const { caipNetwork: currentNetwork } = useAppKitNetwork();

    return (
        <Button
            className="flex gap-2 h-full min-w-fit rounded-full border border-card-border"
            variant={"icon"}
            size={"sm"}
            onClick={() => open({ view: "Networks" })}
        >
            <img src={currentNetwork?.assets?.imageUrl} width={20} height={20} />
            <ChevronDown size={20} />
        </Button>
    );
};

const TransactionHistoryAction = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const pendingTransactions = usePendingTransactions();

    const { address: account } = useAccount();

    const accountTransactions = account ? pendingTransactions[account] : undefined;

    const showTxHistory = accountTransactions ? Object.keys(accountTransactions).length > 0 : false;

    const pendingTxCount = accountTransactions
        ? Object.entries(accountTransactions).filter(([, transaction]) => transaction.loading).length
        : 0;

    if (!showTxHistory || !accountTransactions) {
        return null;
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {pendingTxCount > 0 ? (
                    <Button
                        size={"sm"}
                        className="flex font-normal items-center my-auto h-full px-3 justify-center gap-2 cursor-pointer hover:bg-primary-button/80 border border-card bg-primary-button rounded-full transition-all duration-200"
                        aria-label="Transaction history"
                    >
                        <Loader size={20} />
                        <span>{pendingTxCount}</span>
                        <span>Pending</span>
                    </Button>
                ) : (
                    <Button
                        variant={"icon"}
                        size={"sm"}
                        className="flex gap-2 min-h-12 min-w-12 rounded-full border border-card-border"
                        aria-label="Transaction history"
                    >
                        <Clock size={20} />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                className="w-fit max-h-80 flex flex-col gap-4 -translate-x-28 translate-y-2 max-xl:-translate-x-8 max-xs:-translate-x-4"
                sideOffset={6}
            >
                Transaction History
                <hr />
                <ul className="flex flex-col gap-3 w-64 overflow-auto ">
                    {Object.entries(accountTransactions)
                        .reverse()
                        .map(([hash, transaction]) => (
                            <TransactionCard key={hash} hash={hash as Address} transaction={transaction} />
                        ))}
                </ul>
            </PopoverContent>
        </Popover>
    );
};

const WalletAction = () => {
    const { open } = useAppKit();

    const { address: account } = useAccount();

    return (
        <Button
            className={cn("flex h-12 w-12 md:w-full gap-2 rounded-full border border-card-border")}
            onClick={() => open()}
            variant={account ? "icon" : "primary"}
            size={"sm"}
        >
            <WalletIcon size={16} className="md:hidden" />
            <span className="max-md:hidden">{account ? truncateHash(account) : "Connect Wallet"}</span>
        </Button>
    );
};

export default Header;
