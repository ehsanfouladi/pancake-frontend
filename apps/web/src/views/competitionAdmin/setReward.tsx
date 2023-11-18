import { bscTokens } from "@pancakeswap/tokens"
import { Box, Container, Input, NotFound, PageSection, Text, useToast } from "@pancakeswap/uikit"
import ApproveConfirmButtons from "components/ApproveConfirmButtons"
import { ToastDescriptionWithTx } from "components/Toast"
import { cadinuTradingCompetition } from "config/abi/cadinuTradingCompetition"
import { format } from "date-fns"
import useApproveConfirmTransaction from "hooks/useApproveConfirmTransaction"
import { useCallWithGasPrice } from "hooks/useCallWithGasPrice"
import { useRouter } from "next/router"
import { ChangeEvent, useEffect, useState } from "react"
import { getCadinuTradingCompetitionAddress } from "utils/addressHelpers"
import { getCadinuTradingCompetitionContract } from "utils/contractHelpers"
import { formatUnits, parseUnits } from "viem"
import { DatePickerPortal } from "views/CadinuLock/components/DatePicker"
import Layout from "views/CadinuLock/components/Layout"
import WalletNotConnected from "views/Claim/components/WalletNotConnected"
import Page from "views/Page"
import { SecondaryLabel } from "views/Voting/CreateProposal/styles"
import { Address, useAccount, useContractReads, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"

interface FormState {
    users: Address[]
    rewards: number[]
  }
  

const CompetitionAdmin = ()=>{
    const router = useRouter()
    const {callWithGasPrice} = useCallWithGasPrice()
    const {id: competitionId} = router.query
    const {address:account} = useAccount()
    const { toastSuccess } = useToast()
    const [numberOfWinners, setNumberOfWinners] = useState(0)

    const [state, setState] = useState<FormState>(() => ({
        users:[],
        rewards:[]
    }))

    const contract ={
      address: getCadinuTradingCompetitionAddress(),
      abi: cadinuTradingCompetition
    }
    const {data:competitionDetails} = useContractReads({
      enabled: competitionId!=='',
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
    useEffect(()=>{
        if (competitionDetails[1].status==='success' && numberOfWinners === 0){
          setNumberOfWinners(Number(competitionDetails[1]?.result?.['3']))
          setState((prevState)=>({
            ...prevState,
            'users': new Array(Number(competitionDetails[1]?.result?.['3'])).fill(''),
            'rewards': new Array(Number(competitionDetails[1]?.result?.['3'])).fill(null),
            
          }))
        }
    }, [competitionDetails])

    const {
        users,
        rewards
        } = state

    const {config} = usePrepareContractWrite({
      address : getCadinuTradingCompetitionAddress(),
      abi: cadinuTradingCompetition,
      functionName: 'setReward',
      args:[
        competitionId,
        users,
        rewards,
      ]
    })

    const {data} = useContractWrite(config)

    const {data:trasaction} = useWaitForTransaction({
      hash: data?.hash,
      onSuccess: ()=>{
        toastSuccess('Competition Created', <ToastDescriptionWithTx txHash={data.hash} />)
      }

    })

    
    const handleFormSubmit = async (e)=>{
        e.preventDefault()
      }

    const handleUserChange = (evt:ChangeEvent<HTMLInputElement>)=>{
      const {name:inputName, value, id: inputId } = evt.currentTarget
      const nextUsers = users.map((c,i)=>{
        if(i===Number(inputId)){
          return value
        }
        return c
      })
      setState((prevState)=>({
        ...prevState,
        [inputName]: nextUsers,
      }))
    }
    
    const handleRewardChange = (evt:ChangeEvent<HTMLInputElement>)=>{
      const {name:inputName, value, id: inputId } = evt.currentTarget
      const nextRewards = rewards.map((c,i)=>{
        if(i===Number(inputId)){
          return value
        }
        return c
      })
      setState((prevState)=>({
        ...prevState,
        [inputName]: nextRewards,
      }))
    }
    const tradingCompetiionContract = getCadinuTradingCompetitionContract(getCadinuTradingCompetitionAddress())
    
    const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      token: bscTokens.cbon,
      spender: getCadinuTradingCompetitionAddress(),
      minAmount: competitionDetails[1]?.result?.['4'],
      targetAmount: competitionDetails[1]?.result?.['4'],
      onConfirm: () => {
        return callWithGasPrice(
          tradingCompetiionContract,
          'setReward',
          [
            competitionId,
            users,
            rewards.map(x=>{return parseUnits(x.toString(),18)}),
          ]
          )
      },
      
      onApproveSuccess: () => {
        toastSuccess('Enabled', "Press 'confirm' to set rewards")
      },
      onSuccess: () => {
        toastSuccess('Success', 'You have set rewards successfully')
        
      },
    })


    if(account && account.toLowerCase() !== competitionDetails[0].result?.toLowerCase()){
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
             {competitionDetails[1].status==='success' && (
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
                    {rewards.map(
                      (j,i)=>(
                        <Box mb="24px">
                        <SecondaryLabel htmlFor="rewards">{`Reward for User #${i+1}`}</SecondaryLabel>
                        <Input
                          // key={i+1}
                          id={`${i}`}
                          name="rewards"
                          placeholder='0'
                          value={rewards[i]}
                          scale="sm"
                          onChange={handleRewardChange}
                          required 
                        />
                      </Box>
                      )
                    )}
                    </Box>
                    <Box>
                    {users.map(
                      (j,i)=>(
                        <Box mb="24px">
                        <SecondaryLabel htmlFor="users">{`user #${i+1}`}</SecondaryLabel>
                        <Input
                          // key={i+1}
                          id={`${i}`}
                          name="users"
                          placeholder='0x...'
                          value={users[i]}
                          scale="sm"
                          onChange={handleUserChange}
                          required 
                        />
                      </Box>
                      )
                    )}
                  </Box>
                </Layout>
              </form> 
              <ApproveConfirmButtons
                isApproveDisabled={ isConfirmed || isConfirming || isApproved }
                isApproving={isApproving}
                isConfirmDisabled={!isApproved || isConfirmed }
                isConfirming={isConfirming}
                onApprove={handleApprove}
                onConfirm={handleConfirm}
          />
             
              <DatePickerPortal />
            </PageSection>
          </Container>
        </Page>
    )
}

export default CompetitionAdmin