import { createPublicClient, http, PublicClient } from 'viem'
import { bsc } from 'viem/chains'

const BSC_NODE = 'https://bsc-dataseed.binance.org'


export const bscClient: PublicClient = createPublicClient({
  chain: bsc,
  transport: http(BSC_NODE),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
    },
  },
})
