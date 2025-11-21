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
                {title && <h1 className="scroll-m-20 font-semibold text-xl md:text-3xl leading-tight text-primary">{title}</h1>}
                {children && children}
            </div>
            {showSettings && <Settings />}
        </div>
    );
};

export default PageTitle;
