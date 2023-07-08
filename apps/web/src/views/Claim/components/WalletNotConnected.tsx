import { Flex, Text } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from '@pancakeswap/localization'

const WalletNotConnected: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  return (
    <Flex flexDirection="column" padding="16px">
      <Text m="16px 0" bold textAlign="center" color="#ffffff">
        {t('Wallet not connected')}
      </Text>
      <ConnectWalletButton />
    </Flex>
  )
}

export default WalletNotConnected
