import Settings from "../Settings";

interface PageTitleProps {
    title: string;
    showSettings?: boolean;
    children?: React.ReactNode
}

const PageTitle = ({ title, children, showSettings = true }: PageTitleProps) => {

    return <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-8">
            <h1 className="scroll-m-20 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">{title}</h1>
            {children && children}
        </div>
        {showSettings && <Settings />}
    </div>

}

export default PageTitle;