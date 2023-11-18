import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Card, CardBody, CardFooter, CardHeader, CardRibbon, Flex, IfoSkeletonCardDetails, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { lpTokenABI } from 'config/abi/lpTokenAbi'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import useSWR from 'swr'
import { Address, readContracts, useAccount } from 'wagmi'
import { COMPETITION_API_URL } from './constants'

const LiveCompetitions = () => {

const BACKGROUND_COLOR = 'radial-gradient(55.22% 134.13% at 57.59% 0%, #F5DF8E 0%, #FCC631 33.21%, #FF9D00 79.02%)'

const StyledBackground = styled(Flex)<{ showBackgroundColor: boolean }>`
  position: relative;
  flex-direction: column;
  padding-top: 48px;
  margin-bottom: 0;
  background: ${({ showBackgroundColor }) => (showBackgroundColor ? BACKGROUND_COLOR : '')};
  z-index: 0;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 50px 0;
  }
`

const StyledHeading = styled(Text)`
  position: relative; 
  font-size: 40px;
  font-weight: 900;
  line-height: 98%;
  letter-spacing: 0.01em;
  background: linear-gradient(166.02deg, #ffb237 -5.1%, #ffeb37 75.24%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: auto;
  margin-bottom: 40px;
  padding: 0 16px;
  text-align: center;

  &::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    padding: 0 16px;
    z-index: -1;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: 8px rgb(101, 50, 205, 1);
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 56px;
    padding: 0;

    &::after {
      padding: 0;
    }
  }
`

  const {address:account} = useAccount()
  const {t} = useTranslation()
  const {isMobile} =useMatchBreakpoints()
  const router = useRouter()

  const fetcher = url => fetch(url).then(res => res.json())


  const handleClick = async (poolAddress: string, exchangeName)=>{

    const res = await  readContracts({
      contracts:[
        {
          address: poolAddress as Address,
          abi: lpTokenABI,
          functionName: 'token0'
        },
        {
          address: poolAddress as Address,
          abi: lpTokenABI,
          functionName: 'token1'
        },
      ]
    })

    let url =''
    switch(exchangeName){
      case 'cadinuSwap':
        default:
        (url = `https://apps.cadinu.io/swap?inputCurrency=${res[0].result}&outputCurrency=${
          res[1].result
        }`)
        break;
      case 'pancakeSwap':
        (url = `https://pancake.finance/swap?inputCurrency=${res[0].result}&outputCurrency=${
          res[1].result
        }`)
        break;
      case 'uniSwap':
        (url = 'https://app.uniswap.org/swap?chain=bnb')
        break;
      }
      
      router.push(url)
      
    }
  

  const {data, isLoading} = useSWR(`${COMPETITION_API_URL}/live-competitions`,fetcher )
  
  
  return (
    <StyledBackground showBackgroundColor={!!account} justifyContent='center' >
      <StyledHeading data-text={t('Live Competitions')}>{t('Live Competitions')}</StyledHeading>
      <Flex flexDirection={isMobile ? 'column' : 'row'}
      width={['328px', '100%']}
      flexWrap="wrap"
      maxWidth="100%"
      height="100%"
      alignItems='flex-start'
      justifyContent="center"
      position="relative"
      >
        {isLoading &&(
          <IfoSkeletonCardDetails />
        )}
        {data && data.competitions.map(competition=>(
          <Link href={`trading-reward/top-traders/${competition._id}`}>
          <Card ribbon={competition.isBoosted && <CardRibbon text='Boosted' ribbonPosition="right" />}
          m='15px' 
          style={{
            width:isMobile ? '.9 rem' : '100%',
            flex: '0 1 28%',
            minWidth: isMobile && "calc(98% - 1em)",
            // height: '2800px',
            border: '10px',
            backgroundColor: 'transparent'
          }}
          >
            
        <CardHeader style={{textAlign:'center'}} >
          
          <Text>Competition ID #{competition._id}</Text>
        </CardHeader>
        <CardBody style={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}>
          <Box>
          <Text>  {`Pool: ${competition.token0}/${competition.token1}`}</Text>
          <Text>  {`Start Time: ${format(new Date(Number(competition.startTime * 1000)), 'yyyy-MM-dd HH:mm')}`}</Text>
          <Text>  {`End Time: ${format(new Date(Number(competition.endTime * 1000)), 'yyyy-MM-dd HH:mm')}`}</Text>
          <Text>  {`Exchange: ${competition.exchangeName}`}</Text>
          </Box>
        </CardBody>
        <CardFooter style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderBottomRightRadius:'25px',
          borderBottomLeftRadius:'25px',
          textAlign:'center'
        }}>
          <Button scale='sm' variant='danger'
            onClick={()=>handleClick(competition.poolAddress, competition.exchangeName)}
          >
          Trade Now
          </Button>
        </CardFooter>
      </Card>
      </Link>
        ))}
            
      </Flex>
    </StyledBackground>
 )}
export default LiveCompetitions
