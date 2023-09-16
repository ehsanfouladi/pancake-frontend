import { bscTokens } from '@pancakeswap/tokens'
import { Balance, Box, Card, CardBody, CardHeader, Flex, Heading, PageSection, Text } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import { AppBody } from 'components/App'
import { preSaleCbonAbi } from 'config/abi/preSaleCbon'
import { useEffect, useState } from 'react'
import { useBuyCbonActionHandlers, useBuyCbonState, useDefaultsFromURLSearch } from 'state/buyCbon/hooks'
import { Field } from 'state/swap/actions'
import styled from 'styled-components'
import { getPreSaleCbonContract } from 'utils/contractHelpers'
import { createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'
import { CryptoFormView } from 'views/BuyCbon/types'
import Heading1Text, { Heading2Text } from 'views/TradingCompetition/components/CompetitionHeadingText'
import { useAccount, useBalance } from 'wagmi'
import Page from '../Page'
import { BuyCbonForm } from './containers/BuyCbonForm'
import usePriceQuotes from './hooks/usePriceQuoter'
import { AppWrapper, StyledBuyCbonContainer } from './styles'
import HowToPlay from './HowToPlay'
import Link from 'next/link'
import PreSaleBanner from './components/PreSaleBanner'

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-column-gap: 32px;
    grid-template-columns: auto 1fr;
  }
`

const StyledCard = styled(Card)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 520px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 756px;
  }
`

