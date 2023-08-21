import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | CadinuSwap',
  defaultTitle: 'Cadinu',
  description:
    'Cadinu.io is a global project that aims to facilitate its holders to earn income, enjoy life, and support pets. With our fully decentralized CADINU TOKEN, users can make on-platform and off-platform payments. Our platform offers unique and innovative P2E games that influence the real world and provides opportunities to support needy pets directly and indirectly. Join us in creating a better world for all.',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@Cadinu',
    site: '@Cadinu',
  },
  openGraph: {
    title: '🥞 Cadinu - A next evolution DeFi exchange on BNB Smart Chain (BSC)',
    description:
      'Cadinu.io is a global project that aims to facilitate its holders to earn income, enjoy life, and support pets. With our fully decentralized CADINU TOKEN, users can make on-platform and off-platform payments. Our platform offers unique and innovative P2E games that influence the real world and provides opportunities to support needy pets directly and indirectly. Join us in creating a better world for all.',
    images: [{ url: 'https://assets.Cadinu.finance/web/og/hero.jpg' }],
  },
}
