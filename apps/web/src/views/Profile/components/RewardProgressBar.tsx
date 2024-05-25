import { Flex, PresentCheckIcon, PresentNoneIcon, PresentWonIcon, useTooltip } from '@pancakeswap/uikit';
import React, { Dispatch } from 'react';
import RewardTooltipComponent from './RewardTooltipComponent';

interface Props {
  index: number
  pointsPercent: number
  points: number
  reward: string
  userUnusedPointsPercent: number
  isTaken: boolean
  rewardType: string
  disabled: boolean
  symbol: string
  setSelectedRewardIndex: Dispatch<bigint>
  handleClaim: any
}

const RewardProgressBar: React.FC<Props> = (
  {
    index,
    pointsPercent,
    points,
    reward,
    userUnusedPointsPercent,
    isTaken,
    rewardType,
    disabled,
    symbol,
    setSelectedRewardIndex,
    handleClaim,
  }
) => {
  const {
    targetRef: rewardRef,
    tooltip: rewardTooltip,
    tooltipVisible: rewardTooltipVisible,
  } = useTooltip(<RewardTooltipComponent
    index={index}
    isTaken={isTaken}
    reward={reward}
    points={points}
    rewardType={rewardType}
    disabled={disabled}
    symbol={symbol}
    setSelectedRewardIndex={setSelectedRewardIndex}
    handleClaim={handleClaim}
  // userUnusedPointsPercent={userUnusedPointsPercent}

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

export default RewardProgressBar