import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import Ve33Module from "@/modules/Ve33Module";
const { CreateLockModal, LocksTotalStats, LocksList } = Ve33Module.components;

const VeALGBPage = () => {
    return (
        <PageContainer>
            <div className="w-full flex-col flex sm:grid grid-cols-4 gap-3 mb-3 justify-between">
                <div className="col-span-3">
                    <PageTitle title="veALGB" showSettings={false} />
                </div>
                <CreateLockModal>
                    <Button
                        className="whitespace-nowrap h-16 w-full gap-3 rounded-xl sm:text-lg! hover:bg-primary-300 bg-primary-300 text-black"
                        size={"md"}
                    >
                        Create New Lock
                        <div className="rounded-full p-1 bg-black">
                            <Plus size={20} className="text-text-100" />
                        </div>
                    </Button>
                </CreateLockModal>
            </div>
            <LocksTotalStats />
            <LocksList />
        </PageContainer>
    );
};

export default VeALGBPage;
