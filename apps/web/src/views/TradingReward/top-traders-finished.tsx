import { useTranslation } from '@pancakeswap/localization'
import { Box, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useState } from 'react'
import useSWR from 'swr'
import FinishedCompetitionsDesktopView from './components/FinishedCompetitions/DesktopView'
import FinishedCompetitionsMobileView from './components/FinishedCompetitions/MobileView'
import { COMPETITION_API_URL } from './constants'

const FinishedCompetitions = () => {
  const {t} = useTranslation()
  

const {isDesktop} = useMatchBreakpoints()
const [currentPage, setCurrentPage]=useState(1)
const fetcher = url => fetch(url).then(res => res.json())
const {data, isLoading} = useSWR(`${COMPETITION_API_URL}/finished-competitions?page=${currentPage}`,fetcher )

  return (
    <Box>
      <Text textAlign="center" color="secondary" mb="16px" fontSize={['40px']} bold lineHeight="110%">
        {t('Finished Compettitions')}
      </Text>

       
    <Box maxWidth={1200} m="auto">
      {data && isDesktop ? (
        <FinishedCompetitionsDesktopView
          data={data.competitions}
          maxPage={data.maxPage}
          isLoading={isLoading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
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
    </Box>
  </Box>
  )
}

export default FinishedCompetitions
