import Settings from "../Settings";

interface PageTitleProps {
    children: React.ReactNode
}

const PageTitle = ({ children }: PageTitleProps) => {

    return <div className="flex w-full items-center justify-between">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl">
            {children}
        </h1>
        <Settings />
    </div>

}

export default PageTitle;