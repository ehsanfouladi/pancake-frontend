import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Card, CardBody, CardFooter, CardHeader, CardRibbon, Flex, Heading, IfoSkeletonCardDetails, LinkExternal, Text, TimerIcon, useMatchBreakpoints, useTooltip } from '@pancakeswap/uikit'
import { CardWrapper } from '@pancakeswap/uikit/src/widgets/Liquidity'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { useCbonPriceAsBN } from '@pancakeswap/utils/useCakePrice'
import { lpTokenABI } from 'config/abi/lpTokenAbi'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import useSWR from 'swr'
import { Address, readContracts, useAccount } from 'wagmi'
import { COMPETITION_API_URL } from './constants'

interface EndTimeTooltipComponentProps {
  endTime: number;
}
const LiveCompetitions = () => {

  const BACKGROUND_COLOR = 'radial-gradient(55.22% 134.13% at 57.59% 0%, #F5DF8E 0%, #FCC631 33.21%, #FF9D00 79.02%)'

  const StyledBackground = styled(Flex)`
  position: relative;
  flex-direction: column;
  padding-top: 48px;
  margin-bottom: 0;
  background: ${BACKGROUND_COLOR};
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

  const {
    t,
    currentLanguage: { locale },
  } = useTranslation();
  const { isMobile } = useMatchBreakpoints()
  const router = useRouter()

  const cbonPrice = useCbonPriceAsBN()

  const fetcher = url => fetch(url).then(res => res.json())


  const handleClick = async (poolAddress: string, exchangeName) => {

    const res = await readContracts({
      contracts: [
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

    let url = ''
    switch (exchangeName) {
      case 'cadinuSwap':
      default:
        (url = `https://apps.cadinu.io/swap?inputCurrency=${res[0].result}&outputCurrency=${res[1].result
          }`)
        break;
      case 'pancakeSwap':
        (url = `https://pancakeswap.finance/swap?inputCurrency=${res[0].result}&outputCurrency=${res[1].result
          }`)
        break;
      case 'uniSwap':
        (url = 'https://app.uniswap.org/swap?chain=bnb')
        break;
    }

    router.push(url)

  }


  const { data, isLoading } = useSWR(`${COMPETITION_API_URL}/live-competitions`, fetcher)

  const EndTimeTooltipComponent: React.FC<React.PropsWithChildren<EndTimeTooltipComponentProps>> = ({
    endTime,
  }) => {
    
    return (
      <>
        <Text bold>{t("Time")}:</Text>
        <Text>
          {new Date(endTime * 1000).toLocaleString(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </Text>
      </>
    );
  }

  function TimeCountdownDisplay({
    timestamp,
    getNow = () => Date.now(),
  }: {
    timestamp: number;
    getNow?: () => number;
  }) {

    const currentDate = getNow() / 1000;
    const competitionTimeRemaining = Math.abs(timestamp - currentDate);
    const endTimeObject = useMemo(() => getTimePeriods(competitionTimeRemaining), [competitionTimeRemaining]);
    const hasTimePassed = (timestamp - currentDate) < 0

    const {
      targetRef: endTimeTargetRef,
      tooltip: endTimeTooltip,
      tooltipVisible: endTimeTooltipVisible,
    } = useTooltip(<EndTimeTooltipComponent endTime={timestamp} />, {
      placement: "top",
    });
    return (
      <Flex alignItems="center">
        <Text color="textSubtle" small>
          {!hasTimePassed
            ? endTimeObject?.totalDays
              ? endTimeObject?.totalDays === 1
                ? t("1 day")
                : t("%days% days", { days: endTimeObject?.totalDays })
              : t("< 1 day")
            : t("%days% days ago", { days: endTimeObject?.totalDays })}
        </Text>
        <span ref={endTimeTargetRef}>
          <TimerIcon ml="4px" color="primary" />
          {endTimeTooltipVisible && endTimeTooltip}
        </span>
      </Flex>
    );
  }

  return (
    <StyledBackground justifyContent='center' >
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
        {isLoading && (
          <IfoSkeletonCardDetails />
        )}
        {data && data.competitions.map(competition => (
          <>
            <CardWrapper margin='5px' style={{ flexWrap: "wrap", minWidth: '360px', maxWidth: '28%' }} >
              <Card ribbon={competition.isBoosted && <CardRibbon text='Boosted' ribbonPosition="right" />} >
                <Link href={`trading-competition/top-traders/${competition._id}`}>
                  <CardHeader style={{ textAlign: 'center' }} >
                    <Heading>
                      {`ID #${competition._id}`}
                    </Heading>
                  </CardHeader>
                </Link>
                <CardBody style={{ padding: '5px' }}>
                  <Flex
                    width='100%'
                    flexDirection='row'
                    flexWrap="wrap"
                    alignItems='center'
                    justifyContent='center'
                    verticalAlign='center'
                  >
                    <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                      <strong style={{ flex: '1 1 160px' }}>Pool :</strong>
                      <span >{competition.token0}/{competition.token1}</span>
                    </Box>
                    <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                      <strong style={{ flex: '1 1 160px' }}>Start Time:</strong>
                      <span style={{ margin: "3px" }}>
                        <TimeCountdownDisplay timestamp={Number(competition.startTime)} />
                      </span>
                    </Box>
                    <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                      <strong style={{ flex: '1 1 160px' }}>End Time:</strong>
                      <span style={{ margin: "3px" }}>
                        <TimeCountdownDisplay timestamp={Number(competition.endTime)} />
                      </span>
                    </Box>
                    <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                      <strong style={{ flex: '1 1 50px' }}>Reward:</strong>
                      <span >{`${competition.rewardAmount} CBON ~ $${(competition.rewardAmount * Number(cbonPrice)).toFixed(2)}`}</span>
                    </Box>
                    <Box mt="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                      <strong style={{ flex: '1 1 160px' }}>DEX:</strong>
                      <span >{competition.exchangeName}</span>
                    </Box>
                    <Box my="15px" style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }} width="85%">
                      <strong style={{ flex: '1 1 160px' }}>Projec:</strong>
                      <LinkExternal href={competition.projectUrl}>
                        <span >{competition.projectName}</span>
                      </LinkExternal>
                    </Box>
                    <CardFooter
                    //                         style={{
                    //   backgroundColor: currentTheme.colors.background,
                    //   borderBottomRightRadius:'25px',
                    //   borderBottomLeftRadius:'25px',
                    //   textAlign:'center'
                    // }}
                    >
                      <Flex
                        width='100%'
                        flexDirection='row'
                        flexWrap="wrap"
                        justifyContent='center'
                        verticalAlign='center'

                      >

                        <Button scale='sm' variant='danger'
                          onClick={() => handleClick(competition.poolAddress, competition.exchangeName)}
                        >
                          Trade Now
                        </Button>
                      </Flex>
                    </CardFooter>
                  </Flex>
                </CardBody>
              </Card>
            </CardWrapper>

          </>
        ))}

      </Flex>
    </StyledBackground>
  )
}
export default LiveCompetitions
