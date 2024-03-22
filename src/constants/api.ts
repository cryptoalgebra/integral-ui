export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const ETERNAL_FARMINGS_API =
    'https://api.algebra.finance/api/APR/eternalFarmings/?network=holesky';

export const POOL_MAX_APR_API =
    'https://api.algebra.finance/api/APR/pools/max?network=holesky';

export const POOL_AVG_APR_API =
    'https://api.algebra.finance/api/APR/pools/?network=holesky';
