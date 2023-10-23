import { useRouter } from 'next/router'
import { useAchievementsForAddress, useProfileForAddress } from 'state/profile/hooks'
import { Achievement } from 'state/types'
import { NftProfileLayout } from 'views/Profile'
import Achievements from 'views/Profile/components/Achievements'

const NftProfileAchievementsPage = () => {
  const accountAddress = useRouter().query.accountAddress as string
  const { profile } = useProfileForAddress(accountAddress)
  // const { achievements, isFetching: isAchievementFetching, refresh } = useAchievementsForAddress(accountAddress)
const achievements : Achievement[] = [
  // {
//   id: '1',
//   type: 'teambattle',
//   address: '0xAAEe6c54A615180aE92a32259C737478FC62c237',
//   title: 'TranslatableText',
//   description: 'TranslatableText',
//   badge: 'string',
//   points: 23
// }

]
const isAchievementFetching = false
const refresh = ()=>{
  console.log('refresh')
}

  return (
    <Achievements
      achievements={achievements}
      isLoading={isAchievementFetching}
      points={profile?.points}
      onSuccess={refresh}
    />
  )
}

NftProfileAchievementsPage.Layout = NftProfileLayout

export default NftProfileAchievementsPage
// import { NotFound } from '@pancakeswap/uikit'

// const NotFoundPage = () => <NotFound />

// NotFoundPage.chains = []

// export default NotFoundPage
