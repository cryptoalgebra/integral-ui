import { cn } from "@/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

const PageContainer = ({ children, className }: PageContainerProps) => {
    return (
        <section
            className={cn("flex flex-col gap-8 m-auto w-full px-4 max-w-[1280px] h-full max-md:py-20 py-36 animate-fade-in", className)}
        >
            {children}
        </section>
    );
};

export default PageContainer;
