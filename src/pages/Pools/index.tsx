import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import PoolsList from "@/components/pools/PoolsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PoolsPage = () => {
    return (
        <PageContainer>
            <div className="border-b w-full md:mb-12 mb-4">
                <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between md:my-12 mb-4">
                    <PageTitle title={"Pools"} showSettings={false} />
                    <Link to={"create"}>
                        <Button variant={"primary"} size={"sm"} className="whitespace-nowrap gap-2 ml-auto">
                            <Plus size={20} className="text-black" />
                            Create a Pool
                        </Button>
                    </Link>
                </div>
            </div>

            <PoolsList />
        </PageContainer>
    );
};

export default PoolsPage;
