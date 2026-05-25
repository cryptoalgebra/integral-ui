import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import PoolTokensFaucetModal from "@/components/modals/PoolTokensFaucetModal";
import PoolsList from "@/components/pools/PoolsList";
import SecurityStatusTag from "@/components/pools/SecurityStatusTag";
import { Button } from "@/components/ui/button";
import { useReadSecurityRegistryGlobalStatus } from "@/generated";
import { SecurityState } from "@/hooks/pools/usePool";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PoolsPage = () => {
    const { data: globalStatus } = useReadSecurityRegistryGlobalStatus();

    const enableActions = globalStatus === SecurityState.ENABLED;

    return (
        <PageContainer>
            <div className="w-full flex items-center justify-between gap-3 mb-8">
                <PageTitle title={"Pools"} showSettings={false} />

                <div className="flex items-center gap-2 ml-auto justify-end flex-wrap min-w-1/3">
                    <SecurityStatusTag status={globalStatus} />
                    <PoolTokensFaucetModal />
                    {enableActions && (
                        <Link to={"create"}>
                            <Button variant={"primaryLink"} size={"md"} className="whitespace-nowrap rounded-full gap-2">
                                <Plus size={20} className="text-text-100" />
                                Create a Pool
                            </Button>
                        </Link>
                    )}
                </div>
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
