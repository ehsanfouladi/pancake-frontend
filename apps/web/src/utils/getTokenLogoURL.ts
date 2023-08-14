import { getAddress } from 'viem'
import memoize from 'lodash/memoize'
import { ChainId, Token } from '@pancakeswap/sdk'

const mapping = {
  [ChainId.BSC]: 'smartchain',
  [ChainId.ETHEREUM]: 'ethereum',
}

const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (token.symbol === "CADINU"){
      return "https://bscscan.com/token/images/canadianinu_32.png"
    }
    if (token.symbol === "CBON"){
      return "/images/cbonLogo.PNG"
    }
    if (token && mapping[token.chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[token.chainId]}/assets/${getAddress(
        token.address,
      )}/logo.png`
    }
    return null
  },
  (t) => `${t.chainId}#${t.address}`,
)

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => {
    if (address === "0x76e112203eF59D445452ef7556386dD2DF3Ed914"){
      return "https://bscscan.com/token/images/canadianinu_32.png"
    }
    if (address === "0x6e64fCF15Be3eB71C3d42AcF44D85bB119b2D98b"){
      return "/images/cbonLogo.PNG"
    }
    if (address && chainId && mapping[chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${getAddress(address)}/logo.png`
    }
    return null
  },
  (address, chainId) => `${chainId}#${address}`,
)

export default getTokenLogoURL
