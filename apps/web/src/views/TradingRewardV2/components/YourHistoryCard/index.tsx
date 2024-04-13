import { useTranslation } from '@pancakeswap/localization'
import {
    ArrowBackIcon,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Flex,
    Heading,
    Skeleton,
    Text,
    useToast,
} from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import { cadinuTradingCompetitionV2 } from 'config/abi/cadinuTradingCompetitionV2'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'
import { getCadinuTradingCompetitionV2Address } from 'utils/addressHelpers'
import { getDrawnDate } from 'views/Lottery/helpers'
import { COMPETITION_V2_API_URL } from 'views/TradingRewardV2/constants'
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import PreviousRoundCardBody from '../PreviousRoundCard/Body'
import FinishedRoundTable from './FinishedRoundTable'
import { Competition } from '../types'


interface YourHistoryCardProps {
  handleShowMoreClick: () => void
  numUserRoundsRequested: number
}

const StyledCard = styled(Card)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 756px;
  }
`

const StyledCardBody = styled(CardBody)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
`

const YourHistoryCard: React.FC<React.PropsWithChildren<YourHistoryCardProps>> = ({
  handleShowMoreClick,
  numUserRoundsRequested,
}) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const {chainId} = useActiveChainId()
  const { address: account } = useAccount()
  const [shouldShowRoundDetail, setShouldShowRoundDetail] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState <Competition>(null)

  const {config, isLoading: isWithdrawLoading} = usePrepareContractWrite({
    address: getCadinuTradingCompetitionV2Address(chainId),
    abi: cadinuTradingCompetitionV2,
    functionName: 'withdrawAllReward',
})
  const {data:withdrawAllRewardsData, write: withdrawAllRewards} = useContractWrite(config)
  const {toastSuccess} = useToast()
  const {data:reciept} = useWaitForTransaction({
    hash: withdrawAllRewardsData?.hash,
    onSuccess: () => {
      toastSuccess('Rewards withdrawn', <ToastDescriptionWithTx txHash={withdrawAllRewardsData.hash} />)
  }})
  const handleHistoryRowClick = async (competitionId: string) => {
    setShouldShowRoundDetail(true)
    const item = data.find(d => d.competition._id === competitionId);
    console.log(item);
    
    setSelectedCompetition(item.competition)
    // const lotteryData = await fetchLottery(competitionId)
    // const processedLotteryData = processLotteryResponse(lotteryData)
    // setelectedLotteryNodeDataS(processedLotteryData)
  }

  const clearState = useCallback(() => {
    setShouldShowRoundDetail(false)
    setSelectedCompetition(null)
  }, [])


  const fetcher = url => fetch(url).then(res => res.json())
  const { data, isLoading } = useSWR(`${COMPETITION_V2_API_URL}/user-history/${account}`, fetcher)

  const getHeader = () => {
    if (shouldShowRoundDetail) {
      return (
        <Flex alignItems="center">
          <ArrowBackIcon cursor="pointer" onClick={clearState} mr="20px" />
          <Flex flexDirection="column" alignItems="flex-start" justifyContent="center">
            <Heading scale="md" mb="4px">
              {t('Competitions')} 
            </Heading>
            {selectedCompetition ? (
            // data[0].findselectedCompetition.competition.end_time ? (
              <Text fontSize="14px">
                {t('Finished at ')} 
                {getDrawnDate(locale, selectedCompetition.end_time.toString())}
              </Text>
            ) : (
              <Skeleton width="185px" height="21px" />
            )}
          </Flex>
        </Flex>
      )
    }

    return <Heading scale="md">{t('Competitions')}</Heading>
  }

  const getBody = () => {
    if (shouldShowRoundDetail) {
      return <PreviousRoundCardBody competitionData={selectedCompetition} competitionId={selectedCompetition._id.toString()} />
    }

    // const claimableRounds = userLotteryData?.rounds.filter((round) => {
    //   return round.status.toLowerCase() === LotteryStatus.CLAIMABLE
    // })

    if (!account) {
      return (
        <StyledCardBody>
          <Text textAlign="center" color="textSubtle" mb="16px">
            {t('Connect your wallet to check your history')}
          </Text>
          <ConnectWalletButton />
        </StyledCardBody>
      )
    }
    if (data?.length === 0) {
      return (
        <StyledCardBody>
          <Box maxWidth="280px">
            <Flex alignItems="center" justifyContent="center" mb="16px">
              <Text textAlign="left">{t('No competition history found')}</Text>
            </Flex>
            <Text textAlign="center" color="textSubtle" mb="16px">
              {t('Participate in a competition for the rewards!')}
            </Text>
            {/* <BuyTicketsButton disabled={ticketBuyIsDisabled} width="100%" /> */}
          </Box>
        </StyledCardBody>
      )
    }
    return (
      <>
      <FinishedRoundTable
        handleHistoryRowClick={handleHistoryRowClick}
        handleShowMoreClick={handleShowMoreClick}
        numUserRoundsRequested={data?.length}
        winnerData={data}
      />
      {data?.lenght !==0 &&
          <Box width='95%' mb='15px' style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', flexDirection: 'row' }}>
        <Button
          isLoading={isWithdrawLoading}
          disabled={!withdrawAllRewards}
          onClick={()=>withdrawAllRewards?.()}
        >Withdraw All</Button>
      </Box>
      }
      </>
    )
  }

  const getFooter = () => {
    // if (selectedLotteryNodeData) {
    //   return <PreviousRoundCardFooter lotteryNodeData={selectedLotteryNodeData} lotteryId={selectedLotteryId} />
    // }
    return (
      <CardFooter >
        Cadinu Competitions Information
      </CardFooter>
    )
  }

  return (
    <StyledCard>
      <CardHeader>{getHeader()}</CardHeader>
      {getBody()}
      {getFooter()}
    </StyledCard>
  )
}

export default YourHistoryCard
