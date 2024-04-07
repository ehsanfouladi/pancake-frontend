import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, InputGroup, Radio, SearchIcon, SearchInput, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'
import FinishedCompetitionsDesktopView from './components/FinishedCompetitions/DesktopView'
import FinishedCompetitionsMobileView from './components/FinishedCompetitions/MobileView'
import { Competition } from './components/YourHistoryCard'
import { COMPETITION_V2_API_URL } from './constants'


const UpcommingCompetitions = () => {
  const { t } = useTranslation()
  const BACKGROUND_COLOR = 'radial-gradient(55.22% 134.13% at 57.59% 0%, #60EFFF 0%, #45CAFF 33.21%, #0061FF 79.02%)'
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

  const { isDesktop } = useMatchBreakpoints()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [competitionType, setCompetitionType] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [reverseSort, setReverseSort] = useState(true)
  const {chainId} = useActiveChainId()
  const inputRef = useRef(null);
  // const [isLoading, setIsLoading] = useState(false)
  // const [data, setData] = useState<LiveCompetition>()

  const fetcher = url => fetch(url).then(res => res.json());
  const { data, isLoading } = useSWR<LiveCompetition>(
    `${COMPETITION_V2_API_URL}/upcoming-competitions?chainId=${chainId}&page=${currentPage}&keyword=${keyword}&compType=${competitionType}&sortBy=${sortBy}&reverseSort=${reverseSort}`
    , fetcher
  )

  const handleChangeQuery = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);

  }, [])

  

  return (
    <StyledBackground>
      <Box>
        <Text textAlign="center" color="secondary" mb="16px" fontSize={['40px']} bold lineHeight="110%">
          {t('Upcomming Compettitions')}
        </Text>
        <Flex justifyContent='center'>
          <NetworkSwitcher />
        </Flex>

        <Flex maxWidth='90%' flexDirection='column' justifyContent='center' m="auto" py='25px'>
          <Flex
            flexDirection='row'
            justifyContent='space-evenly'
            p='15px'
            mx='25px'
            mb='10px'
            width='95%'
            backgroundColor='primary'
            borderRadius='20px'
            verticalAlign='center'
          >
            <Box>
              <InputGroup startIcon={<SearchIcon style={{ zIndex: 1 }} color="textSubtle" width="18px" />}>
                <SearchInput placeholder="Search" initialValue={keyword} onChange={handleChangeQuery} />
              </InputGroup>
            </Box>
            <FilterLabel key={'Trade'}>
              <Radio
                scale="sm"
                value={competitionType}
                checked={competitionType === 'VOLUME'}
                onChange={() => setCompetitionType('VOLUME')}
                disabled={isLoading}
              />
              <Text ml="8px">{t('Trade')}</Text>
            </FilterLabel>
            <FilterLabel key={'Purchase'}>
              <Radio
                scale="sm"
                value={competitionType}
                checked={competitionType === 'PURCHASE'}
                onChange={() => setCompetitionType('PURCHASE')}
                disabled={isLoading}
              />
              <Text ml="8px">{t('Purchase')}</Text>
            </FilterLabel>
            <FilterLabel key={'Purchase'}>
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

export default UpcommingCompetitions

