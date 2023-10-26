import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import Page from 'components/Layout/Page'
import { useProfile } from 'state/profile/hooks'
import PageLoader from 'components/Loader/PageLoader'
import { useRouter } from 'next/router'
import Header from './Header'
import ProfileCreationProvider from './contexts/ProfileCreationProvider'
import Steps from './Steps'
import WalletNotConnected from './WalletNotConnected'

const ProfileCreation = () => {
  const { address: account } = useAccount()
  const { isInitialized, isLoading, hasProfile } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (account && hasProfile) {
      router.push(`/profile/${account}`)
    }
  }, [account, hasProfile, router])
  
  if (!account) {
    return(
      <ProfileCreationProvider>
        <Page>
          <Header />
          <WalletNotConnected />
        </Page>
      </ProfileCreationProvider>
      )
  }

  if (!isInitialized || isLoading) {
    return <PageLoader />
  }

  return (
    <>
      <ProfileCreationProvider>
        <Page>
          <Header />
          <Steps />
        </Page>
      </ProfileCreationProvider>
    </>
  )
}

export default ProfileCreation
