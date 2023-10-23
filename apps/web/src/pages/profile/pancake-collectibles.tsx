// import { GetStaticProps, InferGetStaticPropsType } from 'next'
// // eslint-disable-next-line camelcase
// import { ChainId } from '@pancakeswap/sdk'
// import { pancakeProfileABI } from 'config/abi/pancakeProfile'
// import { getCollections } from 'state/nftMarket/helpers'
// import { SWRConfig, unstable_serialize } from 'swr'
// import { getPancakeProfileAddress } from 'utils/addressHelpers'
// import { getProfileContract } from 'utils/contractHelpers'
// import { viemServerClients } from 'utils/viem.server'
// import { ContractFunctionResult } from 'viem'
// import PancakeCollectiblesPageRouter from 'views/Profile/components/PancakeCollectiblesPageRouter'

// const PancakeCollectiblesPage = ({ fallback = {} }: InferGetStaticPropsType<typeof getStaticProps>) => {
//   return (
//     <SWRConfig
//       value={{
//         fallback,
//       }}
//     >
//       <PancakeCollectiblesPageRouter />
//     </SWRConfig>
//   )
// }

// export const getStaticProps: GetStaticProps = async () => {
//   const fetchedCollections = await getCollections()
//   if (!fetchedCollections || !Object.keys(fetchedCollections).length) {
//     return {
//       props: {
//         fallback: {},
//       },
//       revalidate: 60,
//     }
//   }

//   try {
//     const profileContract = getProfileContract()
//     const nftRole = await profileContract.read.NFT_ROLE()

//     const collectionRoles = (await viemServerClients[ChainId.BSC].multicall({
//       contracts: Object.keys(fetchedCollections).map((collectionAddress) => {
//         return {
//           abi: pancakeProfileABI,
//           address: getPancakeProfileAddress(),
//           functionName: 'hasRole',
//           args: [nftRole, collectionAddress],
//         }
//       }),
//       allowFailure: false,
//     })) as ContractFunctionResult<typeof pancakeProfileABI, 'hasRole'>[]

//     const pancakeCollectibles = Object.values(fetchedCollections).filter((collection, index) => {
//       return collectionRoles[index]
//     })

//     return {
//       props: {
//         fallback: {
//           [unstable_serialize(['pancakeCollectibles'])]: pancakeCollectibles,
//         },
//       },
//       revalidate: 60 * 60 * 12, // 12 hours
//     }
//   } catch (error) {
//     return {
//       props: {
//         fallback: {},
//       },
//       revalidate: 60,
//     }
//   }
// }

// export default PancakeCollectiblesPage
import { NotFound } from '@pancakeswap/uikit'

const NotFoundPage = () => <NotFound />

NotFoundPage.chains = []

export default NotFoundPage
