import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { Flex, Card, CardProps, CardHeader, CardBody, CardFooter, Heading, Tag, PageSection } from '@pancakeswap/uikit'

import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import Image from 'next/image'
import Link from 'next/link'
import Countdown from './countdown'

export const BodyWrapper = styled(Card)`
  border-radius: 40px;
  max-width: 380px;
  width: 326px;
  z-index: 1;
`

export function AppBody({ children, ...cardProps }: { children: React.ReactNode } & CardProps) {
  return <BodyWrapper {...cardProps}>{children}</BodyWrapper>
}
export default function ShowCase() {
  const isEnabled = Date.now() / 1000 > 1692090000
  const Apps = [
    {
      title: 'VOTING',
      image: '/images/cadinu-apps/Cadinu-Vote.png',
      alt: 'Cadinu-Voting',
      desc: "Have a say in CADINU's future development through community voting powered by CADINU token and CBON. Your voice matters! \n",
      destination: '/voting',
      enabled: true,
    },
    {
      title: 'LOTTERY',
      image: '/images/cadinu-apps/Cadinu-Lottery.png',
      alt: 'Cadinu-LotteryImage',
      desc: 'Participate in thrilling lotteries powered by the CADINU token. Grab your chance to win amazing rewards at CADINU Lottery!',
      destination: '/lottery',
      enabled: true,
    },
    {
      title: 'CLICK TO WIN',
      image: '/images/cadinu-apps/Cadinu-C2W.png',
      alt: 'Cadinu-C2WImage',
      desc: 'Participate in C2W Dapp for a chance to win free CADINU tokens. Just one click away from fantastic prizes.',
      destination: '/click-to-win',
      enabled: true,
    },
    {
      title: 'MultiSwap',
      image: '/images/cadinu-apps/Cadinu-Swap.png',
      alt: 'Cadinu-MultiSwap',
      desc: 'Effortlessly exchange cryptocurrencies like Bitcoin, Ethereum and etc with CADINU secure Dapp. Discover fast and seamless trading',
      destination: '/swap',
      enabled: isEnabled,
      hasCountDown: true,
    },
    {
      title: 'Farming',
      image: '/images/cadinu-apps/Cadinu-Farm.png',
      alt: 'Cadinu-Farming',
      desc: " Earn CADINU and CBON rewards by providing liquidity to CADINU's decentralized exchange and fueling the CADINU ecosystem",
      destination: '/farms',
      enabled: isEnabled,
      hasCountDown: true,
    },
    {
      title: 'Staking',
      image: '/images/cadinu-apps/Cadinu-Staking.png',
      alt: 'Cadinu-Staking',
      desc: " Lock up CBON, CADINU, and other tokens to earn passive rewards and support CADINU's growth journey, along with other promising projects.",
      destination: '/pools',
      enabled: isEnabled,
    },
  ]

  const StyledHeading = styled(Heading)`
    font-family: Arial, Helvetica, sans-serif;
    font-size: 36px;
    font-weight: bold;
    color: #f7f7f7;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-stroke: 6px transparent;
    text-shadow: 0px 4px 4px rgba(7, 43, 76);
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 8px;
  `
  const StyledBanner = styled(Flex)`
    font-family: Arial, Helvetica, sans-serif;
    font-size: 36px;
    font-weight: bold;
    color: #000000;
    background: -webkit-linear-gradient(#00ffff 0%, #008080 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-stroke: 6px transparent;
    text-shadow: 0px 4px 4px rgba(0, 255, 255, 0.25);
    text-transform: uppercase;
    margin-bottom: 8px;
  `

  const ShowCasePage = styled.div`
    min-height: calc(100vh - 50px);
  `
  dayjs.extend(utc)
  dayjs.extend(weekOfYear)

  const [unixNow, setUnixNow] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      setUnixNow(now)
    }, 2000)
    return () => clearTimeout(timer)
  })

  return (
    <>
      <PageMeta />
      <ShowCasePage>
        <PageSection index={1} background="linear-gradient(135deg, #4c57a3 0%, #899dcf 100%)" hasCurvedDivider={false}>
          <StyledHeading>Cadinu Apps: The Ultimate Crypto Platform for Games and Apps</StyledHeading>
          <Flex
            width={['328px', '100%']}
            flexWrap="wrap"
            maxWidth="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            {Apps.map((app) => {
              return (
                <Link href={app.destination} style={{ pointerEvents: app.enabled ? 'visible' : 'none' }}>
                  <AppBody
                    m={['15px', '10px']}
                    padding="0"
                    style={{
                      flex: '0 1 24%',
                      // maxWidth: "calc(95% - 1em)"
                      height: '420px',
                      border: '10px',
                    }}
                  >
                    <CardHeader style={{ textAlign: 'center' }}>
                      <strong>{app.title}</strong>
                    </CardHeader>
                    <CardBody
                      style={{
                        padding: '0',
                        background: '#fff',
                        // "height": "350px",
                        // "width": "350px",
                        textAlign: 'center',
                      }}
                    >
                      <Image
                        src={app.image}
                        alt={app.alt}
                        width={200}
                        height={200}
                        style={{
                          padding: '0',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          // borderRadius:"100%",
                        }}
                      />
                    </CardBody>
                    <CardFooter style={{ textAlign: 'center', whiteSpace: 'pre-wrap', verticalAlign: 'center' }}>
                      {app.desc}
                      {!app.enabled && !app.hasCountDown && (
                        <Flex justifyContent="center" mt="10px" position="relative">
                          <Tag variant="binance">Comming Soon</Tag>
                        </Flex>
                      )}
                      {app.hasCountDown && !app.enabled && <Countdown nextEventTime={1692090000 - unixNow} />}
                    </CardFooter>
                  </AppBody>
                </Link>
              )
            })}
          </Flex>
        </PageSection>
      </ShowCasePage>
    </>
  )
}
