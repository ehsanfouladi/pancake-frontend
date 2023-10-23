import { useTranslation } from '@pancakeswap/localization'
import { Button, Modal, Text, useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { cadinuProfileAbi } from 'config/abi/cadinuProfile'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useProfileContract } from 'hooks/useContract'
import { useProfile } from 'state/profile/hooks'
import { getCadinuProfileAddress } from 'utils/addressHelpers'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { State } from './contexts/types'

interface Props {
  userName: string
  selectedNft: State['selectedNft']
  teamId: number
  allowance: bigint
  onDismiss?: () => void
}

const ConfirmProfileCreationModal: React.FC<React.PropsWithChildren<Props>> = ({ teamId, selectedNft, onDismiss }) => {
  const { t } = useTranslation()
  const profileContract = useProfileContract()
  const { refresh: refreshProfile } = useProfile()
  const { toastSuccess } = useToast()
  const { callWithGasPrice } = useCallWithGasPrice()

  // const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
  //   useApproveConfirmTransaction({
  //     token: bscTokens.cake,
  //     spender: profileContract.address,
  //     minAmount: REGISTER_COST,
  //     onConfirm: () => {
  //       return callWithGasPrice(profileContract, 'createProfile', [
  //         selectedNft.collectionAddress,
  //         BigInt(selectedNft.tokenId),
  //       ])
  //     },
  //     onSuccess: async ({ receipt }) => {
  //       refreshProfile()
  //       onDismiss()
  //       toastSuccess(t('Profile created!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
  //     },
  //   })

    const {config} = usePrepareContractWrite({
      address: getCadinuProfileAddress(),
      abi: cadinuProfileAbi,
      functionName: 'createProfile',
      args:[selectedNft.collectionAddress, BigInt(selectedNft.tokenId)]
    })
    const {data:confirmData, 
      isLoading:isConfirming, 
      isSuccess:isConfirmed, 
      write:handleConfirm } = useContractWrite(config)

      const waitForTransaction = useWaitForTransaction({
        hash: confirmData?.hash,
        onSuccess: async (hash) => {
                refreshProfile()
                onDismiss()
                toastSuccess(t('Profile created!'), <ToastDescriptionWithTx txHash={hash.toString()} />)
              },
      })


  return (
    <Modal title={t('Complete Profile')} onDismiss={onDismiss}>
      <Text color="textSubtle" mb="8px">
        {t('Submitting NFT to contract and confirming User Name.')}
      </Text>
      <Button
      disabled={!handleConfirm}
      onClick={()=>handleConfirm?.()}
      >Confirm</Button>
    </Modal>
  )
}

export default ConfirmProfileCreationModal
