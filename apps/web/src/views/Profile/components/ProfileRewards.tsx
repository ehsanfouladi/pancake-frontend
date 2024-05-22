import { useTranslation } from "@pancakeswap/localization"
import { Balance, Box, Button, Card, Flex, PresentCheckIcon, PresentNoneIcon, PresentWonIcon, Progress, ProgressBar, Text, useToast, useTooltip } from "@pancakeswap/uikit"
import { ToastDescriptionWithTx } from "components/Toast"
import { cadinuProfileRewardAbi } from "config/abi/cadinuProfileReward"
import { useState } from "react"
import { getCadinuProfileRewardAddress } from "utils/addressHelpers"
import { formatUnits, } from "viem"
import { erc20ABI, useAccount, useContractRead, useContractReads, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"


interface Rewards {
  index: number
  points: number
  reward: number
  pointsPercent: number
  isTaken: boolean
}

interface UserPoints {
  points: number
  pointsPercent: number
}

export const ProfileRewardCard = () => {
  const REWARD_TYPE = {
    EXCLUSIVE: 'exclusive',
    GLOBAL: 'global'
  }

  const cadinuProfileRewardContract = {
    address: getCadinuProfileRewardAddress(),
    abi: cadinuProfileRewardAbi
  }

  const { t } = useTranslation()
  const { address: account, isConnected } = useAccount()
  // const [campaignId, setCampaignId] = useState<bigint>(0n)
  const [selectedRewardIndex, setSelectedRewardIndex] = useState<bigint>(0n)
  const { toastSuccess } = useToast()
  const { data: nextCampaingId, isLoading: isNextIdLoading, isSuccess: isNextIdSuccess } = useContractRead({
    address: getCadinuProfileRewardAddress(),
    abi: cadinuProfileRewardAbi,
    functionName: 'nextId',
    structuralSharing: (prev, next) => (prev === next ? prev : next),
  })


  const { data: rewardInfo, isError: isRewardError, isSuccess: isRewardSuccess } = useContractReads({
    watch: true,
    enabled: isNextIdSuccess && typeof (nextCampaingId) === "bigint",
    contracts: [
      {
        ...cadinuProfileRewardContract,
        functionName: 'getCampaignDataArray',
        args: [nextCampaingId && nextCampaingId - 1n]
      },
      {
        ...cadinuProfileRewardContract,
        functionName: 'getUserUnusedPoints',
        args: [account]
      },
      {
        ...cadinuProfileRewardContract,
        functionName: 'cadinuCampaign',
        args: [nextCampaingId && nextCampaingId - 1n]
      }
    ]
  })


  const { data: rewardTokenInfo } = useContractReads({
    enabled: isRewardSuccess,
    contracts: [
      { address: rewardInfo?.[2].result?.[0], abi: erc20ABI, functionName: 'symbol' },
      { address: rewardInfo?.[2].result?.[0], abi: erc20ABI, functionName: 'decimals' }
    ]
  })

  const handleGlobalClaim = (index: number) => {
    setSelectedRewardIndex(BigInt(index))
    claimGlobalReward()
  }
  const handleExclusiveClaim = (index: number) => {
    setSelectedRewardIndex(BigInt(index))
    claimExclusiveReward()
  }


  const exclusiveRewards: Rewards[] = rewardInfo?.[0]?.result[0]?.map((res, index) => {
    return {
      index,
      points: Number(res),
      reward: Number(rewardInfo?.[0]?.result[1][index]),
      pointsPercent: 100 * Number(res) / Number(rewardInfo?.[0]?.result[0]?.at(-1)),
      isTaken: rewardInfo?.[0]?.result[4][index]
    }
  })

  const globalRewards: Rewards[] = rewardInfo?.[0]?.result[2].map((res, index) => {
    return {
      index,
      points: Number(res),
      reward: Number(rewardInfo?.[0]?.result[3][index]),
      pointsPercent: 100 * Number(res) / Number(rewardInfo?.[0]?.result[0]?.at(-1)),
      isTaken: false
    }
  })

  const userUnusedPoints: UserPoints = {
    points: Number(rewardInfo?.[1]?.result),
    pointsPercent: 100 * Number(rewardInfo?.[1]?.result) / Number(rewardInfo?.[0]?.result[0]?.at(-1))
  }

  const { config: globalRewardsConfig } = usePrepareContractWrite({
    enabled: isConnected,
    address: getCadinuProfileRewardAddress(),
    abi: cadinuProfileRewardAbi,
    functionName: 'withdrawGlobalReward',
    args: [selectedRewardIndex]
  })

  const { data: globalClaimData, write: claimGlobalReward } = useContractWrite(globalRewardsConfig)
  const { data: globalFinal } = useWaitForTransaction({
    hash: globalClaimData?.hash,
    onSuccess: async (hash) => {
      toastSuccess(t('Amount Withdrew Successfully!'), <ToastDescriptionWithTx txHash={globalClaimData?.hash.toString()} />)
    },
  })



  const { config: exclusiveRewardsConfig } = usePrepareContractWrite({
    enabled: isConnected,
    address: getCadinuProfileRewardAddress(),
    abi: cadinuProfileRewardAbi,
    functionName: 'withdrawExclusiveReward',
    args: [selectedRewardIndex]
  })
  const { data: exclusiveClaimData, write: claimExclusiveReward } = useContractWrite(exclusiveRewardsConfig)
  const { data: exclusiveFinal } = useWaitForTransaction({
    hash: exclusiveClaimData?.hash,
    onSuccess: async (hash) => {
      toastSuccess(t('Amount Withdrew Successfully!'), <ToastDescriptionWithTx txHash={exclusiveClaimData?.hash.toString()} />)
    },
  })


  const RewardTooltipComponent: React.FC<React.PropsWithChildren<{
    points: number,
    reward: number,
    userUnusedPointsPercent: number,
    isTaken: boolean,
    rewardType: string,
    index: number
  }>> = ({
    index,
    reward,
    points,
    userUnusedPointsPercent,
    isTaken,
    rewardType,
  }) => {
      setSelectedRewardIndex(BigInt(index))
      if (isTaken) {
        return (<Flex flex='wrap' flexDirection='column' justifyContent='center' verticalAlign='center'>
          <Text bold>{t("This reward has been taken.")}</Text>
        </Flex>)
      }
      return (
        <>
          <Flex flex='wrap' flexDirection='column' justifyContent='center' verticalAlign='center'>
            <Text bold>{t("Required Points")}:</Text>
            <Text>
              <Balance value={points} decimals={0} startFromValue />
            </Text>
            <Text bold>{t("Reward")}:</Text>
            <Text>
              {formatUnits(BigInt(reward), rewardTokenInfo?.[1].result)} {rewardTokenInfo?.[0].result}
            </Text>

            <Button
              variant="tertiary" ml='15px' scale="sm"
              disabled={
                points > userUnusedPointsPercent
                  || rewardType === REWARD_TYPE.GLOBAL ? !claimGlobalReward : !claimExclusiveReward
              }
              onClick={() => { if (rewardType === REWARD_TYPE.EXCLUSIVE) { handleExclusiveClaim(index) } else { handleGlobalClaim(index) } }}
            >Claim</Button>
          </Flex>
        </>
      );
    }
  function RewardDisplay(
    index: number,
    pointsPercent: number,
    points: number,
    reward: number,
    userUnusedPointsPercent: number,
    isTaken: boolean,
    rewardType: string
  ) {
    const {
      targetRef: rewardRef,
      tooltip: rewardTooltip,
      tooltipVisible: rewardTooltipVisible,
    } = useTooltip(<RewardTooltipComponent
      index={index}
      isTaken={isTaken}
      reward={reward}
      points={points}
      userUnusedPointsPercent={userUnusedPointsPercent}
      rewardType={rewardType}

    />, {
      placement: "top",
    });
    if (isTaken) {
      return (
        <Flex alignItems="center" ref={rewardRef}>
          <PresentNoneIcon color='success' style={{
            display: 'flex',
            position: 'fixed',
            marginLeft: '-10px',
          }} width='35px' />
          {rewardTooltipVisible && rewardTooltip}
        </Flex>
      )
    }
    if (pointsPercent <= userUnusedPointsPercent) {
      return (
        <Flex alignItems="center" ref={rewardRef}>
          <PresentWonIcon style={{ display: 'flex', position: 'fixed', marginLeft: '-10px' }} width='35px' />
          {rewardTooltipVisible && rewardTooltip}
        </Flex>
      )
    }
    return (
      <Flex alignItems="center" ref={rewardRef}>
        <PresentCheckIcon style={{ display: 'flex', position: 'fixed', marginLeft: '-10px' }} width='35px' />
        {rewardTooltipVisible && rewardTooltip}
      </Flex>
    )

  }


  if (!nextCampaingId) {
    return (<></>)
  }
  return (<>
    {rewardInfo?.[2].result?.[7] ? (<Box width={['100%', '100%', '100%', '100%']} mb='15px'>
      <Card style={{ width: '100%' }}>
        <Box padding={['24px']} style={{ textAlign: 'center' }}>
          <Text bold>No Active Campaign</Text>
        </Box>
      </Card>
    </Box>) : (
      <Box width={['100%', '100%', '100%', '100%']} mb='15px'>
        {!isRewardError &&
          <Card
            style={{ width: '100%' }}>
            <Box padding={['24px']}>
              <Text bold textAlign="right" mb="24px">
                {t('Your Profile Reward')}
              </Text>
              <Text bold>Campaign ID: {nextCampaingId && (nextCampaingId - 1n).toString()}</Text>
              <Text bold>Your Unclaimed Rewards Points: {userUnusedPoints?.points}</Text>
              <Box mb='25px'>
                <Text bold>Global Rewards:</Text>
                <br />
                <Progress variant="round"
                  scale='md'
                >
                  <ProgressBar
                    $useDark
                    $background="linear-gradient(273deg, #ffd800 -2.87%, #eb8c00 113.73%)"
                    style={{ width: `${Math.min(Math.max(userUnusedPoints.pointsPercent, 0), 100)}%` }}
                  />
                  {globalRewards?.map(reward => (
                    <Box
                      top={0}
                      left={`${reward.pointsPercent}%`}
                      bottom={0}
                      right={0}
                      position="absolute"
                      display="flex">
                      {RewardDisplay(
                        reward.index,
                        reward.pointsPercent,
                        reward.points,
                        reward.reward,
                        userUnusedPoints.pointsPercent,
                        false,
                        REWARD_TYPE.GLOBAL
                      )}
                    </Box>
                  ))}
                </Progress>
              </Box>
              <Box mb='25px'>
                <Text bold>Exclusive Rewards:</Text>
                <br />
                <Progress variant="round"
                  showProgressBunny
                  scale='md'
                >
                  <ProgressBar
                    $useDark
                    $background="linear-gradient(273deg, #ff6600 -2.87%, #995c00 113.73%)"
                    style={{ width: `${Math.min(Math.max(userUnusedPoints.pointsPercent, 0), 100)}%` }}
                  />
                  {exclusiveRewards?.map(reward => (
                    <Box
                      top={0}
                      left={`${reward.pointsPercent}%`}
                      bottom={0}
                      right={0}
                      position="absolute"
                      display="flex">
                      {RewardDisplay(
                        reward.index,
                        reward.pointsPercent,
                        reward.points,
                        reward.reward,
                        userUnusedPoints.pointsPercent,
                        reward.isTaken,
                        REWARD_TYPE.EXCLUSIVE)}
                    </Box>
                  ))}
                </Progress>
              </Box>
            </Box>
          </Card>
        }
      </Box>)}
  </>
  )
}
