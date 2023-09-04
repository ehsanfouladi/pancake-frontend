import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Flex,
  Heading,
  PageSection,
  Tag,
} from '@pancakeswap/uikit'
import { PageMeta } from 'components/Layout/Page'
import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import PreSaleBanner from './preSaleBanner'
import styles from './showcaseStyles.module.css'

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
      enabled: true,
      // hasCountDown: true,
    },
    {
      title: 'Farming',
      image: '/images/cadinu-apps/Cadinu-Farm.png',
      alt: 'Cadinu-Farming',
      desc: " Earn CADINU and CBON rewards by providing liquidity to CADINU's decentralized exchange and fueling the CADINU ecosystem",
      destination: '/farms',
      enabled: true,
      // hasCountDown: true,
    },
    {
      title: 'Staking',
      image: '/images/cadinu-apps/Cadinu-Staking.png',
      alt: 'Cadinu-Staking',
      desc: " Lock up CBON, CADINU, and other tokens to earn passive rewards and support CADINU's growth journey, along with other promising projects.",
      destination: '/pools',
      enabled: true,
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
    font-size: 24pt;
    font-weight: bold;
    color: #ccaf5f;
    background: -webkit-linear-gradient(90deg, #b05656 0%, #b05656 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-stroke: 2px transparent;
    text-shadow: 0px 4px 4px rgba(0, 255, 255, 0.25);
    text-transform: uppercase;
    margin-bottom: 8px;
    flex: flex;
    justify-content: center;
    align-content: center;
    text-align: center;
    z-index: 100;
  `
//   const StyledCardFooter = styled.div<CardFooterProps>`
//   border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  
//   ${space}
// `
  const StyledBannerWrapper = styled.div`
    ${({ theme }) => `background-color: ${theme.colors.cardBorder}`};
    flex: none;
    position: relative;
    width: 100%;
    box-shadow: 5px 5px 7px #163553;
    border-radius: 32px;
    height: 95px;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    felx-direction: row;
    vertical-align: center;
    align-items: center;
    justify-content: center;
    // animation: ${styles.BannerAnimation} 10s ease infinite alternate;

    ${({ theme }) => theme.mediaQueries.sm} {
      height: 192px;
    }

    ${({ theme }) => theme.mediaQueries.md} {
      height: 256px;
    }
  `

  const ShowCasePage = styled.div`
    min-height: calc(100vh - 50px);
  `
  return (
    <>
      <PageMeta />
      <ShowCasePage>
        <PageSection index={1} background="linear-gradient(135deg, #4c57a3 0%, #899dcf 100%)" hasCurvedDivider={false}>
          <StyledHeading>Cadinu Apps: The Ultimate Crypto Platform for Games and Apps</StyledHeading>
          <Flex
            flexDirection="column"
            mb="24px"
            alignItems="center"
            verticalAlign="center"
            // backgroundImage="/images/teams/no-team-banner.png"
          >
            <Link href="/pre-sale">
              <Box position="relative" pb="56px">
                <PreSaleBanner />
              </Box>
            </Link>
          </Flex>
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
                <Link
                   href={app.destination} 
                   style={{
                     pointerEvents: app.enabled  ? 'visible' : 'none' }}>
                  <AppBody
                    
                    m={['15px', '10px']}
                    padding="0"
                    // background="#F3F2EE"
                    background= {`${({theme})=> theme.colors.background}`}
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
                    // className='appCard'
                      style={{
                        padding: '0',
                        background: '#F3F2EE',
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
                      {!app.enabled && (
                        <Flex justifyContent="center" mt="10px" position="relative">
                          <Tag variant="binance">Comming Soon</Tag>
                        </Flex>
                      )}
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
