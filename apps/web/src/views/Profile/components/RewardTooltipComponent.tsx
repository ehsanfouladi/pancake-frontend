import { useTranslation } from '@pancakeswap/localization'
import { Balance, Button, Flex, Text } from '@pancakeswap/uikit'
import { Dispatch } from 'react'

const RewardTooltipComponent: React.FC<React.PropsWithChildren<{
  points: number,
  reward: string,
  isTaken: boolean,
  rewardType: string,
  index: number,
  disabled: boolean,
  symbol: string,
  setSelectedRewardIndex: Dispatch<bigint>,
  handleClaim: any
}>> = ({
  index,
  reward,
  points,
  disabled,
  isTaken,
  symbol,
  setSelectedRewardIndex,
  handleClaim
}) => {
  const { t } = useTranslation()
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
            {/* {} {rewardTokenInfo?.[0].result} */}
            {reward} {symbol}
          </Text>

          <Button
            variant="tertiary" ml='15px' scale="sm"
            disabled={disabled}
            // {
            //   points > userUnusedPointsPercent
            //     || rewardType === REWARD_TYPE.GLOBAL ? !claimGlobalReward : !claimExclusiveReward
            // }
            onClick={() => handleClaim(index)} 
              // { if (rewardType === REWARD_TYPE.EXCLUSIVE) { handleExclusiveClaim(index) } else { handleGlobalClaim(index) } }}
          >Claim</Button>
        </Flex>
      </>
    );
  }

export default RewardTooltipComponent