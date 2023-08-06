import { Flex, Heading } from '@pancakeswap/uikit'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import Timer from '../Lottery/components/Countdown/Timer'

interface CountdownProps {
  nextEventTime: number
  preCountdownText?: string
  postCountdownText?: string
}

const Countdown: React.FC<React.PropsWithChildren<CountdownProps>> = ({
  nextEventTime,
  preCountdownText,
  postCountdownText,
}) => {
  const secondsRemaining = nextEventTime
  const { days, hours, minutes } = getTimePeriods(secondsRemaining)

  return (
    <>
      {secondsRemaining ? (
        <Flex display="inline-flex" justifyContent="center" verticalAlign="center" alignItems="flex-end">
          {preCountdownText && (
            <Heading fontSize="small" color="#000">
              {preCountdownText}
            </Heading>
          )}
          <Timer
            minutes={minutes + 1} // We don't show seconds - so values from 0 - 59s should be shown as 1 min
            hours={hours}
            days={days}
          />
          {postCountdownText && <Heading color="#ffff">{postCountdownText}</Heading>}
        </Flex>
      ) : (
        // <Skeleton height="41px" width="250px" />
        ' '
      )}
    </>
  )
}

export default Countdown
