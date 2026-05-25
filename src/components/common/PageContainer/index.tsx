import { cn } from "@/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

const PageContainer = ({ children, className }: PageContainerProps) => {
    return (
        <div className={cn("flex flex-col w-full items-start max-md:py-4 max-md:py-24 py-20 pt-[164px] max-w-[1280px] mx-auto", className)}>
            {children}
        </div>
    );
};

export default PageContainer;
