import { useState } from 'react'
import styled from 'styled-components'
import { Box, Flex, Heading, Skeleton, PageSection } from '@pancakeswap/uikit'
import { LotteryStatus } from 'config/constants/types'
import { useTranslation } from '@pancakeswap/localization'
import useTheme from 'hooks/useTheme'
import { useFetchLottery, useLottery } from 'state/lottery/hooks'
// import useChineseNewYearEffect from 'hooks/useChineseNewYearEffect'
import {
  CNY_TITLE_BG,
  GET_TICKETS_BG,
  CNY_FINISHED_ROUNDS_BG,
  CHECK_PRIZES_BG,
  FINISHED_ROUNDS_BG
} from './pageSectionStyles'
import useGetNextLotteryEvent from './hooks/useGetNextLotteryEvent'
import useStatusTransitions from './hooks/useStatusTransitions'
import Hero from './components/Hero'
import NextDrawCard from './components/NextDrawCard'
import Countdown from './components/Countdown'
import HistoryTabMenu from './components/HistoryTabMenu'
import YourHistoryCard from './components/YourHistoryCard'
import AllHistoryCard from './components/AllHistoryCard'
import CheckPrizesSection from './components/CheckPrizesSection'
import HowToPlay from './components/HowToPlay'
import useShowMoreUserHistory from './hooks/useShowMoreUserRounds'
import { PageMeta } from '../../components/Layout/Page'
import CnyDecorations from './components/LotteryCnyEffect'
// import CnyLotteryDraw from './components/CnyLotteryDraw'

const LotteryPage = styled.div`
  min-height: calc(100vh - 64px);
`

const Lottery = () => {
  // useChineseNewYearEffect()
  useFetchLottery()
  useStatusTransitions()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    currentRound: { status, endTime },
  } = useLottery()
  const [historyTabMenuIndex, setHistoryTabMenuIndex] = useState(0)
  const endTimeAsInt = parseInt(endTime, 10)
  const { nextEventTime, postCountdownText, preCountdownText } = useGetNextLotteryEvent(endTimeAsInt, status)
  const { numUserRoundsRequested, handleShowMoreUserRounds } = useShowMoreUserHistory()

  return (
    <>
      <PageMeta />
      <LotteryPage>
        <PageSection background={CNY_TITLE_BG} index={1} hasCurvedDivider={false}>
          <Hero />
        </PageSection>
        {/* <CnyLotteryDraw /> */}
        <PageSection
          containerProps={{ style: { marginTop: '-30px' } }}
          background={GET_TICKETS_BG}
          concaveDivider
          clipFill={{ light: '#7645D9' }}
          dividerPosition="top"
          index={2}
        >
          <Flex alignItems="center" justifyContent="center" flexDirection="column" pt="24px">
            {status === LotteryStatus.OPEN && (
              <Heading scale="xl" color="#ffffff" mb="24px" textAlign="center">
                {t('Get your tickets now!')}
              </Heading>
            )}
             <Flex alignItems="center" justifyContent="center" mb="48px">
              {nextEventTime && (postCountdownText || preCountdownText) ? (
                <Countdown
                  nextEventTime={nextEventTime}
                  postCountdownText={postCountdownText}
                  preCountdownText={preCountdownText}
                />
              ) : (
                <Skeleton height="41px" width="250px" />
              )}
            </Flex>

            <NextDrawCard />
          </Flex>
        </PageSection>
        <PageSection background={CHECK_PRIZES_BG} hasCurvedDivider={false} index={2}>
          <CheckPrizesSection />
        </PageSection>
        <PageSection
          position="relative"
          innerProps={{ style: { margin: '0', width: '100%' } }}
          background={FINISHED_ROUNDS_BG}
          hasCurvedDivider={false}
          index={2}
        >
          {/* <CnyDecorations /> */}
          <Flex width="100%" flexDirection="column" alignItems="center" justifyContent="center">
            <Heading color="#280D5F" mb="24px" scale="xl">
              {t('Finished Rounds')}
            </Heading>
            <Box mb="24px">
              <HistoryTabMenu
                activeIndex={historyTabMenuIndex}
                setActiveIndex={(index) => setHistoryTabMenuIndex(index)}
              />
            </Box>
            {historyTabMenuIndex === 0 ? (
              <AllHistoryCard />
            ) : (
              <YourHistoryCard
                handleShowMoreClick={handleShowMoreUserRounds}
                numUserRoundsRequested={numUserRoundsRequested}
              />
            )}
          </Flex>
        </PageSection>
        <PageSection
          dividerPosition="top"
          dividerFill={{ light: theme.colors.background }}
          // hasCurvedDivider={false}
          clipFill={{ light: '#9A9FD0 ', dark: '#9A9FD0' }}
          index={2}
        >
          <HowToPlay />
        </PageSection>
      </LotteryPage>
    </>
  )
}

export default Lottery
