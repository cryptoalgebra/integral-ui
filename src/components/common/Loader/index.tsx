import { Loader2Icon } from "lucide-react";

interface LoaderProps {
    size?: number;
    color?: string;
}

const Loader = ({ size = 22, color = 'white' }: LoaderProps) => <Loader2Icon size={size} color={color} className="animate-spin" />

export default Loader