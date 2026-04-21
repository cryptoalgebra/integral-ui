import { cn } from "@/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

const PageContainer = ({ children, className }: PageContainerProps) => {
    return (
        <section className={cn("flex flex-col gap-8 m-auto px-4 max-w-[1200px] h-full max-md:pt-4 max-md:pb-20 py-8", className)}>
            {children}
        </section>
    );
};

export default PageContainer;
