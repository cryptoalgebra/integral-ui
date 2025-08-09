interface PageContainerProps {
    children: React.ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
    return <div className="flex flex-col w-full items-start max-md:py-4 max-md:pb-24 py-20 animate-fade-in duration-200">{children}</div>;
};

export default PageContainer;
