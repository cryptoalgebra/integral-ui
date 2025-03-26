export function formatPlural(amount: number, single: string, plural: string) {
    return amount === 1 ? single : plural;
}
