import { useTranslation } from '@pancakeswap/localization'
import { Card, PaginationButton, Table, Td, Th } from '@pancakeswap/uikit'
import DesktopResult from 'views/TradingRewardV2/components/FinishedCompetitions/DesktopResult'
import { Competition } from '../types'


interface FinishedCompetitionsDesktopViewProps {
  data: Competition[]
  currentPage: number
  maxPage: number
  isLoading: boolean
  setCurrentPage: (value: number) => void
  setSortBy: (value: string) => void
  sortBy: string
  setReverseSort: (value: boolean) => void
  reverseSort: boolean
}

const FinishedCompetitionsDesktopView: React.FC<React.PropsWithChildren<FinishedCompetitionsDesktopViewProps>> = ({
  data,
  maxPage,
  isLoading,
  currentPage,
  setCurrentPage,
  setSortBy,
  sortBy,
  setReverseSort,
  reverseSort
}) => {
  const { t } = useTranslation()

  return (
    <Card margin="0 24px">
      <Table>
        <thead>
          <tr>
            {/* <Th width="60px">&nbsp;</Th> */}
            <Th style={{cursor:'pointer'}} onClick={() => { setReverseSort(!reverseSort); setSortBy('_id') }} textAlign="left">{`ID ${sortBy === '_id' && reverseSort ? '▴' : '▾'}`}</Th>
            <Th style={{ cursor: 'pointer' }} onClick={() => { setReverseSort(!reverseSort); setSortBy('project__name') }} textAlign="left">{`Name${sortBy === 'project__name' && reverseSort ?  '▴' : '▾'}`}</Th>
            <Th style={{cursor:'pointer'}} onClick={() => { setReverseSort(!reverseSort); setSortBy('start_time') }} textAlign="left">{`Start Time ${sortBy === 'start_time' && reverseSort ? '▴': '▾'}`}</Th>
            <Th style={{cursor:'pointer'}} onClick={() => { setReverseSort(!reverseSort); setSortBy('end_time') }} textAlign="left">{`End Time ${sortBy === 'end_time' && reverseSort ?  '▴' : '▾'}`}</Th>
            <Th style={{cursor:'pointer'}} onClick={()=>{setReverseSort(!reverseSort); setSortBy('competition_type')}} textAlign="left">{`Type ${sortBy==='competition_type' && reverseSort ?  '▴': '▾'}`}</Th>
            <Th style={{cursor:'pointer'}} onClick={() => { setReverseSort(!reverseSort); setSortBy('token_0') }} textAlign="left">{`Pair ${sortBy === 'token_0' && reverseSort ?  '▴' : '▾'}`}</Th>
            <Th style={{ cursor: 'pointer' }} onClick={() => { setReverseSort(!reverseSort); setSortBy('locked_lp') }} textAlign="left">{`Locked LP ${sortBy === 'locked_lp' && reverseSort ? '▴' : '▾'}`}</Th>
            <Th style={{ cursor: 'pointer' }} onClick={() => { setReverseSort(!reverseSort); setSortBy('is_core') }} textAlign="left">{`Core ${sortBy === 'is_core' && reverseSort ? '▴' : '▾'}`}</Th>
            <Th style={{ cursor: 'pointer' }} onClick={() => { setReverseSort(!reverseSort); setSortBy('is_verified') }} textAlign="left">{`Verified ${sortBy === 'is_verified' && reverseSort ? '▴' : '▾'}`}</Th>
            <Th style={{ cursor: 'pointer' }} onClick={() => { setReverseSort(!reverseSort); setSortBy('is_boosted') }} textAlign="left">{`Boosted ${sortBy === 'is_boosted' && reverseSort ?  '▴' : '▾'}`}</Th>
            <Th style={{ cursor: 'pointer' }} onClick={() => { setReverseSort(!reverseSort); setSortBy('reward_amount') }} textAlign="left">{`Reward ${sortBy === 'reward_amount' && reverseSort ? '▴' : '▾'}`}</Th>
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
