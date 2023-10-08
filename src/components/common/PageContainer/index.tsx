interface PageContainerProps {
    children: React.ReactNode
}

const PageContainer = ({ children }: PageContainerProps) => {

    return <div className="flex flex-col items-start">
        {children}
    </div>

}

export default PageContainer