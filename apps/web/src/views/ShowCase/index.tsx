import {
  Flex,
  Card,
  CardProps,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
} from '@pancakeswap/uikit'

import styled from 'styled-components'
import Page from '../Page'
import Image from 'next/image'
import Link from 'next/link'
import { isDesktop, isMobile } from 'react-device-detect'
import { marginBottom } from 'styled-system'

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  max-width: 412px;
  width: 500px;
  z-index: 1;
`

export function AppBody({ children, ...cardProps }: { children: React.ReactNode } & CardProps) {
  return <BodyWrapper {...cardProps}>{children}</BodyWrapper>
}
export default function ShowCase() {
  const Apps = [
    {
      "title" : "VOTING",
      "image" : "/images/cadinu-apps/vote.jpg",
      "alt" : "VotingImage",
      "desc" : "Cadinu Voting is a crypto app that lets you vote on Cadinu proposals. You can also create your own proposals and get feedback. Democratic, decentralized and rewarding. Join now and vote!",
      "destination": "/voting"
    },
    {
      "title" : "LOTTERY",
      "image" : "/images/cadinu-apps/lottery.jpg",
      "alt" : "LotteryImage",
      "desc" : "Cadinu Lottery is a crypto game that lets you win big prizes. Buy tickets with CADINU tokens and enter the daily draws. The more tickets, the higher the chances. Fair, transparent and secure.",
      "destination": "/lottery"
    },
    {
      "title" : "CLICK TO WIN",
      "image" : "/images/cadinu-apps/c2w.jpg",
      "alt" : "C2WImage",
      "desc" : "Cadinu Click to Win is a crypto app that lets you win prizes by clicking. Easy, fun and profitable."+("\u000A")+ " Try it now and click to win!",
      "destination": "/click-to-win"
    },
    // {
    //   "title" : "App_Title_4",
    //   "image" : "/images/cadinu-apps/stake.jpg",
    //   "alt" : "App_Alt_4",
    //   "desc" : "APP_Desc_4",
    //   "destination": "app_url"
    // },
    // {
    //   "title" : "App_Title_5",
    //   "image" : "/images/cadinu-apps/farm.jpg",
    //   "alt" : "App_Alt_5",
    //   "desc" : "APP_Desc_5",
    //   "destination": "app_url"
    // },
  ]
  const numberOfRows = Math.floor(Apps.length/3)
  const arrayRange = (start, stop, step) =>
    Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
    );

  const StyledHeading = styled(Heading)`
  font-family: Arial, Helvetica, sans-serif;
  font-size: 36px;
  font-weight: bold;
  color: #0000faa;
  background: -webkit-linear-gradient(#00ffff 0%, #008080 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-stroke: 6px transparent;
  text-shadow: 0px 4px 4px rgba(0, 255, 255, 0.25);
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

  return (
    <Page >
      <StyledBanner>
      <StyledHeading>
      {/* <PreTitle> */}
        Cadinu Apps: The Ultimate Crypto Platform for Games and Apps
        {/* </PreTitle> */}
      </StyledHeading>
      </StyledBanner>
      {arrayRange(1,Apps.length,3).map((row=>{
        return(
          <Flex width={['100%', '412px']} height="100%" flexDirection={isMobile ? "column":"row"} justifyContent="center" position="relative" alignItems="flex-start">
      {Apps.slice(row - 1,row +2).map((app) =>{
        return(
        <>
        <Link href={app.destination}>
        <AppBody m={"15px"}>
        {/* <CardHeader style={{"textAlign":"center"}} >
          <strong >
          {app.title}
          </strong>
        </CardHeader> */}
          <CardBody 
          style={{
            "padding":"0",
            "background": "#fff",
            // "height": "350px",
            // "width": "350px",
            textAlign : "center",
            margin : "45px 15px 15px 15px",
          }}
          >
          <Image src={app.image} alt={app.alt} width={100} height={100} style={{
            "padding": "0",
            alignContent:"center",
            "backgroundSize": "cover",
            "backgroundPosition": "center",
            "backgroundRepeat": "no-repeat",
            borderRadius: "100px",
            whiteSpace:"pre-wrap"
            }}/>
            <br />
            <br />
          <strong style={{textAlign: "center", fontSize:"20pt", marginTop:"10px",}}>
            {app.title}
          </strong>
        <CardFooter style={{"textAlign":"justify", whiteSpace:"pre-wrap", marginTop:"10px"}}>
          {app.desc}
        </CardFooter>
          </CardBody>
        </AppBody>
      </Link>
      </>
      )})}
      </Flex>
        )
      }))}      
      
    </Page>
  )
}
