import { useTranslation } from '@pancakeswap/localization'
import {
    Box,
    Button,
    CardBody,
    CardRibbon,
    Flex,
    Heading,
    useMatchBreakpoints,
    useToast,
} from '@pancakeswap/uikit'
import styled from 'styled-components'
// import WinningNumbers from '../WinningNumbers'
// import ViewTicketsModal from '../ViewTicketsModal'
import { TimeCountdownDisplay } from '@pancakeswap/uikit/src/widgets/Pool'
import { ToastDescriptionWithTx } from 'components/Toast'
import { cadinuTradingCompetitionV2 } from 'config/abi/cadinuTradingCompetitionV2'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getCadinuTradingCompetitionV2Address } from 'utils/addressHelpers'
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { Competition } from '../YourHistoryCard'

const StyledCardBody = styled(CardBody)`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-column-gap: 72px;
    grid-row-gap: 36px;
    grid-template-columns: auto 1fr;
  }
`

const StyledCardRibbon = styled(CardRibbon)`
  right: -20px;
  top: -20px;

  ${({ theme }) => theme.mediaQueries.xs} {
    right: -10px;
    top: -10px;
  }
`

const PreviousRoundCardBody: React.FC<
  React.PropsWithChildren<{ competitionData: Competition; competitionId: string }>
> = ({ competitionData, competitionId }) => {
  const { t } = useTranslation()
  const {chainId} = useActiveChainId()
  const {data:nextId} = useContractRead({
    address: getCadinuTradingCompetitionV2Address(chainId),
    abi: cadinuTradingCompetitionV2,
    functionName: 'nextId'
  })

  const {config, isLoading} = usePrepareContractWrite({
    address: getCadinuTradingCompetitionV2Address(chainId),
    abi: cadinuTradingCompetitionV2,
    functionName: 'withdrawRewardForIds',
    args: [[competitionData._id]]
  })

  const { data: withdrawRewardForId, write: withdrawReward } = useContractWrite(config)
  const { toastSuccess } = useToast()
  const { data: reciept } = useWaitForTransaction({
    hash: withdrawRewardForId?.hash,
    onSuccess: () => {
      toastSuccess('Rewards withdrawn', <ToastDescriptionWithTx txHash={withdrawRewardForId.hash} />)
    }
  })
  // const userLotteryData = useGetUserLotteriesGraphData()
  // const userDataForRound = userLotteryData.rounds.find((userLotteryRound) => userLotteryRound.competitionId === competitionId)
  const { isLg, isXl, isXxl } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl

  // const currentcompetitionIdAsInt = parseInt(currentcompetitionId)
  // const mostRecentFinishedRoundId =
  //   status === LotteryStatus.CLAIMABLE ? currentcompetitionIdAsInt : currentcompetitionIdAsInt - 1
  const isLatestRound = nextId?.toString() === competitionId + 1

  // const [onPresentViewTicketsModal] = useModal(
  //   <ViewTicketsModal roundId={competitionId} roundStatus={competitionData?.is_finished} />,
  // )

  // const totalTicketNumber = userDataForRound ? userDataForRound.totalTickets : 0
  // const ticketRoundText =
  //   Number(totalTicketNumber) > 1
  //     ? t('You had %amount% tickets this round', { amount: totalTicketNumber })
  //     : t('You had %amount% ticket this round', { amount: totalTicketNumber })
  // const [youHadText, ticketsThisRoundText] = ticketRoundText.split(totalTicketNumber.toString())

  return (
    <StyledCardBody>
      {isLatestRound && <StyledCardRibbon text={t('Latest')} />}
      <Grid>
        <Flex justifyContent={['left', null, null, 'flex-start']}>
          <Heading mb="24px">{t('Winning Competition')}</Heading>
        </Flex>
        {/* <Flex maxWidth={['240px', null, null, '100%']} justifyContent={['center', null, null, 'flex-start']}> */}
          {competitionData && 
              <Flex
                width='100%'
                flexDirection='row'
                flexWrap="wrap"
                alignItems='center'
                justifyContent='flex-start'
                verticalAlign='center'
              >
                <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                  <strong style={{ flex: '1 1 160px' }}>Competition Type :</strong>
                  <span >
                    {competitionData.competition_type === 'PURCHASE' ? 'Purchase' : 'Trade'}
                  </span>
                </Box>
                <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="95%">
                  <strong style={{ flex: '1 1 160px' }}>Pool :</strong>
                  <span >{competitionData.token_0}/{competitionData.token_1}</span>
                </Box>
                <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="95%">
                  <strong style={{ flex: '1 1 160px' }}>Start Time:</strong>
                  <span style={{ margin: "3px" }}>
                    <TimeCountdownDisplay timestamp={Number(competitionData.start_time)} />
                  </span>
                </Box>
                <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="95%">
                  <strong style={{ flex: '1 1 160px' }}>End Time:</strong>
                  <span style={{ margin: "3px" }}>
                    <TimeCountdownDisplay timestamp={Number(competitionData.end_time)} />
                  </span>
                </Box>
                <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="95%">
                  <strong style={{ flex: '1 1 50px' }}>Reward:</strong>
                  <span >{`${competitionData.reward_amount} CBON`}</span>
                </Box>
                <Box my="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="95%">
                  <strong style={{ flex: '1 1 160px' }}>DEX:</strong>
                  <span >{competitionData.exchange_name}</span>
                </Box>
            <Box width="95%" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', flexDirection: 'row' }}>
                <Button
                disabled={!withdrawReward}
                isLoading={isLoading}
                onClick={()=>withdrawReward?.()}
                >Withdraw</Button>
            </Box>
              </Flex>
              }
             {/* ) : (
               <Skeleton
                 width={['240px', null, null, '450px']}
                 height={['34px', null, null, '71px']}
                 mr={[null, null, null, '32px']}
               />
             ) } */}
        {/* </Flex> */}
        {/* {userDataForRound && (
          <>
            <Box display={['none', null, null, 'flex']}>
              <Heading>{t('Your tickets')}</Heading>
            </Box>
            <Flex
              flexDirection="column"
              mr={[null, null, null, '24px']}
              alignItems={['center', null, null, 'flex-start']}
            >
              <Box mt={['32px', null, null, 0]}>
                <Text display="inline">{youHadText} </Text>
                <Text display="inline" bold>
                  {userDataForRound.totalTickets}
                </Text>
                <Text display="inline">{ticketsThisRoundText}</Text>
              </Box>
              <Button
                onClick={onPresentViewTicketsModal}
                height="auto"
                width="fit-content"
                p="0"
                variant="text"
                scale="sm"
              >
                {t('View your tickets')}
              </Button>
            </Flex>
          </>
        )} */}
      </Grid>
    </StyledCardBody>
  )
}

export default PreviousRoundCardBody
