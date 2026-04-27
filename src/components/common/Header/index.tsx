// import AlgebraIntegral from "@/assets/algebra-itegral.svg";
import AlgebraLogo from "@/assets/algebra-logo.png";
import A7A5Logo from "@/assets/a7a5-logo.svg";
import NewAlgebraLogo from "@/assets/new-algebra-logo.png";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock, WalletIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type CSSProperties, useEffect, useState } from "react";
import { Address } from "viem";
import { TransactionCard } from "../TransactionCard";
import { useAccount } from "wagmi";
import { usePendingTransactions, usePendingTransactionsStore } from "@/state/pendingTransactionsStore";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { cn, truncateHash } from "@/utils";
import Settings from "../Settings";
import { Navigation } from "../Navigation";
import { Link } from "react-router-dom";
import Loader from "../Loader";

const HEADER_SCROLL_RANGE = 20;

const Header = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        let frameId: number | null = null;

        const updateScrollProgress = () => {
            const nextProgress = Math.round(Math.min(window.scrollY / HEADER_SCROLL_RANGE, 1) * 100) / 100;

            setScrollProgress((currentProgress) => (currentProgress === nextProgress ? currentProgress : nextProgress));
            frameId = null;
        };

        const handleScroll = () => {
            if (frameId !== null) return;

            frameId = window.requestAnimationFrame(updateScrollProgress);
        };

        updateScrollProgress();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }

            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const borderOpacity = Math.round(scrollProgress * 70);
    const desktopPaddingY = `${(2 - scrollProgress).toFixed(2)}rem`;

    const headerStyle: CSSProperties = {
        borderBottomColor:
            borderOpacity > 0 ? `color-mix(in srgb, var(--bg-300) ${borderOpacity}%, transparent)` : "transparent",
    };

    const headerContentStyle = {
        "--header-padding-y-mobile": "1rem",
        "--header-padding-y-desktop": desktopPaddingY,
    } as CSSProperties;

    return (
        <header
            className="fixed w-full top-0 z-20 border-b transition-all duration-150 ease-out backdrop-blur-xl"
            style={headerStyle}
        >
            <div
                className="max-w-[1280px] relative mx-auto flex w-full items-center justify-between gap-2 px-4 py-[var(--header-padding-y-mobile)] transition-[padding] duration-150 ease-out md:py-[var(--header-padding-y-desktop)]"
                style={headerContentStyle}
            >
                <Algebra />
                <nav className="flex absolute left-1/2 min-w-0 -translate-x-1/2 items-center gap-8 lg:gap-10">
                    <Navigation />
                </nav>
                <Account />
            </div>
        </header>
    );
};

export const Algebra = () => (
    <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 max-md:hidden">
            <Link target="_blank" to={"https://algebra.finance"}>
                <img src={NewAlgebraLogo} width={140} />
            </Link>
            <X size={16} />
            <Link target="_blank" to={"https://a7a5.kg"}>
                <img src={A7A5Logo} width={72} />
            </Link>
            {/* <span className="font-medium leading-wide text-2xl mt-[5px] text-primary">A7A5</span> */}
        </div>
        <img className="md:hidden" src={AlgebraLogo} width={48} height={48} />
        {/* <div className="flex items-center justify-center min-w-[32px] min-h-[32px]">
            <img src={AlgebraLogo} width={32} height={32} />
        </div>
        <img className="invert min-w-[140px]" src={AlgebraIntegral} width={140} height={25} /> */}
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
                {account && <Settings />}
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
