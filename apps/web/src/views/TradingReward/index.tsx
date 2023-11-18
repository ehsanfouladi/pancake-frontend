import { Box } from '@pancakeswap/uikit'
import HowToEarn from 'views/TradingReward/components/HowToEarn'
import Questions from 'views/TradingReward/components/Questions'
import Banner from 'views/TradingReward/components/TopTraders/Banner'
import FinishedCompetitions from './top-traders-finished'
import LiveCompetitions from './top-traders-live'
import UpcomingCompetitions from './top-traders-upcoming'

const TradingReward = () => {

  

  return (
    <Box>
      <Banner />
      <LiveCompetitions />
      <UpcomingCompetitions />
      <FinishedCompetitions />
      <HowToEarn />
      <Questions />
    </Box>
  )
}

export default TradingReward
