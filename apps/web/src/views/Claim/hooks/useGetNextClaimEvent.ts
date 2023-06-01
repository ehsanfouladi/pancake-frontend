import { ClaimStatus } from 'config/constants/types'
import { useTranslation } from '@pancakeswap/localization'
import { useMemo } from 'react'

interface ClaimEvent {
  nextEventTime: number
  postCountdownText?: string
  preCountdownText?: string
}
// const secondsBetweenRounds = 60 // 5 mins

const transactionResolvingBuffer = 5 // Delay countdown by 30s to ensure contract transactions have been calculated and broadcast

const useGetNextClaimEvent = (lastTime: number, status: ClaimStatus, secondsBetweenRounds: number): ClaimEvent => {
  const { t } = useTranslation()
  return useMemo(() => {
    // Current lottery is active
    if (status === ClaimStatus.OPEN) {
      return {
        nextEventTime: lastTime + transactionResolvingBuffer + secondsBetweenRounds,
        preCountdownText: null,
        postCountdownText: t('until the next reward'),
      }
    }
    // Current lottery has finished but not yet claimable
    if (status === ClaimStatus.CLOSE) {
      return {
        nextEventTime: lastTime + transactionResolvingBuffer + secondsBetweenRounds,
        preCountdownText: t('Winners announced in'),
        postCountdownText: null,
      }
    }
    return { nextEventTime: null, preCountdownText: null, postCountdownText: null }
  }, [lastTime, status, t])
}

export default useGetNextClaimEvent
