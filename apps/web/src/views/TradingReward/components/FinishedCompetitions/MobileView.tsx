import { useTranslation } from '@pancakeswap/localization'
import { PaginationButton, Box, Text } from '@pancakeswap/uikit'
import MobileResult, { StyledMobileRow } from 'views/TradingReward/components/FinishedCompetitions/MobileResult'
import { CompetitionIncentives } from './DesktopView'

interface FinishedCompetitionsMobileViewProps {
  data: CompetitionIncentives[]
  maxPage: number
  isLoading: boolean
  currentPage: number
  setCurrentPage: (value: number) => void
}

const FinishedCompetitionsMobileView: React.FC<React.PropsWithChildren<FinishedCompetitionsMobileViewProps>> = ({
  data,
  isLoading,
  currentPage,
  maxPage,
  setCurrentPage,
}) => {
  const { t } = useTranslation()

  return (
    <Box>
      {isLoading ? (
        <StyledMobileRow>
          <Text padding="48px 0px" textAlign="center">
            {t('Loading...')}
          </Text>
        </StyledMobileRow>
      ) : (
        <>
          {data?.length === 0 ? (
            <StyledMobileRow>
              <Text padding="48px 0px" textAlign="center">
                {t('No results')}
              </Text>
            </StyledMobileRow>
          ) : (
            <>
              {data.map((competition) => (
                <MobileResult key={competition._id} competition={competition} />
              ))}
            </>
          )}
        </>
      )}
      <PaginationButton showMaxPageText currentPage={currentPage} maxPage={maxPage} setCurrentPage={setCurrentPage} />
    </Box>
  )
}

export default FinishedCompetitionsMobileView
