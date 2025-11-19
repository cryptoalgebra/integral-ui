import { Toaster } from "@/components/ui/toaster";
import Header from "../Header";
import { MobileNavigation } from "../Navigation";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col w-full h-full">
            <Header />
            <main className="h-full max-w-[1280px] mx-auto w-full">{children}</main>
            <Toaster />
            <MobileNavigation />
        </div>
    );
};

export default Layout;
