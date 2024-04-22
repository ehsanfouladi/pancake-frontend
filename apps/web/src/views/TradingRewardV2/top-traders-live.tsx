import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, InputGroup, Radio, SearchIcon, SearchInput, Text, UserMenu, useMatchBreakpoints } from '@pancakeswap/uikit'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'
import FinishedCompetitionsDesktopView from './components/FinishedCompetitions/DesktopView'
import FinishedCompetitionsMobileView from './components/FinishedCompetitions/MobileView'

import { ExchangeSelect, RewardSelect } from './components/ExchangeSelector'
import { Competition } from './components/types'
import { COMPETITION_V2_API_URL, exchanges, rewardTokens } from './constants'


const LiveCompetitions = () => {
  const { t } = useTranslation()
  const BACKGROUND_COLOR = 'radial-gradient(55.22% 134.13% at 57.59% 0%, #F5DF8E 0%, #FCC631 33.21%, #FF9D00 79.02%)'

  const StyledBackground = styled(Flex)`
  position: relative;
  flex-direction: column;
  padding-top: 48px;
  margin-bottom: 0;
  background: ${BACKGROUND_COLOR};
  z-index: 0;
  `

  const FilterLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  margin-right: 16px;
`

  interface LiveCompetition {
    competitions: Competition[]
    maxPage: number
    competitionIds: []
  }
  const { chainId } = useActiveChainId()
  const { isDesktop } = useMatchBreakpoints()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [competitionType, setCompetitionType] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [reverseSort, setReverseSort] = useState(true)
  const inputRef = useRef(null);
  const [selectedExchange, setSelectedExchange] = useState(null)
  const [selectedRewardToken, setSelectedRewardToken] = useState(null)
  // const [isLoading, setIsLoading] = useState(false)
  // const [data, setData] = useState<LiveCompetition>()

  const fetcher = url => fetch(url).then(res => res.json());
  const makeQuery = ()=>{
    let queryUrl = 
    `${COMPETITION_V2_API_URL}/competitions?status=live&chainId=${chainId}&page=${currentPage}`
    
    if(keyword){
      queryUrl += `&keyword=${keyword}`
    }
    if(competitionType){
      queryUrl += `&compType=${competitionType}`
    }
    if (sortBy){
      queryUrl += `&sortBy=${sortBy}`
    }
    if (reverseSort){
      queryUrl += `&reverseSort=${reverseSort}`
    }
    if (selectedExchange && selectedExchange!==exchanges[0]){
      queryUrl += `&exchange=${selectedExchange.name}`
    }
    if (selectedRewardToken && selectedRewardToken !== rewardTokens[0]){
      queryUrl += `&reward-token=${selectedRewardToken.token}`
    }
    console.log('queryUrl>>>>>>>', queryUrl);
    
    return queryUrl
  }
  const { data, isLoading } = useSWR<LiveCompetition>(
    makeQuery()
    , fetcher
  )
    
  const handleChangeQuery = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);

  }, [])

  const ExchangeSwitcher = () => {
    const { t } = useTranslation()

    return (
      <Box height="100%">
        <UserMenu
          mr="8px"
          placement="bottom"
          variant='default'
          avatarSrc={`/images/exchange.png`}
          text={
            !selectedExchange ? ('Select an Exchange') :
              <>
                <Box display={['none', null, null, null, null, 'block']}>{selectedExchange && exchanges.find(exchange => exchange.name === selectedExchange.name).display_name}</Box>
                <Box display={['block', null, null, null, null, 'none']}>{selectedExchange && exchanges.find(exchange => exchange.name === selectedExchange.name).mobile_display_name}</Box>
              </>
          }
        >
          {() =>

            <ExchangeSelect
              selectedExchange={selectedExchange}
              setSelectedExchange={setSelectedExchange}
            />

          }
        </UserMenu>
      </Box>
    )
  }

  const RewardTokenSwitcher = () => {
    const { t } = useTranslation()

    return (
      <Box height="100%">
        <UserMenu
          mr="8px"
          placement="bottom"
          variant='default'
          avatarSrc={`/images/reward.png`}
          text={
            !selectedRewardToken ? ('Select Reward Token') :
              <>
                <Box display={['none', null, null, null, null, 'block']}>{selectedRewardToken && rewardTokens.find(token => token.display_name === selectedRewardToken.display_name)?.display_name}</Box>
                <Box display={['block', null, null, null, null, 'none']}>{selectedRewardToken && rewardTokens.find(token => token.display_name === selectedRewardToken.display_name)?.display_name}</Box>
              </>
          }
        >
          {() =>

            <RewardSelect
              selectedRewardToken={selectedRewardToken}
              setSelectedRewardToken={setSelectedRewardToken}
            />

          }
        </UserMenu>
      </Box>
    )
  }


  return (
    <StyledBackground>
      <Box>
        <Text textAlign="center" color="secondary" mb="16px" fontSize={['40px']} bold lineHeight="110%">
          {t('Live Compettitions')}
        </Text>
        <Flex justifyContent='center'>
          <RewardTokenSwitcher />
          <NetworkSwitcher />
          <ExchangeSwitcher />
        </Flex>


        <Flex maxWidth='90%' flexDirection='column' justifyContent='center' m="auto" py='25px'>
          <Flex
            flexDirection={isDesktop ? 'row' : 'column'}
            justifyContent='space-evenly'
            p='15px'
            mx={isDesktop ? '25px' : '12px'}
            mb='10px'
            width='95%'
            backgroundColor='success'
            borderRadius='20px'
            verticalAlign='center'
          >
            <Box>
              <InputGroup mb={isDesktop ? '0px' : '15px'} startIcon={<SearchIcon style={{ zIndex: 1 }} color="textSubtle" width="18px" />}>
                <SearchInput placeholder="Search" initialValue={keyword} onChange={handleChangeQuery} />
              </InputGroup>
            </Box>
            <Flex flexDirection='row' >
              <FilterLabel key='Trade'>
                <Radio
                  scale="sm"
                  value={competitionType}
                  checked={competitionType === 'VOLUME'}
                  onChange={() => setCompetitionType('VOLUME')}
                  disabled={isLoading}
                />
                <Text ml="8px">{t('Trade')}</Text>
              </FilterLabel>
              <FilterLabel key='Purchase'>
                <Radio
                  scale="sm"
                  value={competitionType}
                  checked={competitionType === 'PURCHASE'}
                  onChange={() => setCompetitionType('PURCHASE')}
                  disabled={isLoading}
                />
                <Text ml="8px">{t('Purchase')}</Text>
              </FilterLabel>
              <FilterLabel key='All'>
                <Radio
                  scale="sm"
                  value={competitionType}
                  checked={competitionType === ''}
                  onChange={() => setCompetitionType('')}
                  disabled={isLoading}
                />
                <Text ml="8px">{t('All')}</Text>
              </FilterLabel>
            </Flex>
          </Flex>
          {data && isDesktop ? (
            <FinishedCompetitionsDesktopView
              data={data.competitions}
              maxPage={data.maxPage}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setSortBy={setSortBy}
              sortBy={sortBy}
              setReverseSort={setReverseSort}
              reverseSort={reverseSort}
            />
          ) : data && (
            <FinishedCompetitionsMobileView
              data={data?.competitions}
              maxPage={data.maxPage}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </Flex>
      </Box>
    </StyledBackground>
  )
}

export default LiveCompetitions

