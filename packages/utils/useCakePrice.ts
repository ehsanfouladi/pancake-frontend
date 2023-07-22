import useSWRImmutable from 'swr/immutable'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from './bigNumber'

export const useCakePrice = () => {
  return useSWRImmutable(
    ['cake-usd-price'],
    async () => {
      const cake = await (await fetch('https://farms-api.pancakeswap.com/price/cake')).json()
      return cake.price as string
    },
    {
      refreshInterval: 1_000 * 10,
    },
  )
}

export const useCadinuPrice = () => {
  return useSWRImmutable(
    ['cadinu-usd-price'],
    async () => {
      const cadinu = await (await fetch('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=22984&convert_id=1,2781,2781')).json()
      return cadinu.data["22984"].quote["2781"].price as string
    },
    {
      refreshInterval: 1_000 * 10,
    },
  )
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


export const useCadinuPriceAsBN = () => {
  const { data } = useSWRImmutable(
    ['cake-usd-price-bn'],
    async () => {
      const cadinu = await (await fetch('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=22984&convert_id=1,2781,2781')).json()
      return new BigNumber( cadinu.data["22984"].quote["2781"].price)
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
