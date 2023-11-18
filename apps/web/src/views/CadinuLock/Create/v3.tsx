
import { CardBody, CardHeader, CardProps, Flex, Heading, PageSection } from "@pancakeswap/uikit"
import { PageMeta } from "components/Layout/Page"
import  isEmpty from "lodash/isEmpty"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import styled, { css } from "styled-components"
import { Address } from "viem"
import { BodyWrapper } from "views/ShowCase"
import { getAllNonFungiblesPositionManagers } from "../helpers"

export function AppBody({ children, ...cardProps }: { children: React.ReactNode } & CardProps) {
    return <BodyWrapper {...cardProps}>{children}</BodyWrapper>
  }
const V3 = ()=>{

const [v3Contracts,setV3Contracts] = useState([] as readonly string[])
const [nfpAddresses, setNfpAddresses] = useState([]as readonly Address[])
const getNFPs = useCallback(async()=>{
    const {v3Contracts: NFPs, v3ContractAddresses} = await getAllNonFungiblesPositionManagers()
    setV3Contracts(NFPs)
    setNfpAddresses(v3ContractAddresses)
},[]) 

useEffect(()=>{
    if (isEmpty(v3Contracts)){
        getNFPs()
    }
})

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
const CardContent = v3Contracts.map((nfp, index)=>(
        {
            'title': nfp.split(/(?=[A-Z])/).join(" "),
            'image': `/images/cadinu-lock/nfps/${nfp}.png`,
            'alt':`Cadinu Lock NonFungiblesPositionManager ${nfp}`,
            'destination': `v3/${nfpAddresses[index]}`
        }
))

    return (
        <>
        <PageMeta />
      <CreateLockPage>
        <PageSection index={1} hasCurvedDivider={false}>
          <StyledHeading>Select Your Position Manager</StyledHeading>
         
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
                      height: '280px',
                      border: '10px',
                     
                    }}
                    
                  >
                    <CardHeader style={{ textAlign: 'center' }}>
                      <strong>{card.title}</strong>
                    </CardHeader>
                    <CardBody
                    // className='appCard'
                     
                    >
                    <Flex alignContent='center' justifyContent='center' verticalAlign='center'>
                      <Image
                        src={card.image}
                        alt={card.alt}
                        width={150}
                        height={150}
                        style={{
                          padding: '0',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          verticalAlign:'center',
                          aspectRatio:'14/13',
                          objectFit: 'contain'
                        //   borderRadius:"100%",
                        }}
                      />
                      </Flex>
                    </CardBody>
                    {/* <CardFooter style={{ textAlign: 'center', whiteSpace: 'pre-wrap', verticalAlign: 'center' }}>
                      {card.content}
                    </CardFooter> */}
                  </StyledCard>
                </Link>
              )
            })}
          </Flex>
          </PageSection>
      </CreateLockPage>
        </>
    )


// return (
//     <>
//         <Page>
//         <Heading>Choose Your Position Provider</Heading>
//         {v3Contracts.map(nfp=>(
//             <h2>
//                 {nfp}
//             </h2>
//         ))}
//         </Page>
//         </>
//     )
}

export default V3