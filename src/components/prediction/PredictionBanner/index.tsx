import { Sparkle } from "lucide-react";
import { Link } from "react-router-dom";

const PredictionBanner = () => {

    return <Link to={'/prediction'} className="flex items-center gap-2 w-full text-md mb-1 text-center bg-emerald-900/60 text-emerald-300 border border-emerald-800 py-1 px-3 rounded-lg">
        <Sparkle size={16} />
        <span className="text-sm">Predict ETH price in the next 24 hours</span>
        <span className="text-3xl ml-auto -mt-3">⟶</span>
    </Link>

};

export default PredictionBanner;