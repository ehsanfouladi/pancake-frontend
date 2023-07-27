import { ChainId,  CurrencyAmount, Pair } from '@pancakeswap/sdk'
import { BUSD, CADINU } from '@pancakeswap/tokens'
import useSWRImmutable from 'swr/immutable'
import useSWR from 'swr'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from './bigNumber'
import { publicClient } from '../../apps/web/src/utils/wagmi'


export const useCakePrice = () => {
  return useSWRImmutable(
    ['cake-usd-price'],
    async () => {
      const cake = await (await fetch('https://farms.cadinu.io/price/cake')).json()
      return cake.price as string
    },
    {
      refreshInterval: 1_000 * 10,
    },
  )
}

export const useCbonPrice = () => {
  return useSWRImmutable(
    ['cbon-usd-price'],
    async () => {
      const cbon = await (await fetch('https://farms.cadinu.io/price/cbon')).json()
      return cbon.price as string
    },
    {
      refreshInterval: 1_000 * 10,
    },
  )
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

export const useCadinuPrice = () => {
  const pairConfig = {
    address: Pair.getAddress(CADINU[ChainId.BSC], BUSD[ChainId.BSC]),
    tokenA: CADINU[ChainId.BSC],
    tokenB: BUSD[ChainId.BSC],
  }
// const pairConfig = pairConfig[ChainId.BSC]
const bscClient = publicClient({chainId: ChainId.BSC})
return useSWR(
  ['cadinu-usd-price'],
async ()=>{
const [reserve0, reserve1] = await bscClient.readContract({
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
  const cadinuPrice =  pair.priceOf(tokenA).toSignificant(18)
  return cadinuPrice as string
},

{
  refreshInterval: 1_000 * 10,
},
)

// const cadinuPrice =
//          useMemo(
//           () =>{
//            const cadinu = getPriceFromPair?.()} , [])
  // return useSWRImmutable(
  //   ['cadinu-usd-price'],
  //   async () => {
  //     const cadinu = await (await fetch('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=22984&convert_id=1,2781,2781')).json()
  //     return cadinu.data["22984"].quote["2781"].price as string
  //   },
  //   {
  //     refreshInterval: 1_000 * 10,
  //   },
  // )
}

// for migration to bignumber.js to avoid breaking changes
export const useCakePriceAsBN = () => {
  const { data } = useSWRImmutable(
    ['cake-usd-price-bn'],
    async () => {
      const cake = await (await fetch('https://farms-api.pancakeswap.com/price/cake')).json()
      return new BigNumber(cake.price)
    },
    {
      compare: (a, b) => {
        if (!a && !b) return true
        if (!a || !b) return false
        return a.eq(b)
      },
      refreshInterval: 1_000 * 10,
    },
  )

  return data ?? BIG_ZERO
}

// export const useCakePriceAsBN = () => {
//   const { data } = useSWRImmutable(
//     ['cake-usd-price-bn'],
//     async () => {
//       const cadinu = await (await fetch('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=22984&convert_id=1,2781,2781')).json()
//       return new BigNumber( cadinu.data["22984"].quote["2781"].price)
//     },
//     {
//       compare: (a, b) => {
//         if (!a && !b) return true
//         if (!a || !b) return false
//         return a.eq(b)
//       },
//       refreshInterval: 1_000 * 10,
//     },
//   )

//   return data ?? BIG_ZERO
// }


export const useCadinuPriceAsBN = () => {
  const { data } = useSWRImmutable(
    ['cadinu-usd-price-bn'],
    async () => {
      const cadinu = await (await fetch('https://farms.pancakeswap.com/price/cadinu')).json()
      return new BigNumber(cadinu.price)
    },
    {
      compare: (a, b) => {
        if (!a && !b) return true
        if (!a || !b) return false
        return a.eq(b)
      },
      refreshInterval: 1_000 * 10,
    },
  )

  return data ?? BIG_ZERO
}

// export const useCadinuPriceAsBN = () => {
//   const { data } = useSWRImmutable(
//     ['cake-usd-price-bn'],
//     async () => {
//       const cadinu = await (await fetch('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=22984&convert_id=1,2781,2781')).json()
//       return new BigNumber( cadinu.data["22984"].quote["2781"].price)
//     },
//     {
//       compare: (a, b) => {
//         if (!a && !b) return true
//         if (!a || !b) return false
//         return a.eq(b)
//       },
//       refreshInterval: 1_000 * 10,
//     },
//   )

//   return data ?? BIG_ZERO
// }

export const useCbonPriceAsBN = () => {
  const { data } = useSWRImmutable(
    ['cbon-usd-price-bn'],
    async () => {
      const cbon = await (await fetch('https://farms.cadinu.io/price/cbon')).json()
      return new BigNumber(cbon.price)
    },
    {
      compare: (a, b) => {
        if (!a && !b) return true
        if (!a || !b) return false
        return a.eq(b)
      },
      refreshInterval: 1_000 * 10,
    },
  )

  return data ?? BIG_ZERO
}
