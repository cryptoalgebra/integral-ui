import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";

import Ve33Module from "@/modules/Ve33Module";
const { VotingTotalStats, VotingPoolsList } = Ve33Module.components;

const VotePage = () => {
    return (
        <PageContainer>
            <div className="w-full mb-3">
                <PageTitle title="Vote" showSettings={false} />
            </div>

            <div className="w-full space-y-3 ">
                <VotingTotalStats />
                <VotingPoolsList />
            </div>
        </PageContainer>
    );
};

export default VotePage;
