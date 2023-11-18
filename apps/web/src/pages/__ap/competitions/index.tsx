import { Box, Button, Container, Heading, Input, NotFound, PageSection, useToast } from "@pancakeswap/uikit"
import { ToastDescriptionWithTx } from "components/Toast"
import { cadinuTradingCompetition } from "config/abi/cadinuTradingCompetition"
import { ChangeEvent, useEffect, useState } from "react"
import { getCadinuTradingCompetitionAddress } from "utils/addressHelpers"
import { combineDateAndTime } from "views/CadinuLock/Create/helpers"
import { Label } from "views/CadinuLock/Create/styles"
import { DatePickerPortal, TimePicker } from "views/CadinuLock/components/DatePicker"
import Layout from "views/CadinuLock/components/Layout"
import WalletNotConnected from "views/Claim/components/WalletNotConnected"
import Page from "views/Page"
import { SecondaryLabel } from "views/Voting/CreateProposal/styles"
import { DatePicker } from "views/Voting/components/DatePicker"
import { useAccount, useContractReads, useContractWrite, usePrepareContractWrite, useSignMessage, useWaitForTransaction } from "wagmi"
import { parseEther } from 'viem'
import { COMPETITION_API_URL } from "views/TradingReward/constants"

interface FormState {
    id : number
    startDate : Date | null
    startTime : Date | null
    endDate: Date | null
    endTime: Date | null
    poolAddress: string
    rewardAmount: string
    rewardCharged: number
    isBoosted: boolean
    numberOfWinners: number
    signature: string
  }
  

const CompetitionAdmin = ()=>{
    const {address:account} = useAccount()
    const { toastError, toastSuccess } = useToast()

    const contract = {
      address:getCadinuTradingCompetitionAddress(),
      abi:cadinuTradingCompetition
    }

    const {data:competitionDetails} = useContractReads({
        contracts:[{

          ...contract,
          functionName:'owner'
        },
        {
          ...contract,
          functionName:'nextId'
        }
        ]
    })

    const [state, setState] = useState<FormState>(() => ({
        id:0,
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        poolAddress: '',
        rewardAmount: '',
        rewardCharged: 0,
        isBoosted: false,
        numberOfWinners: 0,
        signature: ''
    }))

    const {
        startDate,
        startTime,
        endDate,
        endTime,
        poolAddress,
        rewardAmount,
        numberOfWinners,
        signature
        } = state

    const {config} = usePrepareContractWrite({
      address : getCadinuTradingCompetitionAddress(),
      abi: cadinuTradingCompetition,
      functionName: 'startCompetition',
      args:[
        combineDateAndTime(startDate, startTime),
        combineDateAndTime(endDate, endTime),
        poolAddress,
        numberOfWinners,
        parseEther(rewardAmount)
      ]
    })

    const {data:competitionStart, write:startCompetition} = useContractWrite(config)

    const {data:trasaction} = useWaitForTransaction({
      hash: competitionStart?.hash,
      onSuccess: ()=>{
        toastSuccess('Competition Created', <ToastDescriptionWithTx txHash={competitionStart.hash} />)
        handleUpdateDatabase()
      }

    })

    const handleUpdateDatabase = async ()=>{
      
      try{

        fetch(`${COMPETITION_API_URL}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signature,
            account,
            id: Number(competitionDetails[1]?.result),
            startTime : combineDateAndTime(startDate,startTime),
            endTime: combineDateAndTime(endDate,endTime),
            poolAddress,
            rewardAmount,
            numberOfWinners,
          }),
      })
      } catch (error) {
          toastError(error instanceof Error && error?.message ? error.message : JSON.stringify(error))
      }
    }

    const handleFormSubmit = async (e)=>{
        e.preventDefault()
      }

    const {signMessage:handleStartCompetition} = useSignMessage({
        message: account, 
        onSuccess(data) {
          updateValue('signature', data);
          startCompetition?.();
        }
      })
    
      
    const updateValue = (key: string, value: string | Date) => {
        setState((prevState) => ({
        ...prevState,
        [key]: value,
        }))
        
    }

    const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
        const { name: inputName, value } = evt.currentTarget
        updateValue(inputName, value)
      }
  
      const handleDateChange = (key: string) => (value: Date) => {
        updateValue(key, value)
      }
    
    if(account && account.toLowerCase() !== competitionDetails[0]?.result?.toLowerCase()){
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
              <Heading>Create New Competition</Heading>
            </PageSection>
            <PageSection index={2}>
              <form onSubmit={handleFormSubmit}>
                <Layout>
                  <Box>
                    <Box mb="24px">
                      <SecondaryLabel htmlFor="startDate">Start Date</SecondaryLabel>
                      <DatePicker
                        name="startDate"
                        onChange={handleDateChange('startDate')}
                        selected={startDate}
                        placeholderText="YYYY/MM/DD"
                      />
                    </Box>
                    <Box mb="24px">
                      <SecondaryLabel htmlFor="startTime">Start Time</SecondaryLabel>
                      <TimePicker
                        name="startTime"
                        onChange={handleDateChange('startTime')}
                        selected={startTime}
                        placeholderText="00:00"
                      />
                    </Box>
                    <Box mb="24px">
                      <SecondaryLabel htmlFor="endDate">End Date</SecondaryLabel>
                      <DatePicker
                        name="endtDate"
                        onChange={handleDateChange('endDate')}
                        selected={endDate}
                        placeholderText="YYYY/MM/DD"
                      />
                    </Box>
                    <Box mb="24px">
                      <SecondaryLabel htmlFor="endTime">End Time</SecondaryLabel>
                      <TimePicker
                        name="endTime"
                        onChange={handleDateChange('endTime')}
                        selected={endTime}
                        placeholderText="00:00"
                      />
                  </Box>
                  </Box>
                  <Box>
                    <Box mb="24px">
                      <Label htmlFor="poolAddress">Pool Address</Label>
                      <Input
                        id="poolAddress"
                        name="poolAddress"
                        placeholder='0x000...'
                        value={poolAddress}
                        scale="lg"
                        onChange={handleChange}
                        required 
                      />
                    </Box>
                    <Box mb="24px">
                      <Label htmlFor="rewardAmount">Reward Amount</Label>
                      <Input
                        id="rewardAmount"
                        name="rewardAmount"
                        placeholder='0'
                        value={rewardAmount}
                        scale="lg"
                        onChange={handleChange}
                        required 
                      />
                    </Box>
                    <Box mb="24px">
                      <Label htmlFor="numberOfWinners">Number of Winners</Label>
                      <Input
                        id="numberOfWinners"
                        name="numberOfWinners"
                        placeholder='0'
                        value={numberOfWinners}
                        scale="lg"
                        onChange={handleChange}
                        required 
                      />
                    </Box>
                  </Box>
                </Layout>
              </form> 
              <Button
                onClick={()=>handleStartCompetition()}
                disabled={!startCompetition}
              >
                Submit
              </Button>
              <DatePickerPortal />
            </PageSection>
          </Container>
        </Page>
    )
}

export default CompetitionAdmin