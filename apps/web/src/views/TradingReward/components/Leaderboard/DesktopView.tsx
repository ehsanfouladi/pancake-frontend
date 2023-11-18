import { useTranslation } from '@pancakeswap/localization'
import { Card, PaginationButton, Table, Td, Th } from '@pancakeswap/uikit'
import DesktopResult from 'views/TradingReward/components/Leaderboard/DesktopResult'
import { RankListDetail } from 'views/TradingReward/hooks/useRankList'

interface LeaderBoardDesktopViewProps {
  data: RankListDetail[]
  currentPage: number
  maxPage: number
  isLoading: boolean
  setCurrentPage: (value: number) => void
}

const LeaderBoardDesktopView: React.FC<React.PropsWithChildren<LeaderBoardDesktopViewProps>> = ({
  data,
  maxPage,
  isLoading,
  currentPage,
  setCurrentPage,
}) => {
  const { t } = useTranslation()

  return (
    <Card margin="0 24px">
      <Table>
        <thead>
          <tr>
            <Th width="60px">&nbsp;</Th>
            <Th textAlign="left">{t('User')}</Th>
            <Th textAlign="left">{t('Trading Volume')}</Th>
            <Th textAlign="right">{t('Total Reward')}</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td colSpan={4} textAlign="center">
                {t('Loading...')}
              </Td>
            </tr>
          ) : (
            <>
              {data?.length === 0 ? (
                <tr>
                  <Td colSpan={4} textAlign="center">
                    {t('No results')}
                  </Td>
                </tr>
              ) : (
                <>
                  {data.map((rank,index) => (
                    <DesktopResult key={rank.origin} rank={rank} index={index +3} />
                  ))}
                </>
              )}
            </>
          )}
        </tbody>
      </Table>
      <PaginationButton showMaxPageText currentPage={currentPage} maxPage={maxPage} setCurrentPage={setCurrentPage} />
    </Card>
  )
}

export default LeaderBoardDesktopView
