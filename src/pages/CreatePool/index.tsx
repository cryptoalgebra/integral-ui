import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import CreatePoolForm from "@/components/create-pool/CreatePoolForm";
import { ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

const CreatePoolPage = () => {
    return (
        <PageContainer>
            <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
                <div className="flex flex-col gap-4 mb-3">
                    <NavLink
                        className="inline-flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-text-muted transition-colors duration-150 hover:text-text"
                        to="/pools"
                    >
                        <ChevronLeft size={16} />
                        Back to Pools
                    </NavLink>

                    <PageTitle title="Create Pool" description="Select a pair and set the initial price." />
                </div>
                <CreatePoolForm />
                <PoweredByAlgebra className="mx-auto w-fit justify-center text-text-muted transition-opacity duration-200 opacity-80 hover:opacity-100" />
            </div>
        </PageContainer>
    );
};

export default CreatePoolPage;
