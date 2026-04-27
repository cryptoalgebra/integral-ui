import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import { useParams } from "react-router-dom";
import { Address } from "viem";
import { CreatePositionFlow } from "./CreatePositionFlow";

type NewPositionPageParams = Record<"pool", Address>;

const NewPositionPage = () => {
    const { pool: poolAddress } = useParams<NewPositionPageParams>();

    return (
        <PageContainer>
            <div className="mb-8">
                <PageTitle title={"Create Position"} />
            </div>
            <CreatePositionFlow poolAddress={poolAddress} />
        </PageContainer>
    );
};

export default NewPositionPage;
