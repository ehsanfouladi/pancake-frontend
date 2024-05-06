import { Box, Button, Card, CardBody, CardFooter, CardHeader, CardRibbon, ColumnCenter, Container, ErrorIcon, Flex, Heading, Input, OptionProps, PageSection, Radio, Row, Select, Text, TimerIcon, useToast, useTooltip } from "@pancakeswap/uikit"
import { ToastDescriptionWithTx } from "components/Toast"
import { ChangeEvent, useMemo, useState } from "react"
import { getCadinuTradingCompetitionV2Address } from "utils/addressHelpers"
import { combineDateAndTime } from "views/CadinuLock/Create/helpers"
import { SecondaryLabel } from "views/CadinuLock/Create/styles"
import { DatePickerPortal, TimePicker } from "views/CadinuLock/components/DatePicker"
import Layout from "views/CadinuLock/components/Layout"
import WalletNotConnected from "views/Claim/components/WalletNotConnected"
import Page from "views/Page"
// import { SecondaryLabel } from "views/Voting/CreateProposal/styles"
import { useTranslation } from "@pancakeswap/localization"
import { CardWrapper } from "@pancakeswap/uikit/src/widgets/Liquidity"
import getTimePeriods from "@pancakeswap/utils/getTimePeriods"
import ApproveConfirmButtons, { ButtonArrangement } from "components/ApproveConfirmButtons"
import { NetworkSwitcher } from "components/NetworkSwitcher"
import { cadinuTradingCompetitionV2 } from "config/abi/cadinuTradingCompetitionV2"
import { useToken } from "hooks/Tokens"
import { useActiveChainId } from "hooks/useActiveChainId"
import useApproveConfirmTransaction from "hooks/useApproveConfirmTransaction"
import { useCallWithGasPriceNative } from "hooks/useCallWithGasPriceNative"
import { useCompetitionV2Contract } from "hooks/useContract"
import useNativeCurrency from "hooks/useNativeCurrency"
import Link from "next/link"
import useSWR from "swr"
import { Address, formatEther, parseEther, parseUnits, zeroAddress } from 'viem'
import { ErrorText } from "views/Swap/components/styleds"
import { COMPETITIONV2_API_URL } from "views/TradingReward/constants"
import { DatePicker } from "views/Voting/components/DatePicker"
import { useAccount, useContractReads, useSignMessage } from "wagmi"
import Banner from "./banner"



interface FormState {
  id: number
  startDate: Date | null
  startTime: Date | null
  endDate: Date | null
  endTime: Date | null
  poolAddress: string
  projectToken: string
  rewardAmount: string
  rewardToken: string
  isBoosted: boolean
  numberOfWinners: number
  referralAddress: string
  signature: string
  competitionType: string
  tokenToBuy: string
  
}

interface Project {
  id: number
  created_at: string
  updated_at: string
  name: string
  url: string
  token: string
  token_symbol: string
  verified_owner: string
}

interface Competition {
  _id: number
  start_time: number
  end_time: number
  pool_address: string
  exchange_name: string
  number_of_winners: number
  reward_amount: string
  reward_token: string
  is_boosted: boolean
  token_0: string
  token_1: string
  is_live: boolean
  is_finished: boolean
  competition_type: string
  token_to_buy: string
  fee: number
  is_verified: boolean
  is_core: boolean
  is_reward_set: boolean
  project: Project
  chain_id: number

}

