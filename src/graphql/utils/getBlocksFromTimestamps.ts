import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { splitQuery } from "./splitQuery";
import { GET_BLOCKS } from "../queries/blocks";

export async function getBlocksFromTimestamps(timestamps: number[], blockClient: ApolloClient<NormalizedCacheObject>, skipCount = 500) {
    if (timestamps?.length === 0) {
        return [];
    }
    const fetchedData: any = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount);

    const blocks: any[] = [];
    if (fetchedData) {
        for (const t in fetchedData) {
            if (fetchedData[t].length > 0) {
                blocks.push({
                    timestamp: t.split("t")[1],
                    number: fetchedData[t][0]["number"],
                });
            }
        }
    }
    return blocks;
}
