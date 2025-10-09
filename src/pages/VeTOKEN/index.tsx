import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import Ve33Module from "@/modules/Ve33Module";
const { CreateLockModal, LocksTotalStats, LocksList } = Ve33Module.components;

const VeTOKENPage = () => {
    return (
        <PageContainer>
            <div className="w-full flex-col flex sm:grid grid-cols-4 gap-3 mb-3 justify-between">
                <div className="col-span-3">
                    <PageTitle title="veTOKEN" showSettings={false} />
                </div>
                <CreateLockModal>
                    <Button variant={"primaryLink"} size={"md"} className="whitespace-nowrap rounded-full gap-2 ml-auto">
                        <Plus size={20} className="text-text-100" />
                        Create New Lock
                    </Button>
                </CreateLockModal>
            </div>
            <LocksTotalStats />
            <LocksList />
        </PageContainer>
    );
};

export default VeTOKENPage;
