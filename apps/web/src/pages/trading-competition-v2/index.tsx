import TradingReward from '../../views/TradingRewardV2'
import { SUPPORT_MAINNET_BSC } from 'config/constants/supportChains'


// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
const TradingRewardPage = () => <TradingReward />
TradingRewardPage.chains = { SUPPORT_MAINNET_BSC }
export default TradingRewardPage