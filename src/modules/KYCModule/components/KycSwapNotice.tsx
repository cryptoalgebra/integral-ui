import { ShieldCheck } from "lucide-react";
import { KycIdentityState, KycStatus } from "../types";

export const KycSwapNotice = ({ identity }: { identity: KycIdentityState }) => (
    <div className="flex items-start gap-3 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-left text-sm">
        <ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={17} />
        <div>
            <p className="font-semibold text-text-100">This route uses a KYC pool</p>
            <p className="text-text-300">
                {identity.status === KycStatus.VERIFIED
                    ? "Your on-chain verification is valid."
                    : "Deploy an Onchain ID and add a demo claim before swapping."}
            </p>
        </div>
    </div>
);
