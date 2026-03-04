import { BarChart3, Bot, ChevronLeft, ChevronRight, Sprout } from "lucide-react";
import { MiddleView } from "../types";

const rightNavItems: { key: Exclude<MiddleView, "NEW_POSITION" | "POSITION">; label: string; icon: React.ElementType }[] = [
    { key: "POOL_INFO", label: "Pool", icon: BarChart3 },
    { key: "FARMING", label: "Farming", icon: Sprout },
    { key: "AI_ASSISTANT", label: "AI Assistant", icon: Bot },
];

interface PoolRightSidebarProps {
    isRightOpen: boolean;
    setIsRightOpen: React.Dispatch<React.SetStateAction<boolean>>;
    middleView: MiddleView;
    setMiddleView: (view: MiddleView) => void;
}

export default function PoolRightSidebar({ isRightOpen, setIsRightOpen, middleView, setMiddleView }: PoolRightSidebarProps) {
    return (
        <aside className={`overflow-hidden transition-all duration-200 ${isRightOpen ? "w-full lg:w-[220px]" : "w-full lg:w-16"}`}>
            <div className="h-full rounded-none border border-card-border bg-card-background p-3">
                <div className="flex items-center justify-between">
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-card-border transition-colors hover:bg-white/5"
                        onClick={() => setIsRightOpen((value) => !value)}
                        type="button"
                    >
                        {isRightOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                    {isRightOpen && <h3 className="text-sm font-medium">Navigation</h3>}
                </div>

                <div className="mt-3 h-[220px] rounded-md border border-card-border bg-black/10 p-2 lg:h-[calc(100%-44px)]">
                    <div className={`flex gap-2 ${isRightOpen ? "flex-col" : "flex-col items-center"}`}>
                        {rightNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = middleView === item.key;

                            return (
                                <button
                                    className={`flex h-10 w-full items-center rounded-md border transition-colors ${
                                        isRightOpen ? "justify-start gap-2 px-3" : "justify-center"
                                    } ${
                                        isActive
                                            ? "border-primary bg-primary/10 text-foreground"
                                            : "border-card-border text-foreground/80 hover:bg-white/5"
                                    }`}
                                    key={item.key}
                                    onClick={() => setMiddleView(item.key)}
                                    title={item.label}
                                    type="button"
                                >
                                    <Icon size={16} />
                                    {isRightOpen && <span className="text-sm">{item.label}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
