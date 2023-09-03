/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */

import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { gql, GraphQLClient } from 'graphql-request'
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

const positionManagers = {
  "pancakeSwap":'0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
  "cadinuSwap":'0x0C26558A7Bf8be790774fc84De8e5229A4dB5BA1',
  "uniSwap":'0x0927a5abbd02ed73ba83fc93bd9900b1c2e52348'
} as Record<string, Address> 

export const V3_SUBGRAPH_CLIENTS = {
    "pancakeSwap": new GraphQLClient('https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc', { fetch }),
    "cadinuSwap":new GraphQLClient('https://api.thegraph.com/subgraphs/name/cadinu/exchange-v3-bsc', { fetch }),
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

export const getPrice =async (token:string)=>{
  const prices = {
    'cadinuSwap' : {},
    "pancakeSwap" : {},
    'uniSwap': {}
  } as Record<string,{}>
  for (const key in positionManagers){
    if (key === "uniSwap"){
      continue
    }
    const data = await V3_SUBGRAPH_CLIENTS[key].request(
        gql`
        {

          token(id: "${token}") {
            derivedUSD
          }
        }
        `)
        
          prices[key]= data.token !== null ? data.token.derivedUSD : 0
        if ( data.token !== null && Number(data.token.derivedUSD) !== 0){
          break
        }

      }
    return prices
}