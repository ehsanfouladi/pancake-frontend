import { InfoPageLayout } from 'views/V3Info/components/Layout'
import Overview from 'views/V3Info'

const InfoPage = () => {
  return <Overview />
}

InfoPage.Layout = InfoPageLayout
InfoPage.chains = [] // set all

export default InfoPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
