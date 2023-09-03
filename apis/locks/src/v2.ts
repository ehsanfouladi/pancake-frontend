import { gql, GraphQLClient } from 'graphql-request'
import { Address } from 'viem'
import { bscClient } from './provider'

export const V2_SUBGRAPH_CLIENTS = {
    "pancakeSwap": new GraphQLClient('https://open-platform.nodereal.io/920322f59cd34e7db44c3090b7c39431/pancakeswap-free/graphql', { fetch }),
    "cadinuSwap":new GraphQLClient('https://api.thegraph.com/subgraphs/name/cadinu/exchange', { fetch }),
    "uniSwap" :  new GraphQLClient('https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc', { fetch })
  } as Record<string, GraphQLClient>

const exchanges = ["pancakeSwap",
"cadinuSwap",
"uniSwap"]
export const getV2Price =async (token:string)=>{
    const prices = {
      'cadinuSwap' : {},
      "pancakeSwap" : {},
      'uniSwap': {}
    } as Record<string,{}>
    for (var i = 0;i<exchanges.length;i++) {
      if (exchanges[i] === "uniSwap"){
        continue
      }
      const data = await V2_SUBGRAPH_CLIENTS[exchanges[i]].request(
          gql`
          {
  
            token(id: "${token}") {
              derivedUSD
            }
          }
          `)
            prices[exchanges[i]]= data.token !== null ? data.token.derivedUSD : 0
          if ( data.token !== null && Number(data.token.derivedUSD) !== 0){
            break
          }
          
        }
        console.info(prices);
        
      return prices
  }