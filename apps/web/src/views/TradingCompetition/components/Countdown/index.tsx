import { useTranslation } from '@pancakeswap/localization'
import { Flex, Skeleton, Text } from '@pancakeswap/uikit'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { LIVE } from 'config/constants/trading-competition/phases'
import useTheme from 'hooks/useTheme'
import { useMemo } from 'react'
import styled from 'styled-components'
import { CompetitionPhaseProps } from '../../types'
import { Heading2Text } from '../CompetitionHeadingText'
import Timer from './Timer'

const Wrapper = styled(Flex)`
  width: fit-content;
  height: fit-content;
  background: linear-gradient(180deg, #7645d9 0%, #452a7a 100%);
  border: 1px solid #7645d9;
  box-sizing: border-box;
  border-radius: 24px 24px 24px 24px;
  padding: 16px 18px;
  margin: -30px auto 50px;
  justify-content: space-around;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 16px 24px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    flex-direction: column;
    // margin: -38px 0 0 36px;
  }

  @media screen and (min-width: 1920px) {
    margin-top: -60px;
  }
`

const PocketWatchWrapper = styled(Flex)`
  align-items: center;
  justify-content: center;
  margin-right: 12px;

  svg {
    height: 48px;
    width: 48px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-right: 24px;

    svg {
      height: 64px;
      width: 64px;
    }
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    margin-bottom: 16px;
    margin-right: 0;
  }
`

const StyledHeading = styled(Heading2Text)`
  font-size: 24px;
  margin-right: 2px;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-right: 4px;
  }
`

const Countdown: React.FC<
  React.PropsWithChildren<{ currentPhase: CompetitionPhaseProps; hasCompetitionEnded: boolean }>
> = ({ currentPhase, hasCompetitionEnded }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const finishMs = Number(currentPhase.ends) *1000
  
  const currentMs = Date.now()
  console.log('finishMs',finishMs);
  console.log('currentMs',currentMs);
  const secondsUntilNextEvent = (finishMs - currentMs) / 1000 
  console.log('secondsUntilNextEvent',secondsUntilNextEvent);


  const { minutes, hours, days, months } = useMemo(()=> getTimePeriods(secondsUntilNextEvent),[secondsUntilNextEvent])
  console.log(minutes, hours, days);
  

  const renderTimer = () => {
    if (hasCompetitionEnded) {
      return (
        <StyledHeading background={theme.colors.gradientGold} $fill>
          {t('Finished')}!
        </StyledHeading>
      )
    }
    return (
      <Timer
        prefix={currentPhase.state === LIVE ? `${t('End')}:` : `${t('Start')}:`}
        minutes={minutes}
        hours={hours}
        days={days}
        months={months}
        HeadingTextComponent={({ children }) => (
          <StyledHeading background={theme.colors.gradientGold} $fill>
            {children}
          </StyledHeading>
        )}
        BodyTextComponent={({ children }) => (
          <Text bold color="#ffff" fontSize="16px" mr={{ _: '8px', sm: '16px' }}>
            {children}
          </Text>
        )}
      />
    )
  }

  return (
    <Wrapper>
      {/* <PocketWatchWrapper>
        <PocketWatchIcon />
      </PocketWatchWrapper> */}
      <Flex flexDirection="column" justifyContent="center">
        {!secondsUntilNextEvent ? (
          <Skeleton height={26} width={190} mb="24px" />
        ) : (
          <Flex  justifyContent="center" alignItems="center">
            {renderTimer()}
          </Flex>
        )}
        {/* {!secondsUntilNextEvent ? (
          <Skeleton height={42} width={190} />
        ) : (
          <ProgressStepper steps={CompetitionSteps} activeStepIndex={currentPhase.step.index} />
        )} */}
      </Flex>
    </Wrapper>
  )
}

export default Countdown
