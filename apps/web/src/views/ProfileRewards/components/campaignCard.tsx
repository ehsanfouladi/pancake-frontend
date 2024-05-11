import { useTranslation } from "@pancakeswap/localization"
import { ChainId } from "@pancakeswap/sdk"
import { Card, CardHeader } from "@pancakeswap/uikit"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { getCadinuProfileRewardContract } from "utils/contractHelpers"
import { publicClient } from "utils/wagmi"
import { formatUnits, getContract } from "viem"
import { RankListDetail } from "views/TradingReward/hooks/useRankList"
import { erc20ABI } from "wagmi"
import RoundSwitcher from "./RoundSwitcher"
import PreviousCampaginCardBody from "./previousCampaginCardBody"

export interface Campaign {
  rewardTokenSymbol: string
  totalReward: number
  exclusiveRewards: number[]
  exclusiveRewardTakenByAddress: RankListDetail[]
}

export const CampaignCard = () => {
  const StyledCard = styled(Card)`
    width: 100%;
  
    ${({ theme }) => theme.mediaQueries.md} {
      width: 100%;
    }
  `

  const StyledCardHeader = styled(CardHeader)`
    z-index: 2;
    background: none;
    border-bottom: 1px ${({ theme }) => theme.colors.cardBorder} solid;
  `

  const { t } = useTranslation()
  const [campaignId, setCampaignId] = useState<bigint>(0n)
  const [currentCampaignId, setCurrentCampaignId] = useState<bigint>(0n)
  const [latestCampaignId, setLatestCampaignId] = useState<bigint>(null)
  const [campaignData, setCampaignData] = useState<Campaign>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getLatestCampaignId = useCallback(async () => {
    const nextId = await getCadinuProfileRewardContract()?.read.nextId()
    setLatestCampaignId(nextId - 1n)
  }, [])

  const getCampaignDataArray = useCallback(async () => {
    setIsLoading(true)
    const campaignDataArray = await getCadinuProfileRewardContract().read.getCampaignDataArray([campaignId])
    const cadinuCampaign = await getCadinuProfileRewardContract().read.cadinuCampaign([campaignId])
    const data: Campaign = {
      rewardTokenSymbol: await getTokenSymbol(cadinuCampaign[0]),
      totalReward: Number(cadinuCampaign[4]),
      exclusiveRewards: campaignDataArray[0]?.map((reward, index) => {
        if (campaignDataArray[4][index]) {
          return Number(reward)
        }
      }).filter(x => { if (x !== undefined) { return x } }),
      exclusiveRewardTakenByAddress: campaignDataArray[5]?.map((address, index) => {
        if (campaignDataArray[4][index]) {
          return {
            origin: address,
            amountUSD: Number(campaignDataArray[0][index]),
            estimatedReward: Number(formatUnits(campaignDataArray[1][index], 18))
          }
        }
      }).filter(x => { if (x !== undefined) { return x } })
    }
    setCampaignData(data)
    setIsLoading(false)

  }, [campaignId])


  useEffect(() => {
    if (!latestCampaignId) {
      getLatestCampaignId()
    }
  }, [currentCampaignId, getLatestCampaignId])
  useEffect(() => {
    getCampaignDataArray()
  }, [campaignId])

  const getTokenSymbol = useCallback(async (tokenAddress) => {
    const contract = getContract({
      address: tokenAddress,
      abi: erc20ABI,
      publicClient: publicClient({ chainId: ChainId.BSC })
    })
    const tokenSym = await contract.read.symbol()
    return tokenSym
  }, [campaignData])

  const handleInputChange = (e) => {
    console.log(e.target.value);
    if (BigInt(e.target.value) < latestCampaignId) {
      setCampaignId(BigInt(e.target.value))
    } else {
      setCampaignId(latestCampaignId)
    }

  }
  const handleArrowButtonPress = (targetRound) => {
    if (targetRound) {
      setCampaignId(BigInt(targetRound))
    } else {
      // targetRound is NaN when the input is empty, the only button press that will trigger this func is 'forward one'
      setCampaignId(0n)
    }
  }

  return (


    <StyledCard>
      <StyledCardHeader>
        <RoundSwitcher
          isLoading={isLoading}
          selectedRoundId={campaignId.toString()}
          mostRecentRound={Number(latestCampaignId)}
          handleInputChange={handleInputChange}
          handleArrowButtonPress={handleArrowButtonPress}
        />
      </StyledCardHeader>
      <PreviousCampaginCardBody campaignData={campaignData} isLoading={isLoading} />
    </StyledCard>

  )
}
