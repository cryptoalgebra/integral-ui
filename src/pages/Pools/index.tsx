import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import PoolsList from "@/components/pools/PoolsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PoolsPage = () => {
    return (
        <PageContainer>
            <div className="w-full flex justify-between mb-8">
                <PageTitle title={"Pools"} showSettings={false} />
                <Link to={"create"}>
                    <Button
                        variant={'primaryLink'}
                        size={'md'}
                        className="whitespace-nowrap rounded-full gap-2 ml-auto"
                    >
                        <Plus size={20} className="text-text-100" />
                        Create a Pool
                    </Button>
                </Link>
            </div>

            <div className="w-full">
                <div className="pb-4 bg-card-dark border border-card-border rounded-xl">
                    <PoolsList />
                </div>
            </div>
        </PageContainer>
    );
};

export default PoolsPage;