interface EndTimeTooltipComponentProps {
  endTime: number;
}
const CompetitionAdmin = () => {
  const { address: account } = useAccount()
  const { toastError, toastSuccess } = useToast()
  const {symbol} = useNativeCurrency()
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation();

  const [filterBy, setFilterBy] = useState('LIVE')
  const EndTimeTooltipComponent: React.FC<React.PropsWithChildren<EndTimeTooltipComponentProps>> = ({
    endTime,
  }) => {

    return (
      <>
        <Text bold>Time:</Text>
        <Text>
          {new Date(endTime * 1000).toLocaleString(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </Text>
      </>
    );
  }


  function TimeCountdownDisplay({
    timestamp,
    getNow = () => Date.now(),
  }: {
    timestamp: number;
    getNow?: () => number;
  }) {

    const currentDate = getNow() / 1000;
    const competitionTimeRemaining = Math.abs(timestamp - currentDate);
    const endTimeObject = useMemo(() => getTimePeriods(competitionTimeRemaining), [competitionTimeRemaining]);
    const hasTimePassed = (timestamp - currentDate) < 0

    const {
      targetRef: endTimeTargetRef,
      tooltip: endTimeTooltip,
      tooltipVisible: endTimeTooltipVisible,
    } = useTooltip(<EndTimeTooltipComponent endTime={timestamp} />, {
      placement: "top",
    });
    return (
      <Flex alignItems="center">
        <Text color="textSubtle" small>
          {!hasTimePassed
            ? endTimeObject?.totalDays
              ? endTimeObject?.totalDays === 1
                ? t("1 day")
                : t("%days% days", { days: endTimeObject?.totalDays })
              : t("< 1 day")
            : t("%days% days ago", { days: endTimeObject?.totalDays })}
        </Text>
        <span ref={endTimeTargetRef}>
          <TimerIcon ml="4px" color="primary" />
          {endTimeTooltipVisible && endTimeTooltip}
        </span>
      </Flex>
    );
  }



  const [state, setState] = useState<FormState>(() => ({
    id: 0,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    poolAddress: '',
    projectToken: '',
    numberOfWinners: 0,
    rewardAmount: '',
    // rewardCharged: 0,
    rewardToken: '',
    referralAddress: '',
    isBoosted: false,
    signature: '',
    tokenToBuy: 'TOKEN0',
    competitionType: 'VOLUME',
    
    
  }))

  const { chainId } = useActiveChainId()

  const {
    startDate,
    startTime,
    endDate,
    endTime,
    poolAddress,
    projectToken,
    referralAddress,
    rewardToken,
    rewardAmount,
    numberOfWinners,
    signature,
    tokenToBuy,
    competitionType,
    
  } = state


  // const fetchMyCompetitions = async () => {
  //   const response = await fetch(
  //     `${COMPETITIONV2_API_URL}/my-competitions/${account}?filterBy=${filterBy}`,
  //     {
  //       method: 'get',
  //       headers: {
  //         'Content-Type': 'application/json', // Set the content type to application/json
  //       },
  //     }
  //   ).then(res => res.json())
  //   updateValue('myCompetitions', response)
  // };

  const fetcher = url => fetch(url).then(res => res.json());
  const { data: myCompetitions, isLoading } = useSWR<Competition[]>(
    `${COMPETITIONV2_API_URL}/my-competitions/${account}?filterBy=${filterBy}`
    , fetcher
  )



  const contract = {
    address: getCadinuTradingCompetitionV2Address(chainId),
    abi: cadinuTradingCompetitionV2
  }

  const { data: competitionDetails } = useContractReads({
    contracts: [{

      ...contract,
      functionName: 'owner'
    },
    {
      ...contract,
      functionName: 'nextId'
    },
    {
      ...contract,
      functionName: 'COST'
    },
    {
      ...contract,
      functionName: 'COST_WITH_REFERRAL'
    },
    {
      ...contract,
      functionName: 'referral',
      args: [referralAddress as Address]
    },

    ]
  })
  const competitionTypeIndex = (compType: string) => {
    if (compType === 'VOLUME') {
      return 0
    }
    return 1
  }

  const token = useToken(state.rewardToken)
  const competitionV2Contract = useCompetitionV2Contract(chainId)
  const { callWithGasPriceNative } = useCallWithGasPriceNative()
  const { isApproving, isApproved, isConfirming, handleApprove, handleConfirm } = useApproveConfirmTransaction({
    token,
    spender: getCadinuTradingCompetitionV2Address(chainId),
    minAmount: parseUnits(rewardAmount.toString(), token?.decimals) ? parseUnits(rewardAmount.toString(), token?.decimals) : 0n,
    onApproveSuccess: async ({ receipt }) => {
      toastSuccess(
        t('Contract enabled - you can now start your competition'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
      )
    },
    onConfirm: async () => {
      const functionName = 'startCompetition'
      const params = [
        combineDateAndTime(startDate, startTime),
        combineDateAndTime(endDate, endTime),
        poolAddress,
        projectToken,
        numberOfWinners,
        parseEther(rewardAmount),
        rewardToken,
        referralAddress ? referralAddress : zeroAddress,
        competitionTypeIndex(competitionType)
      ]
      // TODO: check with pnpm dev
      return callWithGasPriceNative(
        competitionV2Contract,
        functionName,
        params,
        (Number(competitionDetails?.[4].result) <= 0 || competitionDetails?.[4].error) ? competitionDetails[2]?.result : competitionDetails[3]?.result,

      )
    },
    onSuccess: async ({ receipt }) => {
      toastSuccess(t('Competition Created!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />);
      handleStartCompetition();

    },
  });


  const handleUpdateDatabase = async () => {

    try {

      fetch(`${COMPETITIONV2_API_URL}/all-competitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          account,
          id: Number(competitionDetails[1]?.result),
          startTime: combineDateAndTime(startDate, startTime),
          endTime: combineDateAndTime(endDate, endTime),
          poolAddress,
          rewardAmount,
          numberOfWinners,
          competitionType,
          projectToken,
          tokenToBuy,
          chain_id: chainId
        }),
      })
    } catch (error) {
      toastError(error instanceof Error && error?.message ? error.message : JSON.stringify(error))
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
  }

  const { signMessage: handleStartCompetition } = useSignMessage({
    message: account,
    onSuccess(data) {
      updateValue('signature', data);
      handleUpdateDatabase();
    }
  })

  // const { signMessage: showMyCompetitions } = useSignMessage({
  //   message: account,
  //   onSuccess(data) {
  //     updateValue('signature', data);
  //     fetchMyCompetitions(data, account);
  //     console.log(myCompetitions, signature, account);

  //   }
  // })


  const handleTypeOptionChange = (option: OptionProps): void => {
    updateValue('competitionType', option.value)
  }
  const handleTokenOptionChange = (option: OptionProps): void => {
    updateValue('tokenToBuy', option.value)
  }

  const updateValue = (key: string, value: string | Date | boolean) => {
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

  if (!account) {
    return (
      <Container>
        <WalletNotConnected />
      </Container>
    )
  }
  return (
    <Page>
      <Container>
        <Banner />
        <Flex justifyContent='center' mt='25px'>
          <NetworkSwitcher />
        </Flex>
        <PageSection index={1} hasCurvedDivider={false} innerProps={{ style: { padding: '0 16px' } }}>
          {/* <FilterLabel key='All'> */}
          <Flex flexDirection='row' justifyContent='center' flexWrap='wrap'>
          <Heading mb="15px" mr='25px'>Your Competitions:</Heading>
            <Flex flexDirection='row' flexWrap='wrap' mr='15px'>
              <Radio
                id='filterByLive'
                scale="sm"
                value={filterBy}
                checked={filterBy === 'LIVE'}
                onChange={() => setFilterBy('LIVE')}
                disabled={isLoading}
              />
              <Text bold ml="8px">{t('Live')}</Text>
            </Flex>
            <Flex flexDirection='row' mr='15px'>
              <Radio
                id='filterByUpcoming'
                scale="sm"
                value={filterBy}
                checked={filterBy === 'UPCOMING'}
                onChange={() => setFilterBy('UPCOMING')}
                disabled={isLoading}
              />
              <Text bold ml="8px">{t('Upcoming')}</Text>
            </Flex>
            <Flex flexDirection='row'>
              <Radio
                id='filterByFinished'
                scale="sm"
                value={filterBy}
                checked={filterBy === 'FINISHED'}
                onChange={() => setFilterBy('FINISHED')}
                disabled={isLoading}
              />
              <Text bold ml="8px">{t('Finished')}</Text>
            </Flex>
          </Flex>
          {/* </FilterLabel> */}
          {/* <Input
          value={rewardId}
          onChange={e => setRewardId(e.target.value)}
          type="text"
          placeholder="competition ID"
        /> */}
          <Flex justifyContent='center'>
            {myCompetitions?.length > 0 ?
              myCompetitions.map(competition => (
                <>
                  <CardWrapper margin='5px' style={{ flexWrap: "wrap", minWidth: '360px', maxWidth: '28%' }} >
                    <Card ribbon={competition.is_boosted && <CardRibbon text='Boosted' ribbonPosition="right" />} >
                      <Link href={`trading-competition/top-traders/${competition._id}`}>
                        <CardHeader style={{ textAlign: 'center' }} >
                          <Heading>
                            {`ID #${competition._id}`}
                          </Heading>
                        </CardHeader>
                      </Link>
                      <CardBody style={{ padding: '5px' }}>
                        <Flex
                          width='100%'
                          flexDirection='row'
                          flexWrap="wrap"
                          alignItems='center'
                          justifyContent='center'
                          verticalAlign='center'
                        >
                          <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                            <strong style={{ flex: '1 1 160px' }}>Chain ID :</strong>
                            <span >
                              {competition.chain_id}
                            </span>
                          </Box>
                          <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                            <strong style={{ flex: '1 1 160px' }}>Competition Type :</strong>
                            <span >
                              {competition.competition_type === 'PURCHASE' ? 'Purchase' : 'Trade'}
                            </span>
                          </Box>
                          <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                            <strong style={{ flex: '1 1 160px' }}>Pool :</strong>
                            <span >{competition.token_0}/{competition.token_1}</span>
                          </Box>
                          <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                            <strong style={{ flex: '1 1 160px' }}>Start Time:</strong>
                            <span style={{ margin: "3px" }}>
                              <TimeCountdownDisplay timestamp={Number(competition.start_time)} />
                            </span>
                          </Box>
                          <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                            <strong style={{ flex: '1 1 160px' }}>End Time:</strong>
                            <span style={{ margin: "3px" }}>
                              <TimeCountdownDisplay timestamp={Number(competition.end_time)} />
                            </span>
                          </Box>
                          <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                            <strong style={{ flex: '1 1 50px' }}>Reward:</strong>
                            <span >{`${competition.reward_amount} CBON ~ $${(Number(competition.reward_amount) * Number(0.000018)).toFixed(2)}`}</span>
                          </Box>
                          <Box my="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                            <strong style={{ flex: '1 1 160px' }}>DEX:</strong>
                            <span >{competition.exchange_name}</span>
                          </Box>

                        </Flex>
                        { filterBy === 'LIVE' && 
                        <CardFooter>
                          <Flex flexDirection='row' justifyContent='center'>
                            <Link href={`competitionsV2/increase-reward/${competition._id}?chainId=${competition.chain_id}`}>
                              <Button scale="md"
                              >
                                Increase Reward
                              </Button>
                            </Link>
                          </Flex>
                        </CardFooter>}
                      </CardBody>
                    </Card>
                  </CardWrapper>

                </>
              ))
              :(
                  <Text textAlign='center'>{`No ${filterBy} Competition`}</Text>
              )
            }
          </Flex>
        </PageSection>
        <PageSection index={2} hasCurvedDivider={false} innerProps={{ style: { padding: '0 16px' } }}>
          <Text mb='15px' textAlign='center' bold fontSize={['35px', '35px', '35px', '50px']} color="secondary" lineHeight="110%">
            Create New Competition</Text>
          <ColumnCenter style={{ height: "100%", justifyContent: "center" }} border='1' mb='24px'>
            {/* <InfoIcon /> */}
            <Text pt="4px" textAlign="center" fontSize="18px" >
              {`Start competition cost: ${competitionDetails && competitionDetails[2].result &&
                (formatEther(competitionDetails[2].result)).toString()
                } ${symbol}`}
            </Text>
            <Text mb='15px' py="4px" textAlign="center" fontSize="18px">
            {` with referral : ${
                competitionDetails?.[3]?.result && formatEther(competitionDetails?.[3]?.result)?.toString()
              } ${symbol}`}
            </Text>
          </ColumnCenter>
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
                {/* <Box mb="24px">
                      <SecondaryLabel htmlFor="projectName">Project Name</SecondaryLabel>
                      <Input
                        id="projectName"
                        name="projectName"
                        placeholder='Cadinu Swap'
                        value={projectName}
                        scale="lg"
                        onChange={handleChange}
                        required 
                      />
                    </Box>
                    <Box mb="24px">
                      <SecondaryLabel htmlFor="projectUrl">Project URL</SecondaryLabel>
                      <Input
                        id="projectUrl"
                        type="url"
                        name="projectUrl"
                        placeholder='https://..'
                        value={projectUrl}
                        scale="lg"
                        onChange={handleChange}
                        required 
                      />
                    </Box> */}
                <Box mb="24px">
                  <SecondaryLabel htmlFor="poolAddress">Pool Address</SecondaryLabel>
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
                  <SecondaryLabel htmlFor="projectToken">Project Token</SecondaryLabel>
                  <Input
                    id="projectToken"
                    name="projectToken"
                    placeholder='0x000...'
                    value={projectToken}
                    scale="lg"
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box mb="24px">
                  <SecondaryLabel htmlFor="rewardToken">Reward Token</SecondaryLabel>
                  <Input
                    id="rewardToken"
                    name="rewardToken"
                    placeholder='0x000...'
                    value={rewardToken}
                    scale="lg"
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box mb="24px">
                  <SecondaryLabel htmlFor="referralAddress">Referral Address</SecondaryLabel>
                  <Input
                    id="referralAddress"
                    name="referralAddress"
                    placeholder='0x000...'
                    value={referralAddress}
                    scale="lg"
                    onChange={handleChange}
                    required
                  />
                  {Number(competitionDetails?.[4].result) <= 0 || competitionDetails?.[4].error && <Row><ErrorIcon color="warning" /><ErrorText mx='5px' severity={2}>This address is not set as a referral.</ErrorText></Row>}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel htmlFor="competitionType">Competition Type </SecondaryLabel>
                  <Select
                    options={[
                      {
                        label: 'Volume',
                        value: 'VOLUME',
                      },
                      {
                        label: 'Purchase',
                        value: 'PURCHASE',
                      },]}
                    id="competitionType"
                    onOptionChange={handleTypeOptionChange}
                  />
                </Box>
                {competitionType === 'PURCHASE' &&
                  <>
                    <Box mb='24px'>
                      <SecondaryLabel htmlFor="competitionType">Token to buy</SecondaryLabel>
                      <Select
                        options={[
                          {
                            label: 'token0',
                            value: 'TOKEN0',
                          },
                          {
                            label: 'token1',
                            value: 'TOKEN1',
                          },]}
                        id="competitionType"
                        onOptionChange={handleTokenOptionChange}
                      />
                    </Box>
                  </>
                }
                {/* <Box mb="24px">
                      <SecondaryLabel htmlFor="poolAddress">Pool Address</SecondaryLabel>
                      <Input
                        id="poolAddress"
                        name="poolAddress"
                        placeholder='0x000...'
                        value={poolAddress}
                        scale="lg"
                        onChange={handleChange}
                        required 
                      />
                    </Box> */}
                <Box mb="24px">
                  <SecondaryLabel htmlFor="rewardAmount">Reward Amount</SecondaryLabel>
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
                  <SecondaryLabel htmlFor="numberOfWinners">Number of Winners</SecondaryLabel>
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
          < ApproveConfirmButtons
            isApproveDisabled={isApproved || !rewardToken || !rewardAmount}
            isApproving={isApproving}
            isConfirmDisabled={
              !startDate ||
              !startTime ||
              !endDate ||
              !endTime ||
              !poolAddress ||
              !projectToken ||
              !rewardToken ||
              !rewardAmount ||
              !numberOfWinners ||
              !tokenToBuy ||
              !competitionType ||
              !isApproved
            }
            isConfirming={isConfirming}
            onApprove={handleApprove}
            onConfirm={handleConfirm}
            buttonArrangement={ButtonArrangement.SEQUENTIAL}
            confirmLabel={t('Start Competition')}
            confirmId="Start"
          />
          {/* <Button
            onClick={() => handleStartCompetition()}
            disabled={!startCompetition}
          >
            Submit
          </Button> */}
          <DatePickerPortal />
        </PageSection>
      </Container>
    </Page>
  )
}

export default CompetitionAdmin