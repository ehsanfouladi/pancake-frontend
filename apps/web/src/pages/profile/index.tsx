import { useRouter } from 'next/router'
import { useEffect } from 'react'
// import { nftsBaseUrl } from 'views/Nft/market/constants'
import { useAccount } from 'wagmi'

const ProfilePage = () => {
  const { address: account } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (account) {
      router.push(`/profile/${account.toLowerCase()}`)
    } else {
      router.push('/create-profile')
    }
  }, [account, router])

  return null
}

export default ProfilePage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
