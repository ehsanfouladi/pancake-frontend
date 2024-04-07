import { FarmWithPrices, SerializedFarmConfig } from '@pancakeswap/farms'
import { ChainId, CurrencyAmount, Pair, WBNB } from '@pancakeswap/sdk'
import { CADINU, USDT } from '@pancakeswap/tokens'
import BN from 'bignumber.js'
import { GraphQLClient, gql } from 'graphql-request'
import { Address, formatUnits } from 'viem'
import { farmFetcher } from './helper'
import { FarmKV, FarmResult } from './kv'
import { updateLPsAPR } from './lpApr'
import { bscClient, bscTestnetClient, viemProviders } from './provider'
// copy from src/config, should merge them later
const BSC_BLOCK_TIME = 3
const BLOCKS_PER_YEAR = (60 / BSC_BLOCK_TIME) * 60 * 24 * 365 // 10512000

const FIXED_ZERO = new BN(0)
const FIXED_100 = new BN(100)

export const getFarmCakeRewardApr = (farm: FarmWithPrices, cakePriceBusd: BN, regularCakePerBlock: number) => {
  let cakeRewardsAprAsString = '0'
  if (!cakePriceBusd) {
    return cakeRewardsAprAsString
  }
  const totalLiquidity = new BN(farm.lpTotalInQuoteToken).times(new BN(farm.quoteTokenPriceBusd))
  const poolWeight = new BN(farm.poolWeight)
  if (totalLiquidity.isZero() || poolWeight.isZero()) {
    return cakeRewardsAprAsString
  }
  const yearlyCakeRewardAllocation = poolWeight
    ? poolWeight.times(new BN(BLOCKS_PER_YEAR).times(new BN(String(regularCakePerBlock))))
    : FIXED_ZERO
  const cakeRewardsApr = yearlyCakeRewardAllocation.times(cakePriceBusd).div(totalLiquidity).times(FIXED_100)
  if (!cakeRewardsApr.isZero()) {
    cakeRewardsAprAsString = cakeRewardsApr.toFixed(2)
  }
  return cakeRewardsAprAsString
}

