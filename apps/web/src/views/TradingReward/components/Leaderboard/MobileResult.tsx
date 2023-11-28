import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, ProfileAvatar, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useCbonPriceAsBN } from '@pancakeswap/utils/useCakePrice'
import { useDomainNameForAddress } from 'hooks/useDomain'
import { useProfileForAddress } from 'state/profile/hooks'
import styled from 'styled-components'
import { RankListDetail } from 'views/TradingReward/hooks/useRankList'

export const StyledMobileRow = styled(Box)`
  background-color: ${({ theme }) => theme.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }
`

interface MobileResultProps {
  rank: RankListDetail
  index: number
}

const MobileResult: React.FC<React.PropsWithChildren<MobileResultProps>> = ({ rank, index }) => {
  const { t } = useTranslation()
  // const cakePriceBusd = usePriceCakeUSD()
  const { profile, isLoading: isProfileLoading } = useProfileForAddress(rank.origin)
  const { domainName, avatar } = useDomainNameForAddress(rank.origin, !profile && !isProfileLoading)
  const cbonPrice = useCbonPriceAsBN()

  // const cakeAmount = useMemo(
  //   () => new BigNumber(rank?.estimateRewardUSD).div(cakePriceBusd).toNumber(),
  //   [cakePriceBusd, rank?.estimateRewardUSD],
  // )

  return (
    <StyledMobileRow p="16px">
      <Flex justifyContent="space-between" mb="16px">
        <Text fontWeight="bold" color="secondary" mr="auto">
          {`#${index + 1}`}
        </Text>
        <Flex width="100%" justifyContent="flex-end">
          <Text color="primary" fontWeight="bold" style={{ alignSelf: 'center' }} mr="8px">
            {profile?.username || domainName || truncateHash(rank.origin)}
          </Text>
          <ProfileAvatar width={32} height={32} src={profile?.nft?.image?.thumbnail ?? avatar} />
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center" mb="16px">
        <Text fontSize="12px" color="textSubtle" mr="auto">
          {t('Total Reward')}
        </Text>
        <Box>
          <Text bold textAlign="right">
            {`$${formatNumber(rank.estimatedReward)} CBON`}
          </Text>
          <Text fontSize="12px" color="textSubtle" textAlign="right" lineHeight="110%">
          {`~$${formatNumber(rank?.estimatedReward * Number(cbonPrice))}`}
          </Text>
        </Box>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="12px" color="textSubtle" mr="auto">
          {t('Trading Volume')}
        </Text>
        <Text fontWeight="bold" textAlign="right">
          {`$${formatNumber(rank.amountUSD)}`}
        </Text>
      </Flex>
    </StyledMobileRow>
  )
}

export default MobileResult
