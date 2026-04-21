import { cn } from "@/utils/common/cn";
import { Loader2Icon } from "lucide-react";

interface LoaderProps {
    size?: number;
    color?: string;
    className?: string;
}

const Loader = ({ size = 22, color = "black", className }: LoaderProps) => (
    <Loader2Icon size={size} color={color} className={cn("animate-spin", className)} />
);

export default Loader;
