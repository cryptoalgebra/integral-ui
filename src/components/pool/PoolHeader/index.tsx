import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PoolHeader = () => {
    return (
        <div className="grid grid-cols-4 gap-3 md:flex-row max-md:flex-col max-md:flex items-center justify-between w-full">
            <div className="col-span-3 w-full">
                <PageTitle title="My positions" showSettings={false}></PageTitle>
            </div>

            <Link className="col-span-1 w-full" to={"new-position"}>
                <Button
                    className="whitespace-nowrap h-16 w-full gap-3 rounded-xl text-lg! hover:bg-primary-300 bg-primary-300 text-black"
                    size={"md"}
                >
                    Create Position
                    <div className="rounded-full p-1 bg-black">
                        <Plus size={20} className="text-text-100" />
                    </div>
                </Button>
            </Link>
        </div>
    );
};

export default PoolHeader;
