import Tokens from 'views/Info/Tokens'
import { InfoPageLayout } from 'views/Info'

const InfoTokensPage = () => {
  return <Tokens />
}

InfoTokensPage.Layout = InfoPageLayout
InfoTokensPage.chains = [] // set all

export default InfoTokensPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
