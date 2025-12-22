import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PoolHeader = () => {
    return (
        <div className="flex items-center justify-between w-full mb-8">
            <div className="w-full">
                <PageTitle title="My positions" showSettings={false}></PageTitle>
            </div>

            <Link to={"new-position"}>
                <Button variant={"primary"} size={"md"} className="whitespace-nowrap rounded-full gap-2 ml-auto">
                    <Plus size={20} />
                    Create Position
                </Button>
            </Link>
        </div>
    );
};

export default PoolHeader;
