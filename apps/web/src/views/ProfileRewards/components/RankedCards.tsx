import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Card,
  CardBody, Flex,
  LaurelLeftIcon,
  LaurelRightIcon,
  ProfileAvatar,
  SubMenu,
  Text
} from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useDomainNameForAddress } from 'hooks/useDomain'
import { useProfileForAddress } from 'state/profile/hooks'
import styled from 'styled-components'
import { RankListDetail } from 'views/TradingReward/hooks/useRankList'

interface RankingCardProps {
  rank: 1 | 2 | 3
  user: RankListDetail
  tokenSymbol: string
}

const RotatedLaurelLeftIcon = styled(LaurelLeftIcon)`
  transform: rotate(30deg);
`

const RotatedLaurelRightIcon = styled(LaurelRightIcon)`
  transform: rotate(-30deg);
`

const getRankingColor = (rank: number) => {
  if (rank === 3) {
    return 'bronze'
  }

  if (rank === 2) {
    return 'silver'
  }

  return 'gold'
}

const RankingCard: React.FC<React.PropsWithChildren<RankingCardProps>> = ({ rank, user, tokenSymbol }) => {
  const { t } = useTranslation()
  const rankColor = getRankingColor(rank)
  const { profile, isLoading: isProfileLoading } = useProfileForAddress(user?.origin)
  const { domainName, avatar } = useDomainNameForAddress(user?.origin, !profile && !isProfileLoading)

  return (
    <Flex flexDirection="column">
      <Box
        display={['block', 'block', 'block', 'block', 'block', 'none']}
        position="relative"
        bottom="-30px"
        margin="auto"
      />
      
      <Card       >
        <CardBody p="24px">
          <Flex alignItems="center" justifyContent="center" flexDirection="column" mb="24px">
            <SubMenu
              component={
                <Flex flexDirection="column">
                  <Flex mb="4px">
                    <RotatedLaurelLeftIcon color={rankColor} width="32px" />
                    <Box width={['40px', null, null, '64px']} height={['40px', null, null, '64px']}>
                      <ProfileAvatar src={profile?.nft?.image?.thumbnail ?? avatar} height={64} width={64} />
                    </Box>
                    <RotatedLaurelRightIcon color={rankColor} width="32px" />
                  </Flex>
                  <Text color="primary" fontWeight="bold" textAlign="center">
                    {profile?.username || domainName || truncateHash(user?.origin)}
                  </Text>
                </Flex>
              }
              options={{ placement: 'bottom' }}
            />
          </Flex>
          <Flex justifyContent="center" mb="4px" width='300px'>
            <Text bold color="textSubtle">
              {t('Claimed')} {`${user?.estimatedReward} ${tokenSymbol}`}
            </Text>
          </Flex>
          <Flex justifyContent="center">
            <Text bold color="textSubtle">
              {t('for')} {user?.amountUSD} {t('Points')} 
            </Text>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default RankingCard
