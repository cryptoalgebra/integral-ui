import { columns } from "@/components/common/Table/columns"
import DataTable from "@/components/common/Table/dataTable"
import { Address } from "wagmi"

interface MyPositionsProps {
    positions: any
    poolId: Address | undefined
}

const MyPositions = ({ positions }: MyPositionsProps) => {

    console.log('My positions', positions)

    return <div className="min-h-[400px]">
            <DataTable columns={columns} data={positions} />
        </div>

}

export default MyPositions