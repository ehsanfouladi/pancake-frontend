import { Flex, ProfileAvatar, Td, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useDomainNameForAddress } from 'hooks/useDomain'
import { useProfileForAddress } from 'state/profile/hooks'
import { RankListDetail } from 'views/TradingReward/hooks/useRankList'

interface DesktopResultProps {
  rank: RankListDetail
  index: number
}

const DesktopResult: React.FC<React.PropsWithChildren<DesktopResultProps>> = ({ rank, index }) => {
  
  const { profile, isLoading: isProfileLoading } = useProfileForAddress(rank.origin)
  const { domainName, avatar } = useDomainNameForAddress(rank.origin, !profile && !isProfileLoading)

  // const cakeAmount = useMemo(
  //   () => new BigNumber(rank?.estimatedReward).times(cakePriceBusd).toNumber(),
  //   [cakePriceBusd, rank?.estimateRewardUSD],
  // )

  return (
    <tr>
      <Td>
        <Text bold color="secondary">
          {`#${index + 1}`}
        </Text>
      </Td>
      <Td textAlign="left">
        <Flex>
          <ProfileAvatar width={42} height={42} src={profile?.nft?.image?.thumbnail ?? avatar} />
          <Text style={{ alignSelf: 'center' }} color="primary" bold ml="8px">
            {profile?.username || domainName || truncateHash(rank.origin)}
          </Text>
        </Flex>
      </Td>
      <Td textAlign="left">
        <Text bold>{`$${formatNumber(rank?.amountUSD)}`}</Text>
      </Td>
      <Td textAlign="right">
        <Text bold>{rank?.estimatedReward ? `${formatNumber(rank?.estimatedReward)} CBON` : '-'}</Text>
        <Text fontSize={12} color="textSubtle">
          {/* {`~${formatNumber(cakeAmount)} CAKE`} */}
        </Text>
      </Td>
    </tr>
  )
}

export default DesktopResult
