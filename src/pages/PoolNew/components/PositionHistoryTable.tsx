import Loader from "@/components/common/Loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { usePositionSnapshots, type PositionSnapshot } from "@/hooks/positions/usePositionSnapshots";
import { formatAmount } from "@/utils/common/formatAmount";
import { useMemo } from "react";

interface PositionHistoryTableProps {
    tokenId: string | number;
    token0Symbol?: string;
    token1Symbol?: string;
}

type HistoryAction = "Create" | "Deposit" | "Burn" | "Close" | "Collect";

const EPSILON = 1e-12;

function parseValue(value: string | undefined) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function inferAction(current: PositionSnapshot, previous?: PositionSnapshot): HistoryAction {
    if (!previous) return "Create";

    const currentDeposited0 = parseValue(current.depositedToken0);
    const currentDeposited1 = parseValue(current.depositedToken1);
    const currentWithdrawn0 = parseValue(current.withdrawnToken0);
    const currentWithdrawn1 = parseValue(current.withdrawnToken1);
    const currentCollected0 = parseValue(current.collectedFeesToken0);
    const currentCollected1 = parseValue(current.collectedFeesToken1);

    const previousDeposited0 = parseValue(previous.depositedToken0);
    const previousDeposited1 = parseValue(previous.depositedToken1);
    const previousWithdrawn0 = parseValue(previous.withdrawnToken0);
    const previousWithdrawn1 = parseValue(previous.withdrawnToken1);
    const previousCollected0 = parseValue(previous.collectedFeesToken0);
    const previousCollected1 = parseValue(previous.collectedFeesToken1);

    const deltaDeposited = currentDeposited0 - previousDeposited0 + (currentDeposited1 - previousDeposited1);
    const deltaWithdrawn = currentWithdrawn0 - previousWithdrawn0 + (currentWithdrawn1 - previousWithdrawn1);
    const deltaCollected = currentCollected0 - previousCollected0 + (currentCollected1 - previousCollected1);

    if (deltaWithdrawn > EPSILON) {
        const remaining0 = currentDeposited0 - currentWithdrawn0;
        const remaining1 = currentDeposited1 - currentWithdrawn1;
        if (Math.abs(remaining0) <= EPSILON && Math.abs(remaining1) <= EPSILON) {
            return "Close";
        }
        return "Burn";
    }

    if (deltaCollected > EPSILON) return "Collect";
    if (deltaDeposited > EPSILON) return "Deposit";
    return "Collect";
}

function getActionAmount(snapshot: PositionSnapshot, previous: PositionSnapshot | undefined, action: HistoryAction) {
    const previousSnapshot = previous ?? {
        id: "",
        depositedToken0: "0",
        depositedToken1: "0",
        withdrawnToken0: "0",
        withdrawnToken1: "0",
        collectedFeesToken0: "0",
        collectedFeesToken1: "0",
        timestamp: "0",
    };

    const currentDeposited0 = parseValue(snapshot.depositedToken0);
    const currentDeposited1 = parseValue(snapshot.depositedToken1);
    const currentWithdrawn0 = parseValue(snapshot.withdrawnToken0);
    const currentWithdrawn1 = parseValue(snapshot.withdrawnToken1);
    const currentCollected0 = parseValue(snapshot.collectedFeesToken0);
    const currentCollected1 = parseValue(snapshot.collectedFeesToken1);

    const previousDeposited0 = parseValue(previousSnapshot.depositedToken0);
    const previousDeposited1 = parseValue(previousSnapshot.depositedToken1);
    const previousWithdrawn0 = parseValue(previousSnapshot.withdrawnToken0);
    const previousWithdrawn1 = parseValue(previousSnapshot.withdrawnToken1);
    const previousCollected0 = parseValue(previousSnapshot.collectedFeesToken0);
    const previousCollected1 = parseValue(previousSnapshot.collectedFeesToken1);

    if (action === "Create" || action === "Deposit") {
        return {
            token0: Math.max(0, currentDeposited0 - previousDeposited0),
            token1: Math.max(0, currentDeposited1 - previousDeposited1),
        };
    }

    if (action === "Burn" || action === "Close") {
        return {
            token0: Math.max(0, currentWithdrawn0 - previousWithdrawn0),
            token1: Math.max(0, currentWithdrawn1 - previousWithdrawn1),
        };
    }

    return {
        token0: Math.max(0, currentCollected0 - previousCollected0),
        token1: Math.max(0, currentCollected1 - previousCollected1),
    };
}

export default function PositionHistoryTable({ tokenId, token0Symbol, token1Symbol }: PositionHistoryTableProps) {
    const { snapshots, loading } = usePositionSnapshots(tokenId);
    const blockExplorerURL = useBlockExplorerURL();

    const rows = useMemo(() => {
        const sorted = [...snapshots].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

        const withActions = sorted.map((snapshot, index) => {
            const previous = index > 0 ? sorted[index - 1] : undefined;
            const action = inferAction(snapshot, previous);
            const amount = getActionAmount(snapshot, previous, action);

            return {
                id: snapshot.id,
                action,
                timestamp: Number(snapshot.timestamp),
                amount,
                txHash: snapshot.transaction?.id,
            };
        });

        return withActions.sort((a, b) => b.timestamp - a.timestamp);
    }, [snapshots]);

    if (loading) {
        return (
            <div className="flex h-[120px] items-center justify-center text-sm text-foreground/60">
                <Loader />
            </div>
        );
    }

    if (!rows.length) {
        return <p className="text-sm text-foreground/60">No position history yet.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-card-border/40 hover:bg-transparent">
                    <TableHead>Action</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Tx</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id} className="border-card-border/30 hover:bg-card-hover/20">
                        <TableCell>{row.action}</TableCell>
                        <TableCell>
                            {formatAmount(row.amount.token0, 6)} {token0Symbol || "Token 0"} / {formatAmount(row.amount.token1, 6)} {token1Symbol || "Token 1"}
                        </TableCell>
                        <TableCell>{new Date(row.timestamp * 1000).toLocaleString()}</TableCell>
                        <TableCell className="text-text-300">
                            {row.txHash ? (
                                <a
                                    href={`${blockExplorerURL.replace(/\/$/, "")}/tx/${row.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-2 hover:text-foreground"
                                >
                                    {`${row.txHash.slice(0, 6)}...${row.txHash.slice(-4)}`}
                                </a>
                            ) : (
                                "--"
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
