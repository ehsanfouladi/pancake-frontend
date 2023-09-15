import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { getContract } from 'viem'
import { useAccount, useContractRead } from 'wagmi'

export const useNftApprovalStatus = (spender, address, nftId) => {
  const { address: account } = useAccount()

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
