import Settings from "../Settings";

interface PageTitleProps {
    title?: string;
    showSettings?: boolean;
    children?: React.ReactNode;
}

const PageTitle = ({ title, children, showSettings = true }: PageTitleProps) => {
    return (
        <div className="flex w-full items-center justify-between whitespace-nowrap">
            <div className="flex items-center gap-4 w-full">
                {title && <h1 className="scroll-m-20 font-bold text-4xl leading-tight bg-gradient-to-b bg-clip-text text-transparent from-white via-slate-200 to-slate-600">{title}</h1>}
                {children && children}
            </div>
            {showSettings && <Settings />}
        </div>
    );
};

export default PageTitle;
