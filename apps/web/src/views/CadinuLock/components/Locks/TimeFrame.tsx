import { Text } from '@pancakeswap/uikit'
import { toDate, format } from 'date-fns'
import { useTranslation } from '@pancakeswap/localization'

interface TimeFrameProps {
  startDate: number
  endDate: number
}

const getFormattedDate = (timestamp: number) => {
  const date = toDate(timestamp * 1000)
  return format(date, 'MMM do, yyyy HH:mm')
}

const TimeFrame: React.FC<React.PropsWithChildren<TimeFrameProps>> = ({ startDate, endDate }) => {
  const { t } = useTranslation()
  const textProps = {
    fontSize: '16px',
    color: 'textSubtle',
    ml: '8px',
  }

 
    return (<>
      <Text {...textProps}>{t('Locked From %date%', { date: getFormattedDate(startDate) })}</Text>
      <br />
      <Text {...textProps}>{t(' Until %date%', { date: getFormattedDate(endDate) })}</Text>
      </>
   )
    }
export default TimeFrame
