import { farmingClient } from '../clients';

export function refetchDepositsQuery() {
    return farmingClient.refetchQueries({
        include: ['Deposits'],
        onQueryUpdated: (query) => {
            query.refetch().then();
        },
    });
}
