import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import Link from 'next/link'
import styled from 'styled-components'
import { CompetitionIncentives } from './DesktopView'

export const StyledMobileRow = styled(Box)`
  background-color: ${({ theme }) => theme.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }
`

interface MobileResultProps {
  competition: CompetitionIncentives
}

const MobileResult: React.FC<React.PropsWithChildren<MobileResultProps>> = ({ competition }) => {
  const { t } = useTranslation()

  return (
    <StyledMobileRow p="16px">
      <Flex justifyContent="space-between" mb="16px">
      <Link href={`trading-reward/top-traders/${competition._id}`}>
        <Text fontWeight="bold" color="secondary" mr="auto">
          {`#${competition._id}`}
        </Text>
      </Link>
        <Flex width="100%" justifyContent="flex-end">
        <Text >{`${competition.token0}/${competition.token1}`}</Text>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center" mb="16px">
        <Text fontSize="12px" color="textSubtle" mr="auto">
          {t('Reward')}
        </Text>
        <Box>
          <Text bold textAlign="right">
            {`${formatNumber(Number(competition.rewardAmount))} CBON`}
          </Text>
        </Box>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="12px" color="textSubtle" mr="auto">
          {t('Exchange')}
        </Text>
        <Text fontWeight="bold" textAlign="right">
        <Text >{competition.exchangeName}</Text>
        </Text>
      </Flex>
    </StyledMobileRow>
  )
}

export default MobileResult
