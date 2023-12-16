import { ChainId } from '@pancakeswap/sdk'
import addresses from 'config/constants/contracts'
import { VaultKey } from 'state/types'

export interface Addresses {
  [chainId: number]: `0x${string}`
}

export const getAddressFromMap = (address: Addresses, chainId?: number): `0x${string}` => {
  return address[chainId] ? address[chainId] : address[ChainId.BSC]
}

export const getAddressFromMapNoFallback = (address: Addresses, chainId?: number): `0x${string}` | null => {
  return address[chainId]
}

export const getMasterChefV2Address = (chainId?: number) => {
  return getAddressFromMap(addresses.masterChef, chainId)
}
export const getMulticallAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.multiCall, chainId)
}
export const getLotteryV2Address = () => {
  return getAddressFromMap(addresses.lotteryV2)
}
export const getPancakeProfileAddress = () => {
  return getAddressFromMap(addresses.pancakeProfile)
}
export const 
getPancakeBunniesAddress = () => {
  return getAddressFromMap(addresses.pancakeBunnies)
}
export const getBunnyFactoryAddress = () => {
  return getAddressFromMap(addresses.bunnyFactory)
}
export const getPredictionsV1Address = () => {
  return getAddressFromMap(addresses.predictionsV1)
}
export const getPointCenterIfoAddress = () => {
  return getAddressFromMap(addresses.pointCenterIfo)
}
export const getTradingCompetitionAddressEaster = () => {
  return getAddressFromMap(addresses.tradingCompetitionEaster)
}
export const getTradingCompetitionAddressFanToken = () => {
  return getAddressFromMap(addresses.tradingCompetitionFanToken)
}

export const getTradingCompetitionAddressMobox = () => {
  return getAddressFromMap(addresses.tradingCompetitionMobox)
}

export const getTradingCompetitionAddressMoD = () => {
  return getAddressFromMap(addresses.tradingCompetitionMoD)
}

export const getVaultPoolAddress = (vaultKey: VaultKey) => {
  if (!vaultKey) {
    return null
  }
  return getAddressFromMap(addresses[vaultKey])
}

export const getCakeVaultAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.cakeVault, chainId)
}

export const getCakeFlexibleSideVaultAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.cakeFlexibleSideVault, chainId)
}

export const getFarmAuctionAddress = () => {
  return getAddressFromMap(addresses.farmAuction)
}

export const getNftMarketAddress = () => {
  return getAddressFromMap(addresses.nftMarket)
}
export const getNftSaleAddress = () => {
  return getAddressFromMap(addresses.nftSale)
}
export const getPancakeSquadAddress = () => {
  return getAddressFromMap(addresses.pancakeSquad)
}
export const getPotteryDrawAddress = () => {
  return getAddressFromMap(addresses.potteryDraw)
}

export const getZapAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.zap, chainId)
}

export const getBCakeFarmBoosterAddress = () => {
  return getAddressFromMap(addresses.bCakeFarmBooster)
}

export const getBCakeFarmBoosterV3Address = (chainId?: number) => {
  return getAddressFromMap(addresses.bCakeFarmBoosterV3, chainId)
}

export const getBCakeFarmBoosterProxyFactoryAddress = () => {
  return getAddressFromMap(addresses.bCakeFarmBoosterProxyFactory)
}

export const getNonBscVaultAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.nonBscVault, chainId)
}

export const getCrossFarmingSenderAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.crossFarmingSender, chainId)
}

export const getCrossFarmingReceiverAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.crossFarmingReceiver, chainId)
}

export const getStableSwapNativeHelperAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.stableSwapNativeHelper, chainId)
}

export const getMasterChefV3Address = (chainId?: number) => {
  return getAddressFromMapNoFallback(addresses.masterChefV3, chainId)
}

export const getV3MigratorAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.v3Migrator, chainId)
}

export const getTradingRewardAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.tradingReward, chainId)
}

export const getV3AirdropAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.v3Airdrop, chainId)
}

export const getAffiliateProgramAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.affiliateProgram, chainId)
}

export const getTradingRewardTopTradesAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.tradingRewardTopTrades, chainId)
}
// CADINU

export const getClaimAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.claimAD, chainId)
}
export const getPreSaleCbonAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.preSaleCbon, chainId)
}
export const getCadinuLockAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.cadinuLock, chainId)
}

export const getCadinuLockv3Address = (chainId?: number) => {
  return getAddressFromMap(addresses.cadinuLockV3, chainId)
}
export const getCadinuProfileAddress = () => {
  return getAddressFromMap(addresses.cadinuProfile)
}
export const getCadinuReferralAddress = () => {
  return getAddressFromMap(addresses.cadinuReferral)
}

export const getCadinuTradingCompetitionAddress = () => {
  return getAddressFromMap(addresses.cadinuTradingCompetition)
}

export const getCadinuProfileRewardAddress = () => {
  return getAddressFromMap(addresses.cadinuProfileReward)
}

export const getCadinuMigrationAddress = () => {
  return getAddressFromMap(addresses.cadinuMigration)
}
// export const 
// getCadinuCIAsAddress = () => {
//   return getAddressFromMap(addresses.cadinuCIAs)
// }