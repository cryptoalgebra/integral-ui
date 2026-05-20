import { cn } from "@/utils";
import { enabledModules } from "config/app-modules";
import { ArrowUpDown, ContrastIcon, Droplets, LucideLineChart, MoreHorizontal, ShoppingBag, Vote } from "lucide-react";
import { useState } from "react";
import { matchPath, NavLink, useLocation } from "react-router-dom";
import { Credenza, CredenzaBody, CredenzaContent, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";

const PATHS = {
    SWAP: "/swap",
    LIMIT_ORDERS: "limit-order",
    PREDICTION: "prediction/*",
    PREDICTIONS: "/predictions",
    POOLS: "/pools",
    POOL: "/pool/*",
    ANALYTICS: "/analytics/*",
    VE_TOKEN: "/vetoken/*",
    VOTE: "/vote/*",
};

const menuItems = [
    {
        title: "Trade",
        link: "/swap",
        active: [PATHS.SWAP, PATHS.LIMIT_ORDERS, PATHS.PREDICTION],
        icon: <ArrowUpDown size={20} />,
    },
    {
        title: "Pools",
        link: "/pools",
        active: [PATHS.POOLS, PATHS.POOL],
        icon: <Droplets size={20} />,
    },
    ...(enabledModules.Ve33Module
        ? [
              {
                  title: "veTOKEN",
                  link: "/vetoken",
                  active: [PATHS.VE_TOKEN],
                  icon: <ContrastIcon size={20} />,
              },
              {
                  title: "Vote",
                  link: "/vote",
                  active: [PATHS.VOTE],
                  icon: <Vote size={20} />,
              },
          ]
        : []),
    enabledModules.AnalyticsModule && {
        title: "Analytics",
        link: "/analytics",
        active: [PATHS.ANALYTICS],
        icon: <LucideLineChart size={20} />,
    },
    enabledModules.PredictionModule && {
        title: "Predictions",
        link: "/predictions",
        active: [PATHS.PREDICTIONS],
        icon: <ShoppingBag size={20} />,
    },
].filter(Boolean) as { title: string; link: string; active: string[]; icon?: React.ReactNode }[];

type MenuItem = typeof menuItems[number];

const isActivePath = (paths: string[], pathname: string) => paths.some((path) => matchPath(path, pathname));

export function NavButtons({ items = menuItems }: { items?: MenuItem[] }) {
    const { pathname } = useLocation();

    const setNavlinkClasses = (paths: string[]) =>
        isActivePath(paths, pathname) ? "font-bold text-primary-200" : "text-text-200 hover:text-primary-200";

    return (
        <>
            {items.map((item) => (
                <NavLink
                    key={`nav-item-${item.link}`}
                    to={{ pathname: item.link }}
                    className={cn(
                        "flex items-center justify-center gap-1 w-fit min-w-10 h-full px-4 transition-all duration-200",
                        setNavlinkClasses(item.active),
                    )}
                >
                    <div className="text-lg md:hidden">{item.icon}</div>
                    <span className="font-medium max-md:text-sm">{item.title}</span>
                </NavLink>
            ))}
        </>
    );
}

function MobileMoreMenu({ items }: { items: MenuItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();

    const hasActiveHiddenItem = items.some((item) => isActivePath(item.active, pathname));

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                <button
                    className={cn(
                        "flex items-center justify-center gap-1 w-fit min-w-10 h-full px-4 transition-all duration-200",
                        hasActiveHiddenItem ? "font-bold text-primary-200" : "text-text-200 hover:text-primary-200",
                    )}
                >
                    <div className="text-lg md:hidden">
                        <MoreHorizontal size={20} />
                    </div>
                    <span className="font-medium max-md:text-sm">More</span>
                </button>
            </CredenzaTrigger>

            <CredenzaContent
                className="bg-card md:max-w-[340px] md:rounded-xl!"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader>
                    <CredenzaTitle className="font-bold select-none">More</CredenzaTitle>
                </CredenzaHeader>

                <CredenzaBody>
                    <div className="flex flex-col gap-2 pb-4 md:pb-0">
                        {items.map((item) => (
                            <NavLink
                                key={`mobile-more-item-${item.link}`}
                                to={{ pathname: item.link }}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg border border-card-border bg-card-light px-3 py-2.5 transition-colors",
                                    isActivePath(item.active, pathname)
                                        ? "text-primary-200 border-primary-200/40"
                                        : "text-text-200 hover:text-primary-200",
                                )}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.title}</span>
                            </NavLink>
                        ))}
                    </div>
                </CredenzaBody>
            </CredenzaContent>
        </Credenza>
    );
}

export function Navigation() {
    return (
        <ul className="flex w-full h-full gap-2 whitespace-nowrap items-center max-md:hidden">
            <NavButtons />
        </ul>
    );
}
export function MobileNavigation() {
    const mobilePrimaryItems = menuItems.slice(0, 2);
    const mobileSecondaryItems = menuItems.slice(2);

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-card-border backdrop-blur-xl">
            <div className="flex h-16 w-full items-center justify-around px-2">
                <NavButtons items={mobilePrimaryItems} />
                {mobileSecondaryItems.length > 0 && <MobileMoreMenu items={mobileSecondaryItems} />}
            </div>
        </nav>
    );
}
