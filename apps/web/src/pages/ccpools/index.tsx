import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/pools'

import Pools from 'views/Pools'

const PoolsPage = () => <Pools />

PoolsPage.chains = SUPPORTED_CHAIN_IDS

export default PoolsPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
