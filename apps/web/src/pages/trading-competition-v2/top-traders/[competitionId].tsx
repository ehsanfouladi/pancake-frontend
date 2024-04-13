import { SUPPORT_MAINNET_BSC } from 'config/constants/supportChains'
import Leaderboard from '../../../views/TradingRewardV2/components/Leaderboard'

const LeaderboardPage = ()=> <Leaderboard />
LeaderboardPage.chains = {SUPPORT_MAINNET_BSC}

export default LeaderboardPage