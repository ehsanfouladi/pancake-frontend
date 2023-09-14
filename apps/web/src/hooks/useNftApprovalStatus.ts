import BigNumber from 'bignumber.js'
import { getCbonContract } from 'utils/contractHelpers'
import { useAccount, useContractRead } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'
import { getContract } from 'viem'
import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'

export const useNftApprovalStatus = (spender, address, nftId) => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const { data, refetch } = useContractRead({
    ...getContract({
      address,
      abi:nonfungiblePositionManagerABI,
    }),
    enabled: Boolean(account && spender),
    functionName: 'getApproved',
    args: [nftId],
    watch: true,
  })
  console.log('useApproveData>>>>',data);
  
  return {
    isApproved: data === spender,
    setLastUpdated: refetch,
  }
}

export default useNftApprovalStatus
