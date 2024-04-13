import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Flex, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import FinishedRoundRow from './FinishedRoundRow'

const Grid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
`

interface FinishedRoundTableProps {
  handleHistoryRowClick: (string) => void
  handleShowMoreClick: () => void
  numUserRoundsRequested: number
  winnerData: any
}

const FinishedRoundTable: React.FC<React.PropsWithChildren<FinishedRoundTableProps>> = ({
  handleShowMoreClick,
  numUserRoundsRequested,
  handleHistoryRowClick,
  winnerData
}) => {
  const { t } = useTranslation()
  console.log('winnerData', winnerData);
  
  // const userLotteryData = useGetUserLotteriesGraphData()

  // const filteredForClaimable = userLotteryData?.rounds.filter((round) => {
  //   return round.status.toLowerCase() === LotteryStatus.CLAIMABLE
  // })

  // const sortedByRoundId = filteredForClaimable?.sort((roundA, roundB) => {
  //   return parseInt(roundB.lotteryId, 10) - parseInt(roundA.lotteryId, 10)
  // })

  return (
    <>
      <Grid px="24px" pt="24px" mb="8px">
        <Text bold fontSize="12px" color="secondary">
          #
        </Text>
        <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
          {t('Finished')}

        </Text>
        <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
          {t('Reward')}
        </Text>
        <Box width="20px" />
      </Grid>
      <Flex px="24px" pb="24px" flexDirection="column" overflowY="scroll" height="240px">
        {winnerData &&
          winnerData.map((finishedRound) => (
            <FinishedRoundRow
              key={finishedRound.id}
              roundId={finishedRound.competition._id}
              hasWon
              numberTickets={`${finishedRound.prize_amount} ${
                finishedRound.competition.reward_token_symbol ? finishedRound.competition.reward_token_symbol : '' 
              }`}
              endTime={finishedRound.competition.end_time}
              onClick={handleHistoryRowClick}
            />
          ))}
        {winnerData && winnerData.lenght === numUserRoundsRequested && (
          <Flex justifyContent="center">
            <Button mt="12px" variant="text" width="fit-content" onClick={handleShowMoreClick}>
              {t('Show More')}
            </Button>
          </Flex>
        )}
      </Flex>
    </>
  )
}

export default FinishedRoundTable
