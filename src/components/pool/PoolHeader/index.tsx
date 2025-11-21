import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PoolHeader = () => {
    return (
        <div className="border-b w-full md:mb-12 mb-4">
            <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between md:my-12 mb-4">
                <PageTitle title={"My positions"} showSettings={false} />
                <Link to={"new-position"}>
                    <Button variant={"primary"} size={"sm"} className="whitespace-nowrap gap-2 ml-auto">
                        <Plus size={20} className="text-black" />
                        Create Position
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default PoolHeader;
