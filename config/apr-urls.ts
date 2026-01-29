export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const ETERNAL_FARMINGS_API = "https://maple-apr.algebra.finance/api/eternal-farmings/apr?network=henesys";

export const POOL_MAX_APR_API = "https://maple-apr.algebra.finance/api/pools/max-apr?network=henesys";

export const POOL_AVG_APR_API = "https://maple-apr.algebra.finance/api/pools/apr?network=henesys";
