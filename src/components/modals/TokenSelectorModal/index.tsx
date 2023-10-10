import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TokenSelectorModal = () => {
    
    return <Dialog open={true}> 
        <DialogTrigger asChild>
            <Button>Select Token</Button>
        </DialogTrigger>
        <DialogContent className="min-w-[500px] rounded-3xl" style={{borderRadius: '32px'}}>
            <DialogHeader>
                <DialogTitle>Select a token</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="allTokens">
                <TabsList>
                    <TabsTrigger value="allTokens">All Tokens</TabsTrigger>
                    <TabsTrigger value="integralPools">Integral Pools</TabsTrigger>
                </TabsList>
                <TabsContent value="allTokens">All Tokens</TabsContent>
                <TabsContent value="integralPools">Integral Pools</TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>

}

export default TokenSelectorModal