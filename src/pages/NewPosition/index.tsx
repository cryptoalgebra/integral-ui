import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";

// type NewPositionPageParams = Record<"pool", Address>;

const NewPositionPage = () => {
    // const { pool: poolAddress } = useParams<NewPositionPageParams>();

    return (
        <PageContainer>
            <div className="mb-8">
                <PageTitle title={"Create Position"} />
            </div>
        </PageContainer>
    );
};

export default NewPositionPage;
