import { TFetchStatus } from 'config/constants/types'
import { useAtom } from 'jotai'
import isEmpty from 'lodash/isEmpty'
import shuffle from 'lodash/shuffle'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { isAddress } from 'utils'
import { getCadinuProfileAddress } from 'utils/addressHelpers'
import { erc721ABI, useContractReads } from 'wagmi'

import fromPairs from 'lodash/fromPairs'
import { nftMarketActivityFiltersAtom, nftMarketFiltersAtom, tryVideoNftMediaAtom } from './atoms'
import { getCollection, getCollections } from './helpers'
import { ApiCollections, Collection, MarketEvent, NftAttribute, NftToken } from './types'

const DEFAULT_NFT_ORDERING = { field: 'currentAskPrice', direction: 'asc' as 'asc' | 'desc' }
const DEFAULT_NFT_ACTIVITY_FILTER = { typeFilters: [], collectionFilters: [] }
const EMPTY_OBJECT = {}

export const useGetCollections = (): { data: ApiCollections; status: TFetchStatus } => {
  const { data, status } = useSWR(['nftMarket', 'collections'], async () => getCollections())
  const collections = data ?? ({} as ApiCollections)
  return { data: collections, status }
}

export const useGetCollection = (collectionAddress: string): Collection | undefined => {
  const checksummedCollectionAddress = isAddress(collectionAddress) || ''
  const { data } = useSWR(
    checksummedCollectionAddress ? ['nftMarket', 'collections', checksummedCollectionAddress.toLowerCase()] : null,
    async () => getCollection(checksummedCollectionAddress),
  )
  const collectionObject = data ?? {}
  return collectionObject[checksummedCollectionAddress]
}

export const useGetShuffledCollections = (): { data: Collection[]; status: TFetchStatus } => {
  const { data } = useSWRImmutable(['nftMarket', 'collections'], async () => getCollections())
  const collections = data ?? ({} as ApiCollections)
  const { data: shuffledCollections, status } = useSWRImmutable(
    !isEmpty(collections) ? ['nftMarket', 'shuffledCollections'] : null,
    () => {
      return shuffle(collections)
    },
  )
  return { data: shuffledCollections, status }
}

export const useApprovalNfts = (nftsInWallet: NftToken[]) => {
  
  const { data } = useContractReads({
    contracts: nftsInWallet.map(
      (f) =>
        ({
          abi: erc721ABI,
          address: f.collectionAddress,
          functionName: 'getApproved',
          args: [BigInt(f.tokenId)],
        } as const),
    ),
    watch: true,
  })

  const profileAddress = getCadinuProfileAddress()
  
  const approvedTokenIds = Array.isArray(data)
    ? fromPairs(
        data
          .flat()
          .map((result, index) => [
            `${nftsInWallet[index].collectionAddress}#${nftsInWallet[index].tokenId}`,
            profileAddress.toLowerCase() === result.result.toLowerCase(),
          ]),
      )
    : null

  return { data: approvedTokenIds }
}

export const useGetNftFilters = (collectionAddress: string): Readonly<Record<string, NftAttribute>> => {
  const [nftMarketFilters] = useAtom(nftMarketFiltersAtom)
  return nftMarketFilters[collectionAddress]?.activeFilters ?? EMPTY_OBJECT
}

export const useGetNftOrdering = (collectionAddress: string) => {
  const [nftMarketFilters] = useAtom(nftMarketFiltersAtom)
  return nftMarketFilters[collectionAddress]?.ordering ?? DEFAULT_NFT_ORDERING
}

export const useGetNftShowOnlyOnSale = (collectionAddress: string) => {
  const [nftMarketFilters] = useAtom(nftMarketFiltersAtom)
  return nftMarketFilters[collectionAddress]?.showOnlyOnSale ?? true
}

export const useTryVideoNftMedia = () => {
  const [tryVideoNftMedia] = useAtom(tryVideoNftMediaAtom)
  return tryVideoNftMedia ?? true
}

export const useGetNftActivityFilters = (
  collectionAddress: string,
): { typeFilters: MarketEvent[]; collectionFilters: string[] } => {
  const [nftMarketActivityFilters] = useAtom(nftMarketActivityFiltersAtom)
  return nftMarketActivityFilters[collectionAddress] ?? DEFAULT_NFT_ACTIVITY_FILTER
}
