import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import CreatePoolForm from "@/components/create-pool/CreatePoolForm";
import { ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

const CreatePoolPage = () => {
    return (
        <PageContainer className="w-full items-center">
            <div className="w-full transition-all duration-200 ease-in-out lg:w-2/5 xl:w-[580px]">
                <div className="mb-6 w-full flex items-center justify-between gap-4">
                    <NavLink className="flex items-center gap-2" to={"/pools"}>
                        <ChevronLeft size={28} />
                        <PageTitle title={"Create Pool"} showSettings={false} />
                    </NavLink>
                </div>

                <div className="mb-3 flex items-center w-full flex-col gap-3">
                    <CreatePoolForm />
                    <PoweredByAlgebra />
                </div>
            </div>
        </PageContainer>
    );
};

export default CreatePoolPage;
