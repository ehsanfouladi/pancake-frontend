import BigNumber from 'bignumber.js'
import { getCbonContract } from 'utils/contractHelpers'
import { useAccount, useContractRead } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'

export const useCbonApprovalStatus = (spender) => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const { data, refetch } = useContractRead({
    chainId,
    ...getCbonContract(chainId),
    enabled: Boolean(account && spender),
    functionName: 'allowance',
    args: [account, spender],
    watch: true,
  })

  return {
    isApproved: data > 0,
    allowance: new BigNumber(data?.toString()),
    setLastUpdated: refetch,
  }
}

export default useCbonApprovalStatus
