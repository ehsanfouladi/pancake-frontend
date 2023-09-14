import { Box, Card, CardBody, CardFooter, CardHeader, CardProps, Flex, Grid, Heading, PageSection, Row, Text, useMatchBreakpoints } from "@pancakeswap/uikit"
import { PageMeta } from "components/Layout/Page"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import styled, {css} from "styled-components"
import CardActions from "views/Farms/components/FarmCard/CardActionsContainer"
import { cardConfig } from "views/Ifos/components/IfoFoldableCard/IfoPoolCard"
import Page from "views/Page"
import CardFlip from "views/Predictions/components/CardFlip"
import { BodyWrapper } from "views/ShowCase"

export function AppBody({ children, ...cardProps }: { children: React.ReactNode } & CardProps) {
    return <BodyWrapper {...cardProps}>{children}</BodyWrapper>
  }
const createLock = ()=>{
    
  const CreateLockPage = styled.div`
  min-height: calc(100vh - 50px);
  background: linear-gradient(135deg, #4c57a3 0%, #899dcf 100%);
`

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

const StyledCard = styled(AppBody)`
${({ theme }) => theme.mediaQueries.lg} {
    ${
        css`
            &:hover {
              cursor: pointer;
              opacity: 0.6;
              transform : scale(1.05);
            }`
        }
    }
`
    const CardContent =[
        {
            title: "Lock BEP20 Tokens",
            content:"Safeguard BEP20 tokens; ensure transfer restrictions.",
            image: "/images/cadinu-lock/cadinu_lock_token.png",
            alt:"Cadinu Lock BEP20 Token",
            destination: "create/bep20"
        },
        {
            title: "Lock v2 LP Tokens",
            content:"Secure v2 swap liquidity; stabilize swap positions.",
            image: "/images/cadinu-lock/cadinu_v2_lp_lock.png",
            alt:"Cadinu Lock v2 swap liquidity",
            destination: "create/lp"
        },
        {
            title: "Lock v3 LP Tokens",
            content:"Store v3 NFT position; designed for unique v3 swaps.",
            image: "/images/cadinu-lock/cadinu_lock_v3_lp.png",
            alt:"Cadinu Lock v3 NFT position",
            destination: "create/position"
        },
    ]

    const [isFlipped, setIsFlipped] = useState(false)
    return (
        <>
        <PageMeta />
      <CreateLockPage>
        <PageSection index={1} hasCurvedDivider={false}>
          <StyledHeading>Cadinu Locks: Select Your Lock Type</StyledHeading>
          <Flex
            flexDirection="column"
            mb="24px"
            alignItems="center"
            verticalAlign="center"
            // backgroundImage="/images/teams/no-team-banner.png"
          >
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
            {CardContent.map((card) => {
              return (
                <Link
                   href={card.destination} >
                  <StyledCard
                    m={['15px', '10px']}
                    padding="0"
                    // background="#F3F2EE"
                    background= {`${({theme})=> theme.colors.background}`}
                    style={{
                    transition: "transform .2s",
                      flex: '0 1 24%',
                      // maxWidth: "calc(95% - 1em)"
                      height: '360px',
                      border: '10px',
                     
                    }}
                    
                  >
                    <CardHeader style={{ textAlign: 'center' }}>
                      <strong>{card.title}</strong>
                    </CardHeader>
                    <CardBody
                    // className='appCard'
                      style={{
                        padding: '0',
                        background: '#000',
                        // "height": "350px",
                        // "width": "350px",
                        textAlign: 'center',
                      }}
                    >
                      <Image
                        src={card.image}
                        alt={card.alt}
                        width={200}
                        height={200}
                        style={{
                          padding: '0',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        //   borderRadius:"100%",
                        }}
                      />
                    </CardBody>
                    <CardFooter style={{ textAlign: 'center', whiteSpace: 'pre-wrap', verticalAlign: 'center' }}>
                      {card.content}
                    </CardFooter>
                  </StyledCard>
                </Link>
              )
            })}
          </Flex>
          </PageSection>
      </CreateLockPage>
        </>
    )
}

export default createLock