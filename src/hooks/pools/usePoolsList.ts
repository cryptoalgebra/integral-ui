import { algebraFactoryABI } from "@/abis/algebraFactory";
import { useEffect, useState } from "react";
import { Address, decodeEventLog, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";

import AlgebraConfig from "@/algebra.config";

interface IPools {
  readonly token0: Address;
  readonly token1: Address;
  readonly pool: Address;
}

const ALGEBRA_FACTORY_CREATION_BLOCK = 30096675n;

export function usePoolsList() {
  const publicClient = usePublicClient();

  const [pools, updatePools] = useState<IPools[]>();

  useEffect(() => {
    publicClient
      .getLogs({
        address: AlgebraConfig.V3_CONTRACTS.FACTORY_ADDRESS as Address,
        event: parseAbiItem("event Pool(address, address, address)"),
        fromBlock: ALGEBRA_FACTORY_CREATION_BLOCK,
        toBlock: "latest",
      })
      .then((logs) =>
        logs.map(
          ({ data, topics }) =>
            decodeEventLog({
              abi: algebraFactoryABI,
              eventName: "Pool",
              data,
              topics,
            }).args
        )
      )
      .then((v) => {
        updatePools(v);
      })
      .catch(console.error);
  }, []);

  return { pools };
}
