import { columns } from "@/components/common/Table/columns"
import DataTable from "@/components/common/Table/dataTable"
import { getAlgebraPositionManager } from "@/generated"
import { useSinglePoolQuery } from "@/graphql/generated/graphql"
import { usePool } from "@/hooks/pools/usePool"
import { usePositions } from "@/hooks/positions/usePositions"
import { Position, getTickToPrice } from "@cryptoalgebra/integral-sdk"
import { useMemo } from "react"
import { Address } from "wagmi"

interface MyPositionsProps {
    positions: any
    poolId: Address | undefined
}

const MyPositions = ({ poolId, positions }: MyPositionsProps) => {

    console.log('My positions', positions)

    return <div className="min-h-[400px]">
            <DataTable columns={columns} data={positions} />
        </div>

}

export default MyPositions