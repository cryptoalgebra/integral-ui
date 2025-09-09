import { cn } from "@/utils";
import { enabledModules } from "config/app-modules";
import { ArrowUpDown, Droplets, LucideLineChart } from "lucide-react";
import { matchPath, NavLink, useLocation } from "react-router-dom";

const PATHS = {
    SWAP: "/swap",
    LIMIT_ORDERS: "limit-order",
    POOLS: "/pools",
    POOL: "/pool/*",
    ANALYTICS: "/analytics/*",
};

const menuItems = [
    {
        title: "Trade",
        link: "/swap",
        active: [PATHS.SWAP, PATHS.LIMIT_ORDERS],
        icon: <ArrowUpDown size={20} />,
    },
    {
        title: "Pools",
        link: "/pools",
        active: [PATHS.POOLS, PATHS.POOL],
        icon: <Droplets size={20} />,
    },
    enabledModules.analytics && {
        title: "Analytics",
        link: "/analytics",
        active: [PATHS.ANALYTICS],
        icon: <LucideLineChart size={20} />,
    },
].filter(Boolean) as { title: string; link: string; active: string[]; icon?: React.ReactNode }[];

export function NavButtons() {
    const { pathname } = useLocation();

    const setNavlinkClasses = (paths: string[]) =>
        paths.some((path) => matchPath(path, pathname))
            ? "font-bold border-b border-primary"
            : "text-muted-foreground/70 hover:text-white/50";

    return (
        <>
            {menuItems.map((item) => (
                <NavLink
                    key={`nav-item-${item.link}`}
                    to={{ pathname: item.link }}
                    className={cn(
                        "flex items-center justify-center gap-1 w-fit min-w-10 h-full px-4 transition-all duration-200",
                        setNavlinkClasses(item.active)
                    )}
                >
                    <div className="text-lg hidden">{item.icon}</div>
                    <span className="font-medium max-md:text-sm">{item.title}</span>
                </NavLink>
            ))}
        </>
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
    return (
        <nav className="fixed flex gap-2 bottom-4 left-1/2 h-full max-h-[64px] md:hidden -translate-x-1/2 z-50 border border-card-border bg-card backdrop-blur-xl shadow-lg p-2 rounded-xl">
            <NavButtons />
        </nav>
    );
}
