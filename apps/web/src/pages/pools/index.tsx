import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/pools'
import { ChainId } from '@pancakeswap/sdk'

import Pools from 'views/Pools'

const PoolsPage = () => <Pools />

PoolsPage.chains = [ChainId.BSC]

export default PoolsPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
