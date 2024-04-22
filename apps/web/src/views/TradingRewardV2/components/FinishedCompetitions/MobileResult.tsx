import { useTranslation } from '@pancakeswap/localization'
import { Box, CheckmarkIcon, ErrorIcon, Flex, Text, TimerIcon } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { useCbonPriceAsBN } from '@pancakeswap/utils/useCakePrice'
import Link from 'next/link'
import { useMemo } from 'react'
import { useChainNameByQuery } from 'state/info/hooks'
import styled from 'styled-components'
import { CurrencyLogo } from 'views/Info/components/CurrencyLogo'
import { Competition } from '../types'

export const StyledMobileRow = styled(Box)`
  background-color: ${({ theme }) => theme.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }
`

interface MobileResultProps {
  competition: Competition
}

const MobileResult: React.FC<React.PropsWithChildren<MobileResultProps>> = ({ competition }) => {
  const { t } = useTranslation()
  const cbonPrice = useCbonPriceAsBN()
  const ResponsiveLogo = styled(CurrencyLogo)`
  @media screen and (max-width: 670px) {
    width: 16px;
    height: 16px;
  }
`

  function TimeCountdownDisplay({
    timestamp,
    getNow = () => Date.now(),
  }: {
    timestamp: number;
    getNow?: () => number;
  }) {

    const currentDate = getNow() / 1000;
    const competitionTimeRemaining = Math.abs(timestamp - currentDate);
    const endTimeObject = useMemo(() => getTimePeriods(competitionTimeRemaining), [competitionTimeRemaining]);
    const hasTimePassed = (timestamp - currentDate) < 0

    return (
      <Flex alignItems="center">
        <TimerIcon ml="4px" color="primary" />
        <Text color="textSubtle" small>
          {!hasTimePassed
            ? endTimeObject?.totalDays
              ? endTimeObject?.totalDays === 1
                ? t("1 day")
                : t("%days% days", { days: endTimeObject?.totalDays })
              : t("< 1 day")
            : t("%days% days ago", { days: endTimeObject?.totalDays })}
        </Text>
      </Flex>
    );
  }
  const chainName = useChainNameByQuery()
  return (
    <StyledMobileRow p="16px">
      <Flex justifyContent="space-between" mb="16px">
        <Link href={`trading-competition-v2/top-traders/${competition._id}`}>
          <Text fontWeight="bold" color="secondary" mr="auto">
            {`#${competition._id}`}
          </Text>
        </Link>
        <Link href={`trading-competition-v2/projects/${competition.project.token}`}>
          <Flex alignItems="center">
            <ResponsiveLogo size="24px" address={competition.project.token.toLocaleLowerCase()} chainName={chainName} />
            <Flex marginLeft="10px">
              <Text >{competition.project.token_symbol}</Text>
            </Flex>
          </Flex>
          <Text fontSize={12} color="textSubtle">{competition.project.name.slice(0, 18)}</Text>
        </Link>

      </Flex>
      <Flex justifyContent="space-between" alignItems="center" mb="16px">
        <Text fontSize="12px" color="textSubtle" mr="auto">
          {t('Pool')}
        </Text>
        <Flex width="100%" justifyContent="flex-end">
          <Text >{`${competition.token_0}/${competition.token_1}`}</Text>
        </Flex>
      </Flex>
      <Flex width="100%" justifyContent="flex-start" mb='15px'>
        <Flex width="10%" justifyContent="flex-start">
          <Text small>From:</Text> </Flex>
        <Flex width="40%" justifyContent="flex-end">
          <TimeCountdownDisplay timestamp={Number(competition.start_time)} />
        </Flex>
        <Flex width="100%" justifyContent="flex-end">
          <Flex width="10%" justifyContent="flex-start">
            <Text small>Until</Text>
          </Flex>
          <Flex width="40%" justifyContent="flex-end">
            <TimeCountdownDisplay timestamp={Number(competition.end_time)} />
          </Flex>
        </Flex>
      </Flex>


      <Flex justifyContent="space-between" alignItems="center" mb="16px">
        <Text fontSize="12px" color="textSubtle" mr="auto">
          {t('Reward')}
        </Text>
        <Box>
          <Text bold textAlign="right">{`${formatNumber(Number(competition.reward_amount), 0, 0)} ${competition.reward_token_symbol}`}</Text>
          {/* <Text fontSize={12} color="textSubtle" textAlign="right">
            {`~$${formatNumber(Number(competition.reward_amount) * Number(cbonPrice))}`}
          </Text> */}
        </Box>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center" mb='15px'>
        <Text fontSize="12px" color="textSubtle" mr="auto">
          {t('Type')}
        </Text>
        <Text fontWeight="bold" textAlign="right">
          <Text >{competition.competition_type === 'VOLUME' ? 'Trade' : 'Purchase'}</Text>
        </Text>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex justifyContent="flex-start" alignItems="center">
          <Text fontSize="12px" color="textSubtle" mr="auto" width='100%'>
            {competition.is_core
              ? (
                <Box>
                  <CheckmarkIcon mr='5px' mb='-5px' />
                  Core
                </Box>
              )
              : (
                <Box>
                  <ErrorIcon mr='5px' mb='-5px' />
                  Not Core
                </Box>
              )
            }
          </Text>
        </Flex>
        <Flex justifyContent="flex-end" alignItems="center">

          <Text fontSize="12px" color="textSubtle" ml="auto" width='100%'>
            {competition.is_verified
              ? (
                <Box>
                  <CheckmarkIcon mr='5px' mb='-5px' />
                  Verified
                </Box>
              )
              : (
                <Box>
                  <ErrorIcon mr='5px' mb='-5px' />
                  Not Verified
                </Box>
              )
            }
          </Text>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex justifyContent="flex-end" alignItems="center">
          <Text fontSize="12px" color="textSubtle" ml="auto" width='100%'>
            {competition.locked_lp
              ? (
                <Box>
                  <CheckmarkIcon mr='5px' mb='-5px' />
                  Locked Lp
                </Box>
              )
              : (
                <Box verticalAlign='center'>
                  <ErrorIcon mr='5px' mb='-5px'/>
                  No LP Locked
                </Box>
              )
            }
          </Text>
        </Flex>
      </Flex>
    </StyledMobileRow>
  )
}

export default MobileResult
