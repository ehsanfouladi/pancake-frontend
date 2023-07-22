import { ChainId, Token, WNATIVE } from '@pancakeswap/sdk'
import {
  bscTokens,
  bscTestnetTokens,
  BUSD,
  USDC,
  USDT,
  WBTC_ETH,
  arbitrumTokens,
  arbitrumGoerliTokens,
  ethereumTokens,
  polygonZkEvmTokens,
  polygonZkEvmTestnetTokens,
  zksyncTokens,
  zkSyncTestnetTokens,
  lineaTestnetTokens,
} from '@pancakeswap/tokens'

import { ChainMap, ChainTokenList } from '../types'

export const SMART_ROUTER_ADDRESSES = {
  [ChainId.ETHEREUM]: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
  [ChainId.GOERLI]: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
  [ChainId.BSC]: '0x67E0Ff806c1a76c37b62365714fE17A1261568bc',
  [ChainId.BSC_TESTNET]: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
  // TODO: new chains
  [ChainId.ARBITRUM_ONE]: '0x32226588378236Fd0c7c4053999F88aC0e5cAc77',
  [ChainId.ARBITRUM_GOERLI]: '0xBee35e9Cbd9595355Eaf5DE2055EF525adB41bE6',
  [ChainId.POLYGON_ZKEVM]: '0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86',
  [ChainId.POLYGON_ZKEVM_TESTNET]: '0x365C5F0B816828936320ea143e337fbA7D1b911E',
  [ChainId.ZKSYNC]: '',
  [ChainId.ZKSYNC_TESTNET]: '0x2CecA0100bB12F3Ee164D260b058281809C7e1E8',
  [ChainId.LINEA_TESTNET]: '0x21d809FB4052bb1807cfe2418bA638d72F4aEf87',
} as const satisfies Record<ChainId, string>

export const V2_ROUTER_ADDRESS: ChainMap<string> = {
  [ChainId.ETHEREUM]: '0x3BC722f252C7bAE2f55647e49aDcB9d33Ff6eBcC',
  [ChainId.GOERLI]: '0x3BC722f252C7bAE2f55647e49aDcB9d33Ff6eBcC',
  [ChainId.BSC]: '0xeeCAd93313BeBA1EE187f52D4036fB5fc828Ac4E',
  [ChainId.BSC_TESTNET]: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  [ChainId.ARBITRUM_ONE]: '0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb',
  [ChainId.ARBITRUM_GOERLI]: '0xB8054A1F11090fbe82B45aC3c72e86732f8355DC',
  [ChainId.POLYGON_ZKEVM]: '0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb',
  [ChainId.POLYGON_ZKEVM_TESTNET]: '0x1ac9F6489487a282961b3929bCFA0a773251315E',
  [ChainId.ZKSYNC]: '0xbFc9a73c77d5D8cE972FBa2806Ac18e7d913Deb6',
  [ChainId.ZKSYNC_TESTNET]: '0x8A1fB895Ac009Bdc2e773d117695F21C1BF13D99',
  [ChainId.LINEA_TESTNET]: '0xD7A304138D50C125733d1fE8a2041199E4944Aa1',
}

export const STABLE_SWAP_INFO_ADDRESS: ChainMap<string> = {
  [ChainId.ETHEREUM]: '',
  [ChainId.GOERLI]: '',
  [ChainId.BSC]: '0xa680d27f63Fa5E213C502d1B3Ca1EB6a3C1b31D6',
  [ChainId.BSC_TESTNET]: '0xaE6C14AAA753B3FCaB96149e1E10Bc4EDF39F546',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARBITRUM_GOERLI]: '',
  [ChainId.POLYGON_ZKEVM]: '',
  [ChainId.POLYGON_ZKEVM_TESTNET]: '',
  [ChainId.ZKSYNC]: '',
  [ChainId.ZKSYNC_TESTNET]: '',
  [ChainId.LINEA_TESTNET]: '',
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.ETHEREUM]: [WNATIVE[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM], WBTC_ETH],
  [ChainId.GOERLI]: [WNATIVE[ChainId.GOERLI], USDC[ChainId.GOERLI], BUSD[ChainId.GOERLI]],
  [ChainId.BSC]: [
    bscTokens.wbnb,
    bscTokens.cake,
    bscTokens.busd,
    bscTokens.usdt,
    bscTokens.btcb,
    bscTokens.eth,
    bscTokens.usdc,
    bscTokens.cadinu,
  ],
  [ChainId.BSC_TESTNET]: [bscTestnetTokens.wbnb, bscTestnetTokens.cake, bscTestnetTokens.busd],
  [ChainId.ARBITRUM_ONE]: [arbitrumTokens.weth, arbitrumTokens.usdt, arbitrumTokens.usdc],
  [ChainId.ARBITRUM_GOERLI]: [arbitrumGoerliTokens.weth, arbitrumGoerliTokens.usdc],
  [ChainId.POLYGON_ZKEVM]: [polygonZkEvmTokens.weth, polygonZkEvmTokens.usdt],
  [ChainId.POLYGON_ZKEVM_TESTNET]: [polygonZkEvmTestnetTokens.weth, polygonZkEvmTestnetTokens.usdt],
  [ChainId.ZKSYNC]: [zksyncTokens.usdc, zksyncTokens.weth],
  [ChainId.ZKSYNC_TESTNET]: [zkSyncTestnetTokens.usdc, zkSyncTestnetTokens.weth],
  [ChainId.LINEA_TESTNET]: [lineaTestnetTokens.usdc, lineaTestnetTokens.weth],
}

/**
 * Additional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.BSC]: {
    // SNFTS-SFUND
    [bscTokens.snfts.address]: [bscTokens.sfund],

    [bscTokens.ankr.address]: [bscTokens.ankrbnb],
    [bscTokens.ankrbnb.address]: [bscTokens.ankrETH, bscTokens.ankr],
    [bscTokens.ankrETH.address]: [bscTokens.ankrbnb],

    // REVV - EDU
    [bscTokens.revv.address]: [bscTokens.edu],
    [bscTokens.edu.address]: [bscTokens.revv],
    // unshETH - USH
    [bscTokens.unshETH.address]: [bscTokens.ush],
    [bscTokens.ush.address]: [bscTokens.unshETH],
  },
  [ChainId.ETHEREUM]: {
    // alETH - ALCX
    [ethereumTokens.alcx.address]: [ethereumTokens.alETH],
    [ethereumTokens.alETH.address]: [ethereumTokens.alcx],

    // rETH - ETH
    [ethereumTokens.weth.address]: [ethereumTokens.rETH],
  },
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 * @example [AMPL.address]: [DAI, WNATIVE[ChainId.BSC]]
 */
export const CUSTOM_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.BSC]: {
    [bscTokens.axlusdc.address]: [bscTokens.usdt],
  },
}
