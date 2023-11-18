import { SUPPORT_ONLY_BSC } from 'config/constants/supportChains'

import Pools from 'views/Pools'

const PoolsPage = () => <Pools />

PoolsPage.chains = SUPPORT_ONLY_BSC

export default PoolsPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
