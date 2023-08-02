import { Flex, BuyCbon } from '@pancakeswap/uikit'
import { ReactElement, memo } from 'react'

interface Props {
  title: string | ReactElement
  subtitle: string
  noConfig?: boolean
  setIsChartDisplayed?: React.Dispatch<React.SetStateAction<boolean>>
  isChartDisplayed?: boolean
  hasAmount: boolean
  onRefreshPrice: () => void
}

const InputHeader: React.FC<React.PropsWithChildren<Props>> = memo(({ subtitle, title }) => {
  const titleContent = (
    <Flex width="100%" alignItems="center" justifyContent="space-between" flexDirection="column">
      <Flex flexDirection="column" alignItems="flex-start" width="100%" marginBottom={15}>
        <BuyCbon.InputHeaderTitle>{title}</BuyCbon.InputHeaderTitle>
      </Flex>
      <Flex justifyContent="start" width="100%" height="17px" alignItems="center" mb="14px">
        <BuyCbon.InputHeaderSubTitle>{subtitle}</BuyCbon.InputHeaderSubTitle>
      </Flex>
    </Flex>
  )

  return <BuyCbon.InputHeader title={titleContent} subtitle={<></>} />
})

export default InputHeader
