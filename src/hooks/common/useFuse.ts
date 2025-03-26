import Fuse, { IFuseOptions } from "fuse.js";
import { useMemo, useState } from "react";
import { Address } from "viem";

export function useFuse<T>({ data, options }: { data: T[]; options: IFuseOptions<unknown> }) {
    const [pattern, setPattern] = useState<string | Address | undefined>(undefined);

    const fuse = useMemo(() => new Fuse(data, options), [data, options]);

    const result = useMemo(() => (pattern ? fuse.search(pattern).map((v) => v.item) : data), [data, fuse, pattern]);

    const clear = () => setPattern("");

    return {
        result,
        search: setPattern,
        pattern,
        clear,
    };
}
