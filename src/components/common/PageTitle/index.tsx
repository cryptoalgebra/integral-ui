interface PageTitleProps {
    title?: string;
    description?: React.ReactNode;
}

const PageTitle = ({ title, description }: PageTitleProps) => {
    return (
        <div className="flex flex-col items-start w-full relative">
            {title && <h1 className="scroll-m-20 font-bold text-4xl = text-text">{title}</h1>}
            {description && <p className="mt-4 max-w-xl text-sm text-text-muted md:text-base">{description}</p>}
            <div className="absolute top-2 -left-6 w-32 h-10 bg-primary blur-2xl opacity-15" />
        </div>
    );
};

export default PageTitle;
