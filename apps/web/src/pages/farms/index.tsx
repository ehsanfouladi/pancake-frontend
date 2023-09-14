import { useContext } from 'react'
import { SUPPORT_FARMS, SUPPORT_ONLY_BSC } from 'config/constants/supportChains'
import { FarmsV3PageLayout, FarmsV3Context } from 'views/Farms'
import { FarmV3Card } from 'views/Farms/components/FarmCard/V3/FarmV3Card'
import { getDisplayApr } from 'views/Farms/components/getDisplayApr'
import { usePriceCbonUSD } from 'state/farms/hooks'
import { useAccount } from 'wagmi'
import FarmCard from 'views/Farms/components/FarmCard/FarmCard'
import ProxyFarmContainer, {
  YieldBoosterStateContext,
} from 'views/Farms/components/YieldBooster/components/ProxyFarmContainer'

export const ProxyFarmCardContainer = ({ farm }) => {
  const { address: account } = useAccount()
  const cakePrice = usePriceCbonUSD()

  const { proxyFarm, shouldUseProxyFarm } = useContext(YieldBoosterStateContext)
  const finalFarm = shouldUseProxyFarm ? proxyFarm : farm

  return (
    <FarmCard
      key={finalFarm.pid}
      farm={finalFarm}
      displayApr={getDisplayApr(finalFarm.apr, finalFarm.lpRewardsApr)}
      cakePrice={cakePrice}
      account={account}
      removed={false}
    />
  )
}

const FarmsPage = () => {
  const { address: account } = useAccount()
  const { chosenFarmsMemoized } = useContext(FarmsV3Context)
  const cakePrice = usePriceCbonUSD()

  return (
    <>
      {chosenFarmsMemoized?.map((farm) => {
        if (farm.version === 2) {
          return farm.boosted ? (
            <ProxyFarmContainer farm={farm} key={`${farm.pid}-${farm.version}`}>
              <ProxyFarmCardContainer farm={farm} />
            </ProxyFarmContainer>
          ) : (
            <FarmCard
              key={`${farm.pid}-${farm.version}`}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed={false}
            />
          )
        }

        return (
          <FarmV3Card
            key={`${farm.pid}-${farm.version}`}
            farm={farm}
            cakePrice={cakePrice}
            account={account}
            removed={false}
          />
        )
      })}
    </>
  )
}

FarmsPage.Layout = FarmsV3PageLayout

FarmsPage.chains = SUPPORT_ONLY_BSC

export default FarmsPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
