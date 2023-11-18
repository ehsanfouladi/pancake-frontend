import { Box, Button, Container, Input, NotFound, PageSection, Text, useToast } from "@pancakeswap/uikit"
import { ToastDescriptionWithTx } from "components/Toast"
import { cadinuTradingCompetition } from "config/abi/cadinuTradingCompetition"
import { format } from "date-fns"
import { useRouter } from "next/router"
import { useState } from "react"
import { getCadinuTradingCompetitionAddress } from "utils/addressHelpers"
import { formatUnits, parseEther } from "viem"
import { DatePickerPortal } from "views/CadinuLock/components/DatePicker"
import Layout from "views/CadinuLock/components/Layout"
import WalletNotConnected from "views/Claim/components/WalletNotConnected"
import Page from "views/Page"
import { COMPETITION_API_URL } from "views/TradingReward/constants"
import { SecondaryLabel } from "views/Voting/CreateProposal/styles"
import { useAccount, useContractReads, useContractWrite, usePrepareContractWrite, useSignMessage, useWaitForTransaction } from "wagmi"



const IncreaseReward = ()=>{
    
    const router = useRouter()
    const {id: competitionId} = router.query
    const {address:account} = useAccount()
    const { toastError, toastSuccess } = useToast()
    const [signature, setSignature] = useState('')

    const [amount, setAmount] = useState('')

    const contract ={
      address: getCadinuTradingCompetitionAddress(),
      abi: cadinuTradingCompetition
    }
    const {data:competitionDetails} = useContractReads({
      enabled: competitionId !=='',
      contracts :[
        {
          ...contract,
          functionName:'owner'
        },
        {
          ...contract,
          functionName: 'cadinuCompetitions',
          args:[competitionId && BigInt(competitionId as string)]
        }
      ],
      watch:true
    })
   

    const {config} = usePrepareContractWrite({
      address : getCadinuTradingCompetitionAddress(),
      abi: cadinuTradingCompetition,
      functionName: 'increaseReward',
      args:[
        competitionId,
        parseEther(amount)
      ]
    })

    const handleUpdateDatabase = async ()=>{
      
      try{
        const res = await fetch(`${COMPETITION_API_URL}/`, {
          method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          account,
          competitionId,
        }),
      })
      if(res.ok){
        toastSuccess('Database Updated!')
      }
      } catch (error) {
          toastError(error instanceof Error && error?.message ? error.message : JSON.stringify(error))
      }
    }

    const {data:increaseRewardData, write:increaseReward} = useContractWrite(config)

    const {signMessage:handleIncreaseReward} = useSignMessage({
        message: account, 
        onSuccess(data) {
            setSignature(data);
            increaseReward?.();
        }
      })

    const {data:trasaction} = useWaitForTransaction({
      hash: increaseRewardData?.hash,
      onSuccess: ()=>{
        toastSuccess('Reward Successfully Increased', <ToastDescriptionWithTx txHash={increaseRewardData.hash} />)
        handleUpdateDatabase()


      }

    })

    
    const handleFormSubmit = async (e)=>{
        e.preventDefault()
      }
    if(competitionDetails && account && account.toLowerCase() !== competitionDetails[0].result?.toLowerCase()){
        return (<NotFound />)
    }
    if(!account){
        return(
            <Container>
                <WalletNotConnected />
            </Container>
        )
    }
    return (
        <Page>
          <Container>
            <PageSection index={1}>
            {competitionDetails && competitionDetails[1].status==='success' && (
              <>
              <Layout>
              <Box ml='25px'>
                <Text bold>Competition ID</Text>
                <Text>{competitionId}</Text>
                <Text bold>Start Time</Text>
                {format(new Date(Number(competitionDetails[1]?.result?.['0']) * 1000), 'yyyy-MM-dd HH:mm')}
                {/* <Text>{competitionDetails[1]?.result?.['0'].toString()}</Text> */}
                <Text bold>End Time</Text>
                {format(new Date(Number(competitionDetails[1]?.result?.['1']) * 1000), 'yyyy-MM-dd HH:mm')}


                {/* <Text>{competitionDetails[1]?.result?.['1'].toString()}</Text> */}
                <Text bold>Pool Address</Text>
                <Text>{competitionDetails[1]?.result?.['2'].toString()}</Text>
                </Box>
                <Box>
                <Text bold>Number of Winners</Text>
                <Text>{competitionDetails[1]?.result?.['3'].toString()}</Text>
                <Text bold>Reward Amount</Text>
                <Text>{formatUnits(competitionDetails[1]?.result?.['4'], 18).toString()}</Text>
                <Text bold>Reward Charged</Text>
                <Text>{formatUnits(competitionDetails[1]?.result?.['5'], 18).toString()}</Text>
                <Text bold>Is Boosted</Text>
                <Text>{competitionDetails[1]?.result?.['6'].toString()}</Text>
                </Box>
                </Layout>
              </>
             )}
            </PageSection>
            <PageSection index={2}>
              <form onSubmit={handleFormSubmit}>
                <Layout>
                  <Box>
                        <Box mb="24px">
                        <SecondaryLabel htmlFor="rewards">Amount to Increase</SecondaryLabel>
                        <Input
                          id='rewards'
                          name="rewards"
                          placeholder='0'
                          value={amount}
                          scale="sm"
                          onChange={(e)=>setAmount(e.target.value)}
                          required 
                        />
                      </Box>

                  </Box>
                </Layout>
              </form> 
              <Button
                disabled={!increaseReward}
                onClick={()=>handleIncreaseReward?.()}
              >Increase</Button>
             
              <DatePickerPortal />
            </PageSection>
          </Container>
        </Page>
    )
}

export default IncreaseReward