import { ChainId } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'

const CHAIN_MAPPING = {
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.BSC]: 'bsc',
} as const satisfies Record<number, string>

// use for fetch usd outside of the liquidity pools on PancakeSwap
export const fetchTokenUSDValue = async (chainId: number, tokenAddresses: string[]) => {
  
  if (!tokenAddresses.length || !CHAIN_MAPPING[chainId]) return new Map<string, string>()

  console.log("tokenAddresses", tokenAddresses);
  

  const list = tokenAddresses.map((address) => `${CHAIN_MAPPING[chainId]}:${address}`).join(',')

  const result: { coins: { [key: string]: { price: string } } } = await fetch(
    `https://coins.llama.fi/prices/current/${list}`,
  ).then((res) => res.json())

  const commonTokenUSDValue = new Map<string, string>()

  if (tokenAddresses[0] === bscTokens.cbon.address){
    const priceData = await fetch(
      `https://farms.cadinu.io/price/cbon`,
      ).then((res) => res.json())
      commonTokenUSDValue.set(tokenAddresses[0], priceData.price) 
      
    }
    console.log("commonTokenUSDValue", commonTokenUSDValue);

  Object.entries(result.coins || {}).forEach(([key, value]) => {
    const [, address] = key.split(':')
    commonTokenUSDValue.set(address, value.price)
  })

  return commonTokenUSDValue
}
