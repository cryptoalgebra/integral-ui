import { useTradesByMarketQuery } from "@/graphql/generated/graphql";

const PredictionMarketTrades = () => {

    const { data } = useTradesByMarketQuery({
        variables: {
            market: ""
        }
    })

    console.log("TRADES", data)

    return <div>asdsa</div>

};

export default PredictionMarketTrades;