import { useTranslation } from '@pancakeswap/localization'
import { useContext } from 'react'
import { useAccount } from 'wagmi'
import Mint from './Mint'
import ProfilePicture from './ProfilePicture'
import UserName from './UserName'
import WalletNotConnected from './WalletNotConnected'
import { ProfileCreationContext } from './contexts/ProfileCreationProvider'

const Steps = () => {
  const { t } = useTranslation()
  const { isInitialized, currentStep } = useContext(ProfileCreationContext)
  const { address: account } = useAccount()

  if (!account) {
    return <WalletNotConnected />
  }

  if (!isInitialized) {
    return <div>{t('Loading...')}</div>
  }

  if (currentStep === 0) {
    return <Mint />
  }

  if (currentStep === 1) {
    return <ProfilePicture />
  }


  if (currentStep === 2) {
    return <UserName />
  }

  return null
}

export default Steps
