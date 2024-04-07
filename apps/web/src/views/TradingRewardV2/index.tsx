import { Box } from '@pancakeswap/uikit'
import HowToEarn from 'views/TradingRewardV2/components/HowToEarn'
import Questions from 'views/TradingRewardV2/components/Questions'
import Banner from 'views/TradingRewardV2/components/TopTraders/Banner'
import FinishedCompetitions from './top-traders-finished'
import LiveCompetitions from './top-traders-live'
import UpcomingCompetitions from './top-traders-upcoming'

const TradingReward: React.FC<React.PropsWithChildren> = () => {

  

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