const pairAbi = [
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      {
        internalType: 'uint112',
        name: 'reserve0',
        type: 'uint112',
      },
      {
        internalType: 'uint112',
        name: 'reserve1',
        type: 'uint112',
      },
      {
        internalType: 'uint32',
        name: 'blockTimestampLast',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const cakeBusdPairMap = {
  [ChainId.BSC]: {
    address: Pair.getAddress(CADINU[ChainId.BSC], USDT[ChainId.BSC]),
    tokenA: CADINU[ChainId.BSC],
    tokenB: USDT[ChainId.BSC],
  },
//   [ChainId.BSC_TESTNET]: {
//     address: Pair.getAddress(CAKE[ChainId.BSC_TESTNET], BUSD[ChainId.BSC_TESTNET]),
//     tokenA: CAKE[ChainId.BSC_TESTNET],
//     tokenB: BUSD[ChainId.BSC_TESTNET],
//   },
}

const getCakePrice = async (isTestnet: boolean) => {
  const pairConfig = cakeBusdPairMap[ ChainId.BSC]
  const client = isTestnet ? bscTestnetClient : bscClient
  const [reserve0, reserve1] = await client.readContract({
    abi: pairAbi,
    address: pairConfig.address,
    functionName: 'getReserves',
  })

  const { tokenA, tokenB } = pairConfig

  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

  const pair = new Pair(
    CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
    CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
  )

  return pair.priceOf(tokenA)
}

const farmConfigApi = 'https://farms-config.pages.dev'

export async function saveFarms(chainId: number, event: ScheduledEvent | FetchEvent) {
  try {
    const isTestnet = farmFetcher.isTestnet(chainId)
    const farmsConfig = await (await fetch(`${farmConfigApi}/${chainId}.json`)).json<SerializedFarmConfig[]>()
    let lpPriceHelpers: SerializedFarmConfig[] = []
    try {
      lpPriceHelpers = await (
        await fetch(`${farmConfigApi}/priceHelperLps/${chainId}.json`)
      ).json<SerializedFarmConfig[]>()
    } catch (error) {
      console.error('Get LP price helpers error', error)
    }

    if (!farmsConfig) {
      throw new Error(`Farms config not found ${chainId}`)
    }
    const { farmsWithPrice, poolLength, regularCakePerBlock } = await farmFetcher.fetchFarms({
      chainId,
      isTestnet,
      farms: farmsConfig.filter((f) => f.pid !== 0).concat(lpPriceHelpers),
    })

    const cakeBusdPrice = await getCakePrice(isTestnet)
    const lpAprs = await handleLpAprs(chainId, farmsConfig)

    const finalFarm = farmsWithPrice.map((f) => {
      return {
        ...f,
        lpApr: lpAprs?.[f.lpAddress.toLowerCase()] || 0,
        cakeApr: getFarmCakeRewardApr(f, new BN(cakeBusdPrice.toSignificant(3)), regularCakePerBlock),
      }
    }) as FarmResult

    const savedFarms = {
      updatedAt: new Date().toISOString(),
      poolLength,
      regularCakePerBlock,
      data: finalFarm,
    }

    event.waitUntil(FarmKV.saveFarms(chainId, savedFarms))

    return savedFarms
  } catch (error) {
    console.error('[ERROR] fetching farms', error)
    throw error
  }
}

export async function handleLpAprs(chainId: number, farmsConfig?: SerializedFarmConfig[]) {
  let lpAprs = await FarmKV.getApr(chainId)
  if (!lpAprs) {
    lpAprs = await saveLPsAPR(chainId, farmsConfig)
  }
  return lpAprs || {}
}

export async function saveLPsAPR(chainId: number, farmsConfig?: SerializedFarmConfig[]) {
  // TODO: add other chains
  if (chainId === 56) {
    let data = farmsConfig
    if (!data) {
      const value = await FarmKV.getFarms(chainId)
      if (value && value.data) {
        // eslint-disable-next-line prefer-destructuring
        data = value.data
      }
    }
    if (data) {
      const aprMap = (await updateLPsAPR(chainId, data)) || null
      FarmKV.saveApr(chainId, aprMap)
      return aprMap || null
    }
    return null
  }
  return null
}

const chainlinkAbi = [
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export async function fetchCakePrice() {
  const address = '0xB6064eD41d4f67e353768aA239cA86f4F73665a1'
  const latestAnswer = await bscClient.readContract({
    abi: chainlinkAbi,
    address,
    functionName: 'latestAnswer',
  })

  return formatUnits(latestAnswer, 8)
}

export const fetchCadinuPrice =  async () => {
  const pairConfig = {
      address: '0xfed93ca309132d9236dcd8501aed82c474342917' as Address,
      // Pair.getAddress(CADINU[ChainId.BSC], USDT[ChainId.BSC]),
      tokenA: CADINU[ChainId.BSC],
      tokenB: WBNB[ChainId.BSC],
    }
    
  const client = bscClient
  const [reserve0, reserve1] = await client.readContract({
    abi: pairAbi,
    address: pairConfig.address,
    functionName: 'getReserves',
  })

  const { tokenA, tokenB } = pairConfig

  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

  const pair = new Pair(
    CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
    CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
  )
const graphClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc', {
  fetch,
})
  const data = await graphClient.request(
  gql`
    query getBNBprice{ bundles {
    ethPriceUSD
}
}
`,

)

console.log(data.bundles[0].ethPriceUSD)



  const cadinuPrice =Number(pair.priceOf(tokenA).toSignificant(18)) * Number(data.bundles[0].ethPriceUSD)
  console.log(cadinuPrice);
  
  return cadinuPrice.toString()


}

export async function fetchCbonPrice(){
  const v3PoolAbi = [
    {
      inputs: [],
      name: 'slot0',
      outputs: [
        {
          internalType: 'uint160',
          name: 'sqrtPriceX96',
          type: 'uint160',
        },
        {
          internalType: 'int24',
          name: 'tick',
          type: 'int24',
        },
        {
          internalType: 'uint16',
          name: 'observationIndex',
          type: 'uint16',
        },
        {
          internalType: 'uint16',
          name: 'observationCardinality',
          type: 'uint16',
        },
        {
          internalType: 'uint16',
          name: 'observationCardinalityNext',
          type: 'uint16',
        },
        {
          internalType: 'uint32',
          name: 'feeProtocol',
          type: 'uint32',
        },
        {
          internalType: 'bool',
          name: 'unlocked',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const
  const address = '0x5760e9386bd0273e5c6b28d8131ac0c5b52c600c'
  const client = viemProviders({ chainId: Number(56) })
  const slot0 = await client.readContract({
    abi: v3PoolAbi,
    address: address as `0x${string}`,
    functionName: 'slot0' 
  })
  const pricisionFactor = 10 ** 18
  const sqrtPriceX96 = slot0[0]
  const sqrtPrice = Number(sqrtPriceX96 * BigInt(pricisionFactor) / (BigInt(2 ** 96))) / pricisionFactor
  const cbonPrice = sqrtPrice ** (2)
  return Number(1/cbonPrice)

  // return fetchCadinuPrice()

}


// export async function fetchCadinuPrice() {
//   const v3PoolAbi = [
//     {
//       inputs: [],
//       name: 'slot0',
//       outputs: [
//         {
//           internalType: 'uint160',
//           name: 'sqrtPriceX96',
//           type: 'uint160',
//         },
//         {
//           internalType: 'int24',
//           name: 'tick',
//           type: 'int24',
//         },
//         {
//           internalType: 'uint16',
//           name: 'observationIndex',
//           type: 'uint16',
//         },
//         {
//           internalType: 'uint16',
//           name: 'observationCardinality',
//           type: 'uint16',
//         },
//         {
//           internalType: 'uint16',
//           name: 'observationCardinalityNext',
//           type: 'uint16',
//         },
//         {
//           internalType: 'uint32',
//           name: 'feeProtocol',
//           type: 'uint32',
//         },
//         {
//           internalType: 'bool',
//           name: 'unlocked',
//           type: 'bool',
//         },
//       ],
//       stateMutability: 'view',
//       type: 'function',
//     },
//   ] as const
//   const address = '0x6172cea10dfd1a61e9f818083f4d65f371a29209'
//   const client = viemProviders({ chainId: Number(56) })
//   const slot0 = await client.readContract({
//     abi: v3PoolAbi,
//     address: address as `0x${string}`,
//     functionName: 'slot0',
//   })
//   const pricisionFactor = 10 ** 18
//   const sqrtPriceX96 = slot0[0]
//   const sqrtPrice = Number((sqrtPriceX96 * BigInt(pricisionFactor)) / BigInt(2 ** 96)) / pricisionFactor
//   const cbonPrice = sqrtPrice ** 2
//   return Number(1 / cbonPrice)

//   // return fetchCadinuPrice()
// }

// // AxfsUBa7kMAUS2x


