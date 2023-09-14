import { MaxUint256 } from '@pancakeswap/swap-sdk-core'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import {  useCbon } from 'hooks/useContract'
import { getContract } from 'viem'
import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { ChainId } from '@pancakeswap/sdk'
import { publicClient } from 'utils/wagmi'
import { useAccount, useWalletClient } from 'wagmi'

const useNftApprove = (setLastUpdated: () => void, spender, successMsg,nftId,address) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
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
