import { useTranslation } from '@pancakeswap/localization'
import { Box, Modal, useToast } from '@pancakeswap/uikit'
import { useAccount, useWalletClient } from 'wagmi'
import snapshot from '@snapshot-labs/snapshot.js'
import useTheme from 'hooks/useTheme'
import { useState } from 'react'
import { PANCAKE_SPACE } from 'views/Voting/config'
import DetailsView from './DetailsView'
import MainView from './MainView'
import { CastVoteModalProps, ConfirmVoteView } from './types'

const hub = 'https://hub.snapshot.org'
const client = new snapshot.Client712(hub)

const CastVoteModal: React.FC<React.PropsWithChildren<CastVoteModalProps>> = ({
  onSuccess,
  proposalId,
  vote,
  block,
  onDismiss,
}) => {
  const [view, setView] = useState<ConfirmVoteView>(ConfirmVoteView.MAIN)
  const [isPending, setIsPending] = useState(false)
  const { address: account } = useAccount()
  const { data: signer } = useWalletClient()
  const { t } = useTranslation()
  const { toastError } = useToast()
  const { theme } = useTheme()
  

  const isStartView = view === ConfirmVoteView.MAIN
  const handleBack = isStartView ? null : () => setView(ConfirmVoteView.MAIN)
  const handleViewDetails = () => setView(ConfirmVoteView.DETAILS)

  const title = {
    [ConfirmVoteView.MAIN]: t('Confirm Vote'),
    [ConfirmVoteView.DETAILS]: t('Voting Power'),
  }

  const handleDismiss = () => {
    onDismiss()
  }

  const handleConfirmVote = async () => {
    try {
      setIsPending(true)
      const web3 = {
        getSigner: () => {
          return {
            _signTypedData: (domain, types, message) =>
              signer.signTypedData({
                account,
                domain,
                types,
                message,
                primaryType: 'Vote',
              }),
          }
        },
      }

      await client.vote(web3 as any, account, {
        space: PANCAKE_SPACE,
        choice: vote.value,
        reason: '',
        type: 'single-choice',
        proposal: proposalId,
        app: 'snapshot',
      })

      await onSuccess()

      handleDismiss()
    } catch (error) {
      toastError(t('Error'), (error as Error)?.message ?? t('Error occurred, please try again'))
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <><div>Hi</div></>
  )
}

export default CastVoteModal