export default function BuyCbon({ userIp }: { userIp: string | null }) {

  const CenterWrapper = styled.div`
    position: absolute;
    left: 48.5%;
    top: 33%;
  `

  const [modalView, setModalView] = useState<CryptoFormView>(CryptoFormView.Input)
  const { onUsersIp } = useBuyCbonActionHandlers()
  const { address } = useAccount()
  useDefaultsFromURLSearch(address)
  const buyCbonState = useBuyCbonState()
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    userIpAddress,
  } = { ...buyCbonState }

  onUsersIp(userIp)
  const { fetchQuotes, quotes: combinedQuotes } = usePriceQuotes(
    typedValue,
    inputCurrencyId,
    outputCurrencyId,
    userIpAddress,
  )
  const client = createPublicClient({
    chain: bsc,
    transport: http(),
  })

  const preSaleContract = getPreSaleCbonContract()

  const [numberOfPurchases, setNumberOfPurchases] = useState(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getTotalNumberOfPurchases = async () => {
    const fetchedNumberOfPurchases = await client.readContract({
      address: preSaleContract.address as `0x${string}`,
      abi: preSaleCbonAbi,
      functionName: 'NumberOfPurchases',
    })
    console.log('fsfsafsa', Number(fetchedNumberOfPurchases))
    setNumberOfPurchases(Number(fetchedNumberOfPurchases))
    // return fetchedNumberOfPurchasesAsInt;
  }

  const [totalCBONPurchased, setTotalCBONPurchased] = useState(null)
  const getTotalCBONPurchased = async () => {
    const fetchedTotalCBONPurchased = await client.readContract({
      address: preSaleContract.address as `0x${string}`,
      abi: preSaleCbonAbi,
      functionName: 'totalCBONPurchased',
    })
    const BigTotalCBONPurchased = new BigNumber(fetchedTotalCBONPurchased?.toString())
    const balancedTotalCBONPurchased = getBalanceNumber(BigTotalCBONPurchased)
    setTotalCBONPurchased(balancedTotalCBONPurchased)
    // return fetchedNumberOfPurchasesAsInt;
  }
  const { address: account } = useAccount()
  const [cbonBalance, setCbonBalance] = useState(null)
  const { data, isSuccess } = useBalance({
    address: account,
    token: bscTokens.cbon.address,
    chainId: 56,
    watch: true,
  })

  const [isBuySuccess, setIsBuySuccess] = useState(false)

  useEffect(() => {
    getTotalNumberOfPurchases().catch(console.error)
    getTotalCBONPurchased().catch(console.error)

    if (isSuccess) {
      setCbonBalance(data?.formatted)
    }
  }, [isSuccess, isBuySuccess, data, getTotalCBONPurchased, getTotalNumberOfPurchases])

  const getNumberOfPurchases = () => {
    return (
      <>
        <Balance
          fontSize="24px"
          color="secondary"
          textAlign={['center', null, null, 'right']}
          lineHeight="1"
          bold
          // prefix="~$"
          // unit = "  CBON"
          value={numberOfPurchases}
          decimals={0}
          mr="30px"
        />
      </>
    )
  }
  const getCbonBalance = () => {
    return (
      <>
        <Balance
          fontSize="24px"
          color="secondary"
          textAlign={['center', null, null, 'right']}
          lineHeight="1"
          bold
          // prefix="~$"
          // unit = "  CBON"
          value={cbonBalance}
          decimals={0}
          mr="30px"
        />
      </>
    )
  }
  const getTotalPurchased = () => {
    return (
      <>
        <Balance
          fontSize="24px"
          color="secondary"
          textAlign={['center', null, null, 'right']}
          lineHeight="1"
          bold
          // prefix="~$"
          // unit = "  CBON"
          value={totalCBONPurchased}
          decimals={0}
          mr="30px"
        />
      </>
    )
  }

  return (
    <Page>
          <Flex verticalAlign="center" alignItems="center" flexDirection="column" mb="15px">
            <Heading2Text
              style={{
                fontSize: '4vw',
              }}
              >
              Introducing  New Token Presale Platform
            </Heading2Text>
            <Heading2Text
              style={{
                fontSize: '4vw',
              }}
              >
              {' '}
              Now On Cadinu Apps{' '}
            </Heading2Text>
          </Flex>
              
          <Flex
            flexDirection="column"
            mt="24px"
            alignItems="center"
            justifyContent='center'
            alignContent='center'
            verticalAlign="center"
            maxWidth='80%'
            // backgroundImage="/images/teams/no-team-banner.png"
            >
            <Link href="/pre-sale">
              <Box position="relative" pb="56px">
                <PreSaleBanner />
              </Box>
            </Link>
          </Flex>
            {/* <AppWrapper> */}
          {/* <AppBody>
            <BuyCbonForm
            setModalView={setModalView}
            modalView={modalView}
            buyCbonState={buyCbonState}
            fetchQuotes={fetchQuotes}
            setIsBuySuccess={setIsBuySuccess}
            />
          </AppBody> */}
        {/* </AppWrapper> */}
        <style>{`.decorated{
              margin-top:5px;
              margin-bottom:5px;
              text-align: center;
              }
              .decorated > span{
              position: relative;
              display: inline-block;

              }
              .decorated > span:before, .decorated > span:after{
              content: '';
              position: absolute;
              top: 50%;
              border-bottom: 2px solid;
              border-color: black;
              width: 20vw;
              margin: 0 12px;
              }
              .decorated > span:before{
              right: 100%;
              }
              .decorated > span:after{
              left: 100%;
            }`}
        </style>
        <h2 className="decorated">
          <span>
            Former Presales
          </span>
        </h2>
        
          <StyledBuyCbonContainer>
      </StyledBuyCbonContainer>
      <StyledCard my="50px">
        <CardHeader p="16px 24px">
          <Flex justifyContent="space-between">
            <Heading mr="12px">CBON PreSale Information (sold out)</Heading>
          </Flex>
        </CardHeader>
        <CardBody>
          <Grid>
            <Flex justifyContent={['center', null, null, 'flex-start']}>
              <Heading fontSize="12pt">Total Purchased CBON</Heading>
            </Flex>
            <Flex flexDirection="column" mb="18px">
              {getTotalPurchased()}
            </Flex>
            <Flex justifyContent={['center', null, null, 'flex-start']}>
              <Heading fontSize="12pt">Total Number of purchases </Heading>
            </Flex>
            <Flex flexDirection="column" mb="18px">
              {getNumberOfPurchases()}
            </Flex>
            <Flex justifyContent={['center', null, null, 'flex-start']}>
              <Heading fontSize="12pt">Your CBON Balance </Heading>
            </Flex>
            <Flex flexDirection="column" mb="18px">
              {getCbonBalance()}
            </Flex>
          </Grid>
        </CardBody>
      </StyledCard>
      {/* <PageSection dividerPosition="top" hasCurvedDivider={false} index={2}>
        <HowToPlay />
      </PageSection> */}
    </Page>
  )
}
