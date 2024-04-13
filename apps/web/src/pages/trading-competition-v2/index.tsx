import { SUPPORT_MAINNET_BSC } from 'config/constants/supportChains'
import TradingReward from '../../views/TradingRewardV2'

const TradingRewardPage = () => <TradingReward />
TradingRewardPage.chains = { SUPPORT_MAINNET_BSC }

export default TradingRewardPage