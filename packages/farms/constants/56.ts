import { bscTokens } from '@pancakeswap/tokens'
import { FeeAmount, Pool } from '@pancakeswap/v3-sdk'
import { getAddress } from 'viem'
import { CAKE_BNB_LP_MAINNET } from './common'
import { defineFarmV3Configs } from '../src/defineFarmV3Configs'
import { SerializedFarmConfig } from '..'

export const farmsV3 = defineFarmV3Configs([
  // {
  //   pid: 1,
  //   token0: bscTokens.cake,
  //   token1: bscTokens.wbnb,
  //   lpAddress: '0x133B3D95bAD5405d14d53473671200e9342896BF',
  //   feeAmount: FeeAmount.MEDIUM,
  // },

  // {
  //   pid: 1,
  //   token0: bscTokens.test1,
  //   token1: bscTokens.test2,
  //   lpAddress: '0x307901b515798ED8F89F6696B49E13e99A6381a4',
  //   feeAmount: FeeAmount.LOWEST,
  // },
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
