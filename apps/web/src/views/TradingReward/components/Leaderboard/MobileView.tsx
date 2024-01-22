import { useTranslation } from '@pancakeswap/localization'
import { Box, PaginationButton, Text } from '@pancakeswap/uikit'
import MobileResult, { StyledMobileRow } from 'views/TradingReward/components/Leaderboard/MobileResult'
import { RankListDetail } from 'views/TradingReward/hooks/useRankList'

interface LeaderBoardMobileViewProps {
  data: RankListDetail[]
  maxPage: number
  isLoading: boolean
  currentPage: number
  setCurrentPage: (value: number) => void
  competitionType: 'VOLUME' | 'PURCHASE'
}

const LeaderBoardMobileView: React.FC<React.PropsWithChildren<LeaderBoardMobileViewProps>> = ({
  data,
  isLoading,
  currentPage,
  maxPage,
  setCurrentPage,
  competitionType
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
              {data.map((rank, index) => (
                <MobileResult key={rank.origin} rank={rank} index={index + 3} competitionType={competitionType} />
              ))}
            </>
          )}
        </>
      )}
      <PaginationButton showMaxPageText currentPage={currentPage} maxPage={maxPage} setCurrentPage={setCurrentPage} />
    </Box>
  )
}

export default LeaderBoardMobileView
