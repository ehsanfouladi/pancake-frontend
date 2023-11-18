import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import { useToast } from '@pancakeswap/uikit'
import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { publicClient } from 'utils/wagmi'
import { useAccount, useWalletClient } from 'wagmi'

const useNftApprove = (setLastUpdated: () => void, spender, successMsg,nftId,address) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const {data: walletClient} = useWalletClient()
  const {address: account} = useAccount()
  const handleApprove = async () => {
    const receipt = await fetchWithCatchTxError(async() => {
        const {request} = await publicClient({chainId:ChainId.BSC}).simulateContract({
          address,
          abi:nonfungiblePositionManagerABI,
          functionName:'approve',
          args:[spender,nftId],
          account
        })
        return walletClient.writeContract(request)

      })
    if (receipt?.status) {
      toastSuccess(
        t('Contract Enabled'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>{successMsg}</ToastDescriptionWithTx>,
      )
      setLastUpdated()
    }
  }

  return { handleApprove, pendingTx }
}

export default useNftApprove
