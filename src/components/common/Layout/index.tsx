import { Toaster } from "@/components/ui/toaster";
import Header from "../Header";
import Footer from "../Footer";
import { MobileNavigation } from "../Navigation";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col w-full h-full">
            <Header />
            <main className="h-full min-h-screen">{children}</main>
            <Toaster />
            <MobileNavigation />
            <Footer />
        </div>
    );
};

export default Layout;
