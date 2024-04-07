import Leaderboard from '../../../views/TradingRewardV2/components/Leaderboard'

// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
import { SUPPORT_MAINNET_BSC } from 'config/constants/supportChains'
const LeaderboardPage = ()=> <Leaderboard />
LeaderboardPage.chains = {SUPPORT_MAINNET_BSC}
export default LeaderboardPage