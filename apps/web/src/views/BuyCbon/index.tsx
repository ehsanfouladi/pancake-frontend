import { Balance, Box, Card, CardBody, CardHeader, Container, Flex, Heading, Table, Td, Th } from '@pancakeswap/uikit'
import { AppBody } from 'components/App'
import { useEffect, useState } from 'react'
import { useBuyCbonActionHandlers, useBuyCbonState, useDefaultsFromURLSearch } from 'state/buyCbon/hooks'
import { Field } from 'state/swap/actions'
import { useAccount, useBalance } from 'wagmi'
import { CryptoFormView } from 'views/BuyCbon/types'
import Page from '../Page'
import { BuyCbonForm } from './containers/BuyCbonForm'
import { CryptoQuoteForm } from './containers/CryptoQuoteForm'
import { StyledBuyCbonContainer, AppWrapper } from './styles'
import usePriceQuotes from './hooks/usePriceQuoter'
import { OnRamoFaqs } from './components/FAQ'
import styled from 'styled-components'
import Heading1Text, { Heading2Text } from 'views/TradingCompetition/components/CompetitionHeadingText'
import { FooterBox } from 'views/Farms/components/BCakeMigrateModal'
import { InfoBox } from '@pancakeswap/uikit/src/components/LiquidityChartRangeInput/InfoBox'
import { AtomBox } from '@pancakeswap/ui'
import { createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'
import { getPreSaleCbonContract } from 'utils/contractHelpers'
import { preSaleCbonAbi } from 'config/abi/preSaleCbon'
import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { BSC_TOKEN_WHITELIST } from 'config/constants/info'
import { bscTokens } from '@pancakeswap/tokens'



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
    transport: http()
  })

  const preSaleContract = getPreSaleCbonContract();
  
  const [numberOfPurchases , setNumberOfPurchases] = useState(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  const getTotalNumberOfPurchases = async () => {
      const fetchedNumberOfPurchases = await client.readContract({
          address: preSaleContract.address as `0x${string}`,
          abi: preSaleCbonAbi,
          functionName: 'NumberOfPurchases',
      });
      console.log("fsfsafsa", Number(fetchedNumberOfPurchases));
     setNumberOfPurchases(Number(fetchedNumberOfPurchases));
    // return fetchedNumberOfPurchasesAsInt;
  };

  const [totalCBONPurchased , setTotalCBONPurchased] = useState(null);
  const getTotalCBONPurchased = async () => {
    const fetchedTotalCBONPurchased = await client.readContract({
        address: preSaleContract.address as `0x${string}`,
        abi: preSaleCbonAbi,
        functionName: 'totalCBONPurchased',
    });
    const BigTotalCBONPurchased = new BigNumber(fetchedTotalCBONPurchased?.toString())
    const balancedTotalCBONPurchased = getBalanceNumber(BigTotalCBONPurchased)
    setTotalCBONPurchased(balancedTotalCBONPurchased);
  // return fetchedNumberOfPurchasesAsInt;
};
const {address:account} = useAccount()
const [cbonBalance, setCbonBalance] = useState(null)
const { data, isSuccess } = useBalance({
  address:account,
  token: bscTokens.cbon.address,
})

  useEffect(() => {
      getTotalNumberOfPurchases().catch(console.error)
      getTotalCBONPurchased().catch(console.error)
      if(isSuccess){
      setCbonBalance(data?.formatted);
      }
      // openWinRateModal()
      // setIsSuccess(isSuccess)
      // audio.play().then()
    // }
    }, [isSuccess])

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
            mr={"30px"}
            
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
            mr={"30px"}
            
          />

      </>
    )
  }
  const getTotalurchased = () => {
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
            mr={"30px"}
            
          />

      </>
    )
  }

  return (
    <Page>
      {/* <Flex marginBottom="30px" justifyContent="center" position="relative" alignItems="flex-start">
        <Flex flexDirection="column"> */}
        {/* TODO: Responsive */}
          <StyledBuyCbonContainer>
            <AppWrapper>
                <Flex verticalAlign="center" alignItems="center" flexDirection="column" mb="15px">
              <Heading2Text>Introducing the Revolutionary New Token</Heading2Text>
              <Heading2Text> Now On PreSale </Heading2Text>
              </Flex>
              <AppBody>
                
                  <BuyCbonForm
                    setModalView={setModalView}
                    modalView={modalView}
                    buyCbonState={buyCbonState}
                    fetchQuotes={fetchQuotes}
                  />
              </AppBody>
            </AppWrapper>
          </StyledBuyCbonContainer>
          {/* <AppBody> */}
          {/* <StyledBuyCbonContainer mt={'50px'} > */}
            <StyledCard my={"50px"}>
              <CardHeader p="16px 24px">
                <Flex justifyContent="space-between">
                  <Heading mr="12px">PreSale Information</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Grid>
                <Flex justifyContent={['center', null, null, 'flex-start']} >
                  <Heading fontSize='12pt'>Total Purchased CBON</Heading>
                  </Flex>
                <Flex flexDirection="column" mb="18px">
                    {getTotalurchased()}
                  </Flex>
                  <Flex justifyContent={['center', null, null, 'flex-start']} >
                  <Heading fontSize='12pt'>Total Number of purcheses </Heading>
                  </Flex>
                <Flex flexDirection="column" mb="18px">
                    {getNumberOfPurchases()}
                  </Flex>
                  <Flex justifyContent={['center', null, null, 'flex-start']} >
                  <Heading fontSize='12pt'>Your CBON Balance </Heading>
                  </Flex>
                <Flex flexDirection="column" mb="18px">
                    {getCbonBalance()}
                  </Flex>
                </Grid>
              </CardBody>
            </StyledCard>
            {/* </AppBody> */}
          {/* </StyledBuyCbonContainer> */}
        {/* </Flex>
      </Flex>
      */}
    </Page>
  )
}
