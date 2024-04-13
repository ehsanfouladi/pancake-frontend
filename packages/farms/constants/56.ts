import { bscTokens } from '@pancakeswap/tokens'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { getAddress } from 'viem'
import { SerializedFarmConfig } from '..'
import { defineFarmV3Configs } from '../src/defineFarmV3Configs'

export const farmsV3 = defineFarmV3Configs([
  // {
  //   pid: 1,
  //   token0: bscTokens.cake,
  //   token1: bscTokens.wbnb,
  //   lpAddress: '0x133B3D95bAD5405d14d53473671200e9342896BF',
  //   feeAmount: FeeAmount.MEDIUM,
  // },

  {
    pid: 3,
    token0: bscTokens.usdt,
    token1: bscTokens.btcb,
    lpAddress: '0xC9C8Ee259a61A3611Af050a94524BdA071a2b7eF',
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 4,
    token0: bscTokens.eth,
    token1: bscTokens.usdt,
    lpAddress: '0xE16721499C7BDBD5846Bbf2a27fA3b23D3139946',
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 5,
    token0: bscTokens.usdt,
    token1: bscTokens.bnb,
    lpAddress: '0x0A743fb2efd7a3fD43C4779350467F1B748d8c84',
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 6,
    token0: bscTokens.usdt,
    token1: bscTokens.cbon,
    lpAddress: '0x5760e9386bD0273e5c6B28D8131aC0c5b52c600C',
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 7,
    token0: bscTokens.usdt,
    token1: bscTokens.cadinu,
    lpAddress: '0x5b68A5B87D7FFeE4f8A515Edf524ADe061239Cdf',
    feeAmount: FeeAmount.HIGH,
  },
  // {
  //   pid: 2,
  //   token0: bscTokens.usdt,
  //   token1: bscTokens.wbnb,
  //   lpAddress: '0x007a6d6504af2a41b1ccb5eb52b6c62b2e55572a',
  //   feeAmount: FeeAmount.LOWEST,
  // },


])

const farms: SerializedFarmConfig[] = [
  /**
   * These 3 farms (PID 0, 2, 3) should always be at the top of the file.
   */
  // {
  //   pid: 0,
  //   v1pid: 0,
  //   lpSymbol: 'CAKE',
  //   lpAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  //   token: bscTokens.syrup,
  //   quoteToken: bscTokens.wbnb,
  // },
  // {
  //   pid: 109,
  //   lpSymbol: 'XCAD-BUSD LP',
  //   lpAddress: '0x07C10ecFb0e1CF81E3e05ddb693Cc114C8EBe498',
  //   token: bscTokens.xcad,
  //   quoteToken: bscTokens.busd,
  //   isCommunity: true,
  //   auctionHostingStartSeconds: 1668153600, // Fri Nov 11 2022 08:00:00 GMT+0000

].map((p) => ({
  ...p,
  token: p.token.serialize,
  quoteToken: p.quoteToken.serialize,
  lpAddress: getAddress(p.lpAddress),
}))

export default farms
