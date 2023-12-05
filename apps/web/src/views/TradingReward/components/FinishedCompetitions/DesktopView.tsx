import { PaginationButton, Card, Table, Th, Td } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import DesktopResult from 'views/TradingReward/components/FinishedCompetitions/DesktopResult'

export interface CompetitionIncentives {
  _id: number
  startTime: number
  endTime: number
  poolAddress: string
  exchangeName: string
  rewardAmount: string
  rewardCharged: string
  isBoosted: boolean
  token0: string
  token1: string
  is_live: boolean
  is_finished: boolean
  competitionType : string

}

interface FinishedCompetitionsDesktopViewProps {
  data: CompetitionIncentives[]
  currentPage: number
  maxPage: number
  isLoading: boolean
  setCurrentPage: (value: number) => void
}

const FinishedCompetitionsDesktopView: React.FC<React.PropsWithChildren<FinishedCompetitionsDesktopViewProps>> = ({
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
            {/* <Th width="60px">&nbsp;</Th> */}
            <Th textAlign="left">{t('ID')}</Th>
            <Th textAlign="left">{t('Start Time')}</Th>
            <Th textAlign="left">{t('End Time')}</Th>
            <Th textAlign="left">{t('Exchange')}</Th>
            <Th textAlign="left">{t('Type')}</Th>
            <Th textAlign="left">{t('Pair')}</Th>
            <Th textAlign="left">{t('Reward')}</Th>
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
                  {data.map((competition) => (
                    <DesktopResult key={competition._id} competition={competition} />
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

export default FinishedCompetitionsDesktopView
