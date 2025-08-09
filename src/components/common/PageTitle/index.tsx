import Settings from "../Settings";

interface PageTitleProps {
    title?: string;
    showSettings?: boolean;
    children?: React.ReactNode;
}

const PageTitle = ({ title, children, showSettings = true }: PageTitleProps) => {
    return (
        <div className="flex w-full items-center justify-between whitespace-nowrap px-4 bg-gradient-to-l from-accent-100 to-primary-100 min-h-16 h-full max-h-16 rounded-xl">
            <div className="flex items-center gap-4 w-full">
                {title && <h1 className="scroll-m-20 font-bold tracking-tight lg:text-2xl text-lg">{title}</h1>}
                {children && children}
            </div>
            {showSettings && <Settings />}
        </div>
    );
};

export default PageTitle;
