import { useTranslation } from '@pancakeswap/localization'
import { CheckmarkCircleIcon, ErrorIcon, Flex, RocketIcon, Td, Text, TimerIcon, useTooltip } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import Link from 'next/link'
import { useMemo } from 'react'
import { useChainNameByQuery } from 'state/info/hooks'
import styled from 'styled-components'
import { CurrencyLogo } from 'views/Info/components/CurrencyLogo'
import { Competition } from '../types'

interface DesktopResultProps {
  competition: Competition
}

interface EndTimeTooltipComponentProps {
  endTime: number;
}



const DesktopResult: React.FC<React.PropsWithChildren<DesktopResultProps>> = ({ competition }) => {
  const ResponsiveLogo = styled(CurrencyLogo)`
  @media screen and (max-width: 670px) {
    width: 16px;
    height: 16px;
  }
`
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation();
  const chainName = useChainNameByQuery()

  const EndTimeTooltipComponent: React.FC<React.PropsWithChildren<EndTimeTooltipComponentProps>> = ({
    endTime,
  }) => {

    return (
      <>
        <Text bold>Time:</Text>
        <Text>
          {new Date(endTime * 1000).toLocaleString(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </Text>
      </>
    );
  }


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

    const {
      targetRef: endTimeTargetRef,
      tooltip: endTimeTooltip,
      tooltipVisible: endTimeTooltipVisible,
    } = useTooltip(<EndTimeTooltipComponent endTime={timestamp} />, {
      placement: "top",
    });
    return (
      <Flex alignItems="center">
        <span ref={endTimeTargetRef}>
          <TimerIcon ml="4px" color="primary" />
          {endTimeTooltipVisible && endTimeTooltip}
        </span>
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
  return (
    <tr>
      <Td>
        <Link href={`trading-competition-v2/top-traders/${competition._id}`}>
          <Text bold color="secondary">
            {`#${competition._id}`}
          </Text>
        </Link>
      </Td>
      <Td textAlign="left">
        <Link href={`trading-competition-v2/projects/${competition.project.token}`}>
        <Flex alignItems="center">
          <ResponsiveLogo size="24px" address={competition.project.token.toLocaleLowerCase()} chainName={chainName} />
          <Flex marginLeft="10px">
            <Text >{competition.project.token_symbol}</Text>
          </Flex>
        </Flex>
            <Text fontSize={12} color="textSubtle">{competition.project.name.slice(0, 18)}</Text>
        </Link>
      </Td>
      <Td textAlign="center">
        <TimeCountdownDisplay timestamp={Number(competition.start_time)} />
        {/* {format(new Date(Number(competition.start_time) * 1000), 'yyyy-MM-dd HH:mm')} */}
      </Td>
      <Td textAlign="center">
        <TimeCountdownDisplay timestamp={Number(competition.end_time)} />
      </Td>

      <Td textAlign="left">
        <Text >{competition.competition_type === 'VOLUME' ? 'Trade' : 'Purchase'}</Text>
      </Td>
      <Td textAlign="left" fontSize=''>
        <Text >{`${competition.token_0}/${competition.token_1}`}</Text>
      </Td>
      {/* <Td textAlign="left">
        <Text bold>{`${competition.rewardAmount} CBON`}</Text>
      </Td> */}
      <Td textAlign="center">
        {competition.is_core ? <CheckmarkCircleIcon /> : <ErrorIcon />}
      </Td>
      <Td textAlign="center">
        {competition.is_verified ? <CheckmarkCircleIcon /> : <ErrorIcon />}
      </Td>
      <Td textAlign="center">
        {competition.is_boosted ? <RocketIcon /> : <ErrorIcon />}
      </Td>
      <Td textAlign="left">
        <Text bold>{`${formatNumber(Number(competition.reward_amount), 0, 0)} ${competition.reward_token_symbol}`}</Text>
      </Td>
    </tr>
  )
}

export default DesktopResult
