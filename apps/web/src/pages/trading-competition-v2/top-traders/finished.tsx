import TradingRewardTopTraders from '../../../views/TradingRewardV2/top-traders-finished'

// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
import { SUPPORT_MAINNET_BSC } from 'config/constants/supportChains'
const TradingRewardTopTradersPage = () => <TradingRewardTopTraders />
TradingRewardTopTradersPage.chains = { SUPPORT_MAINNET_BSC }

export default TradingRewardTopTradersPage