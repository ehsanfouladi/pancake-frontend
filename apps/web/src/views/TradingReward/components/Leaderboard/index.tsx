import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Card, CardBody, Flex, Grid, LinkExternal, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useCbonPriceAsBN } from '@pancakeswap/utils/useCakePrice'
import Container from 'components/Layout/Container'
import { lpTokenABI } from 'config/abi/lpTokenAbi'
import { format } from 'date-fns'
import isEmpty from 'lodash/isEmpty'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import Countdown from 'views/TradingCompetition/components/Countdown'
import { COMPETITION_API_URL } from 'views/TradingReward/constants'
import { RankListDetail } from 'views/TradingReward/hooks/useRankList'
import { Address, readContracts } from 'wagmi'
import LeaderBoardDesktopView from './DesktopView'
import LeaderBoardMobileView from './MobileView'
import RankingCard from './RankingCard'


const Leaderboard = () => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const router = useRouter()
  const cbonPrice = useCbonPriceAsBN()
  const competitionId = router.query.competitionId
  const { isDesktop } = useMatchBreakpoints()
  const [currentPage, setCurrentPage] = useState(1)
  const [maxPage, setMaxPages] = useState(1)
  const [first, setFirst] = useState<RankListDetail | null>()
  const [second, setSecond] = useState<RankListDetail | null>()
  const [third, setThird] = useState<RankListDetail | null>()
  const [numberOfWinners, setNumberOfWinners] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)
  const [topTraders, setTopTraders] = useState<RankListDetail[]>()


  const fetcher = async (url: string) => {
    const res = await fetch(url)
    
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.')
      throw error
    }
   
    return res.json()
  }
  

  const {data, error, isLoading} = useSWR( ()=>
    `${COMPETITION_API_URL}/top-traders?competitionId=${competitionId}`, fetcher 
    )
  const {data:currentCompetition} = useSWR( ()=>
    `${COMPETITION_API_URL}/${competitionId}`, fetcher )

  const estimateRewards = useCallback(() =>{
    const winners = []
    if(currentCompetition && data && totalVolume){

      data.map((trader:RankListDetail,index:number)=>{
        const reward = (trader.amountUSD / totalVolume) * currentCompetition.rewardAmount
        winners.push({
          'origin': trader.origin,
          'amountUSD': Number(trader.amountUSD),
          'estimatedReward': index < numberOfWinners ? reward : 0
        })
      })

      setTopTraders(winners)
    }
  },[numberOfWinners, data, currentCompetition, totalVolume])
  

  useEffect(()=>{
    if (currentCompetition && numberOfWinners === 0){
      setNumberOfWinners(currentCompetition?.numberOfWinners)
    }
    
    if(data && data.length > 0 && numberOfWinners && totalVolume===0){
      let total = 0
      data.map((trader:RankListDetail,index:number)=>{
        if(index<numberOfWinners){
          total += Number(trader.amountUSD)
        }
      })

      // if(data.length >= numberOfWinners){
      //   for(var i=0; i<numberOfWinners; i++){
      //     total += Number(data[i].amountUSD)
      //   }
      // }else{
      //   for(var i=0; i<data.length; i++){
      //     total += Number(data[i].amountUSD)
      //   }
      // }
      setTotalVolume(total)
    }
  }, [data, numberOfWinners, currentCompetition])
  

  useEffect(()=>{
    if(isEmpty(topTraders) && totalVolume!==0 && data && data.length>0){
      estimateRewards()
    }
    if (topTraders){
      setFirst(topTraders ? topTraders[0] : null)
      setSecond(topTraders ? topTraders[1] : null)
      setThird(topTraders ? topTraders[2] : null)
    }
  },[currentCompetition,data,totalVolume, topTraders])

  const handleClickPagination = (value: number) => {
    if (!isLoading) {
      setCurrentPage(value)
    }
  }
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
        (url = `https://pancakeswap.finance/swap?inputCurrency=${res[0].result}&outputCurrency=${
          res[1].result
        }`)
        break;
      case 'uniSwap':
        (url = 'https://app.uniswap.org/swap?chain=bnb')
        break;
      }
      
      router.push(url)
      
    }
  


  return (
    <Box id="leaderboard" position="relative" style={{ zIndex: 1 }} mt="104px">
      {currentCompetition &&(

      
        <Box mb='24px'>
        <Container>
        <Text textAlign="center" color='gold' mb="16px" fontSize={['40px']} bold lineHeight="110%">
          {t(`Competition #${competitionId}`)}
        </Text>
        <Flex justifyContent='center'  mt='50px' >
        <Countdown currentPhase={{
          'ends':currentCompetition.endTime,
          'step':{},
          'state': currentCompetition.is_live ? 'LIVE' : 'UPCOMMING'
          }} hasCompetitionEnded={currentCompetition.is_finished}
          />
          </Flex>
          
        <Card>
          <CardBody>
          <Grid
          gridGap={['16px', null, null, null, null, '24px']}
          gridTemplateColumns={['1fr', null, null, null, null, 'repeat(4, 1fr)']}
        > 
        <Text bold>Start Time:</Text>
        <Text >{format(new Date(Number(currentCompetition.startTime)*1000), 'yyyy/MM/dd HH:mm')}</Text>
        <Text bold>End Time:</Text>
        <Text >{format(new Date(Number(currentCompetition.endTime)*1000), 'yyyy/MM/dd HH:mm')}</Text>
        </Grid>
        <Grid
          gridGap={['16px', null, null, null, null, '24px']}
          gridTemplateColumns={['1fr', null, null, null, null, 'repeat(4, 1fr)']}
        > 
        <Text bold>Number of Winners:</Text>
        <Text >{currentCompetition.numberOfWinners}</Text>
        <Text bold>Total Prize:</Text>
        <Text >{currentCompetition.rewardAmount} CBON ~${(Number(currentCompetition.rewardAmount) * Number(cbonPrice)).toFixed(2)}</Text>
        </Grid>
        <Grid
          gridGap={['16px', null, null, null, null, '24px']}
          gridTemplateColumns={['1fr', null, null, null, null, 'repeat(4, 1fr)']}
        > 
        <Text bold>Pool Address:</Text>
        <LinkExternal href={`https://bscscan.com/address/${currentCompetition.poolAddress}`}>
        <Text >{truncateHash(currentCompetition.poolAddress)}</Text>
        </LinkExternal>
        <Text bold>Pair:</Text>
        <Text >{currentCompetition.token0}/{currentCompetition.token1}</Text>
        </Grid>
        <Grid
          gridGap={['16px', null, null, null, null, '24px']}
          gridTemplateColumns={['1fr', null, null, null, null, 'repeat(4, 1fr)']}
        > 
        <Text bold>Project Name:</Text>
        <Text >{currentCompetition.projectName}</Text>
        <Text bold>Project Url:</Text>
        <LinkExternal href={currentCompetition.projectUrl}>
        <Text >{currentCompetition.projectUrl}</Text>
        </LinkExternal>
        </Grid>
        <Grid
          gridGap={['16px', null, null, null, null, '24px']}
          gridTemplateColumns={['1fr', null, null, null, null, 'repeat(4, 1fr)']}
        > 
        <Text bold>Competition Type:</Text>
        <Text >{currentCompetition.competitionType === 'VOLUME' ? 'Trade' : 'Purchase'}</Text>
        </Grid>
        <Flex flexDirection='row' justifyContent='right'>
        <Button 
          scale='sm'
          disabled={currentCompetition.endTime < Date.now() / 1000}
          onClick={()=>handleClick(currentCompetition.poolAddress , currentCompetition.exchangeName)}
        >Trade Now</Button>
        </Flex>
          </CardBody>
        </Card>
        </Container>
      </Box>
      )}
      <Box>
        <Text textAlign="center" color="secondary" mb="16px" fontSize={['40px']} bold lineHeight="110%">
          {t('Leaderboard')}
        </Text>

        <Text textAlign="center" bold color="textSubtle" mb='15px'>
          {t('Top Winners')}
        </Text>
      </Box>
      <Container mb="16px">
        <Grid
          gridGap={['16px', null, null, null, null, '24px']}
          gridTemplateColumns={['1fr', null, null, null, null, 'repeat(3, 1fr)']}
        >
          {first && <RankingCard rank={1} user={first as RankListDetail}
           competitionType={currentCompetition.competitionType}/>}
          {second && <RankingCard rank={2} user={second as RankListDetail}
           competitionType={currentCompetition.competitionType}/>}
          {third && <RankingCard rank={3} user={third as RankListDetail}
           competitionType={currentCompetition.competitionType}/>}
        </Grid>
      </Container>
      <Box maxWidth={1200} m="auto">
        { !isEmpty(topTraders) && isDesktop ? (
          <LeaderBoardDesktopView
            data={topTraders?.slice(3,topTraders.length)}
            maxPage={maxPage}
            isLoading={isLoading}
            currentPage={currentPage}
            setCurrentPage={handleClickPagination}
            competitionType={currentCompetition?.competitionType ? currentCompetition.competitionType : 'VOLUME'}
          />
        ) : !isEmpty(topTraders) ? (
          <LeaderBoardMobileView
            data={topTraders?.slice(3,topTraders.length)}
            maxPage={maxPage}
            isLoading={isLoading}
            currentPage={currentPage}
            setCurrentPage={handleClickPagination}
            competitionType={currentCompetition?.competitionType ? currentCompetition.competitionType : 'VOLUME'}
          />
        ) : isDesktop ? (
            <LeaderBoardDesktopView
              data={[]}
              maxPage={1}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={handleClickPagination}
              competitionType={currentCompetition?.competitionType ? currentCompetition.competitionType : 'VOLUME'}
            />
          ) :  (
            <LeaderBoardMobileView
              data={[]}
              maxPage={1}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={handleClickPagination}
              competitionType={currentCompetition?.competitionType ? currentCompetition.competitionType : 'VOLUME'}
            />
        )
      }
      </Box>
    </Box>
  )
}

export default Leaderboard
