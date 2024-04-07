import CompetitionProject from '../../../views/CompetitionProjects'

// export default CompetitionProjectPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage

import { SUPPORT_MAINNET_BSC } from 'config/constants/supportChains'

const CompetitionProjectPage = () => <CompetitionProject />

CompetitionProjectPage.chains = SUPPORT_MAINNET_BSC

export default CompetitionProjectPage