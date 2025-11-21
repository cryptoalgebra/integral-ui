import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import CreatePoolForm from "@/components/create-pool/CreatePoolForm";
import { ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

const CreatePoolPage = () => {
    return (
        <PageContainer>
            <div className="border-b w-full md:mb-12 mb-4">
                <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between md:my-12 mb-4">
                    <NavLink className="flex items-center gap-2" to={"/pools"}>
                        <ChevronLeft size={28} />
                        <PageTitle title={"Create Pool"} showSettings={false} />
                    </NavLink>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3 w-full lg:gap-8  max-w-[1280px] mx-auto">
                <div className="col-span-1 flex flex-col gap-2">
                    <CreatePoolForm />
                    <PoweredByAlgebra className="mt-2" />
                </div>
            </div>
        </PageContainer>
    );
};

export default CreatePoolPage;
