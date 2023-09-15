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
    enabled: Boolean(account && spender && nftId),
    functionName: 'getApproved',
    args: [nftId],
    watch: true,

  })  
  return {
    isApproved: data === spender,
    setLastUpdated: refetch,
  }
}

export default useNftApprovalStatus
