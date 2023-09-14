import { Box, Flex, InjectedModalProps, Modal, Button, Spinner } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import useTheme from 'hooks/useTheme'

import DetailsView from './CastVoteModal/DetailsView'

interface VoteDetailsModalProps extends InjectedModalProps {
  block: number
}

const VoteDetailsModal: React.FC<React.PropsWithChildren<VoteDetailsModalProps>> = ({ block, onDismiss }) => {
  const { t } = useTranslation()
  
  
  const { theme } = useTheme()

  const handleDismiss = () => {
    onDismiss()
  }

  return (
    <Modal title={t('Voting Power')} onDismiss={handleDismiss} headerBackground={theme.colors.gradientCardHeader}>
      <Box mb="24px" width={['100%', '100%', '100%', '320px']}>
          <Flex height="450px" alignItems="center" justifyContent="center">
            <Spinner size={80} />
          </Flex>
          <>
            <h2>
              {/* // cakeBalance={cakeBalance}
              // cakeVaultBalance={cakeVaultBalance}
              // cakePoolBalance={cakePoolBalance}
              // poolsBalance={poolsBalance}
              // ifoPoolBalance={ifoPoolBalance}
              // cakeBnbLpBalance={cakeBnbLpBalance}
              // lockedCakeBalance={lockedCakeBalance}
              // lockedEndTime={lockedEndTime}
              // block={block} */}
            </h2>
            <Button variant="secondary" onClick={onDismiss} width="100%" mt="16px">
              {t('Close')}
            </Button>
          </>
      </Box>
    </Modal>
  )
}

export default VoteDetailsModal
