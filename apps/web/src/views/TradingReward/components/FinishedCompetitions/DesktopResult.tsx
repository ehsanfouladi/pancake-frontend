import { Td, Text } from '@pancakeswap/uikit'
import { format } from 'date-fns'
import Link from 'next/link'
import { CompetitionIncentives } from './DesktopView'

interface DesktopResultProps {
  competition: CompetitionIncentives
}

const DesktopResult: React.FC<React.PropsWithChildren<DesktopResultProps>> = ({ competition }) => {
 
  return (
    <tr>
      <Td>
        <Link href={`trading-competition/top-traders/${competition._id}`}>
        <Text bold color="secondary">
          {`#${competition._id}`}
        </Text>
        </Link>
      </Td>
      <Td textAlign="left">
          <Text style={{ alignSelf: 'center' }}  >
            {format(new Date(Number(competition.startTime) * 1000), 'yyyy-MM-dd HH:mm')}
          </Text>
      </Td>
      <Td textAlign="left">
          <Text style={{ alignSelf: 'center' }} >
            {format(new Date(Number(competition.endTime) * 1000), 'yyyy-MM-dd HH:mm')}
          </Text>
      </Td>
      <Td textAlign="left">
        <Text >{competition.exchangeName}</Text>
      </Td>
      <Td textAlign="left">
        <Text >{`${competition.token0}/${competition.token1}`}</Text>
      </Td>
      <Td textAlign="left">
        <Text bold>{`${competition.rewardAmount} CBON`}</Text>
      </Td>
      {/* <Td textAlign="right">
        <Text bold>{`$${formatNumber(competition.rewardAmount)}`}</Text>
        <Text fontSize={12} color="textSubtle">
          {`~${formatNumber(cakeAmount)} CAKE`}
        </Text>
      </Td> */}
    </tr>
  )
}

export default DesktopResult
