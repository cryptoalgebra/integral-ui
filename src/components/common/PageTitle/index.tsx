interface PageTitleProps {
    children: React.ReactNode
}

const PageTitle = ({ children }: PageTitleProps) => {

    return <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-4xl">
        {children}
    </h1>

}

export default PageTitle;