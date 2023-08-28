/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */

import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { gql, GraphQLClient } from 'graphql-request'
import { z } from 'zod'
import { Address } from 'viem'

import { bscClient } from './provider'

// export const V3_SUBGRAPH_CLIENTS = {
//   [ChainId.ETHEREUM]: new GraphQLClient('https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-eth', {
//     fetch,
//   }),
//   [ChainId.GOERLI]: new GraphQLClient('https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-goerli', {
//     fetch,
//   }),
//   [ChainId.BSC]: new GraphQLClient('https://api.thegraph.com/subgraphs/name/cadinu/exchange-v3-bsc', { fetch }),
//   [ChainId.BSC_TESTNET]: new GraphQLClient('https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-chapel', {
//     fetch,
//   }),
// } satisfies Record<FarmSupportedChainId, GraphQLClient>

const zChainId = z.enum(['56', '1', '5', '97'])

const zAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/)

const zParams = z.object({
  chainId: zChainId,
  address: zAddress,
})

const positionManagers = {
  "pancakeSwap":'0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
  "cadinuSwap":'0x0C26558A7Bf8be790774fc84De8e5229A4dB5BA1',
  "uniSwap":'0x0927a5abbd02ed73ba83fc93bd9900b1c2e52348'
} as Record<string, Address> 

export const V3_SUBGRAPH_CLIENTS = {
    "cadinuSwap":new GraphQLClient('https://api.thegraph.com/subgraphs/name/cadinu/exchange-v3-bsc', { fetch }),
    "pancakeSwap": new GraphQLClient('https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc', { fetch }),
    "uniSwap" :  new GraphQLClient('https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc', { fetch })
  } as Record<string, GraphQLClient>


export const getTotalNumberOfUserNfts = async (user: Address, positionManager:string) =>{

  const data =  await bscClient.readContract({
    abi:nonfungiblePositionManagerABI,
    address: positionManagers[positionManager],
    functionName: "balanceOf",
    args:[`${user}`]
  })

  return data

}

export const getNfts = async (user:Address, positionManager:string)=>{
console.info(V3_SUBGRAPH_CLIENTS[positionManager]);

const nfts = await V3_SUBGRAPH_CLIENTS[positionManager].request(
  gql`
  query MyQuery {
    positions(where: {owner: "${user}"}) {
      id
      liquidity
      pool {
        token0 {
          name
          symbol
          decimals
          id
        }
        token1 {
          id
          name
          decimals
          symbol
        }
        feeTier
        liquidity
        id
        sqrtPrice
        tick
        totalValueLockedToken0
        totalValueLockedToken1
      }
      tickLower {
        id
      }
      tickUpper {
        id
      }
      token0 {
        id
        name
        symbol
        decimals
      }
      token1 {
        id
        name
        symbol
        decimals
      }
    }
  }
  `
)
return nfts
}

