import { useTranslation } from '@pancakeswap/localization'
import { Button, Card, CardBody, CopyButton, Flex, Heading, Row, Skeleton, Text, useMatchBreakpoints, useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import { cadinuReferralAbi } from 'config/abi/cadinuReferral'
import  fromPairs  from 'lodash/fromPairs'
import { useRouter } from 'next/router'
import { usePriceCbonUSD } from 'state/farms/hooks'
import { useProfileForAddress } from 'state/profile/hooks'
import { Achievement } from 'state/types'
import styled from 'styled-components'
import { getCadinuReferralAddress } from 'utils/addressHelpers'
import { formatEther, getAddress } from 'viem'
import { NftProfileLayout } from 'views/Profile'
import AchievementCard from 'views/Profile/components/Achievements/AchievementCard'
import ClaimPointsCallout from 'views/Profile/components/Achievements/ClaimPointsCallout'
import { useAccount, useContractReads, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'


const Grid = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr;

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: repeat(2, 1fr);
  }
`

const SecondaryCard = styled(Text)`
  border: 2px solid ${({ theme }) => theme.colors.tertiary};
  border-radius: 16px;
`

SecondaryCard.defaultProps = {
  p: '24px',
}



const NftProfileAchievementsPage = () => {
  const {t} = useTranslation()
  const accountAddress = useRouter().query.accountAddress as string
  const { toastSuccess } = useToast()
  const{address:account} = useAccount()
  const { isMobile } = useMatchBreakpoints()
  const cbonPrice = usePriceCbonUSD()
  
  
  const { profile, refresh } = useProfileForAddress(accountAddress)
  // const { achievements, isFetching: isAchievementFetching, refresh } = useAchievementsForAddress(accountAddress)
  // const { achievements, isFetching: isAchievementFetching, refresh } = useAchievementsForAddress(accountAddress)
  
  const functions =[
    'getNftPoint',
    'getNumberOfReferredAddress',
    'referralData'
  ]
  // const nftDataKeys  = [
  //   'Number of Nfts', 'Number of Referral Nfts', 'Nft Points', 'Withdrawn Amount', 'Available Amount'
  // ]

  const {config} = usePrepareContractWrite({
    address: getCadinuReferralAddress(),
    abi: cadinuReferralAbi,
    functionName: 'withdrawReferralReward'
  })

  const {
    data: reciept, isLoading: withdrawLoading, isSuccess : withdrawSuccess, write: withdraw
  } = useContractWrite(config)

  const {data:final, isSuccess: isWithdrawSuccess} = useWaitForTransaction({
    hash: reciept?.hash,
    onSuccess: async (hash) => {
      refresh()
      toastSuccess(t('Amount Withdrew Successfully!'), <ToastDescriptionWithTx txHash={reciept?.hash.toString()} />)
    },
})

  const {data, isLoading, isSuccess} = useContractReads({
    contracts: functions.map(
      (f) =>
        ({
          abi: cadinuReferralAbi,
          address: getCadinuReferralAddress(),
          functionName: f,
          args: [accountAddress],
        } as const),
    ),
    watch: true,
  })

  const referralAchievements = Array.isArray(data)
  ? fromPairs(
    data
    .flat()
    .map((result, index) => [
      `${functions[index]}`,
      data[index].result
    ]),
    )
    : null  
    console.log('DATA', referralAchievements);

    const achievements : Achievement[] = [
      {
        id: '1',
        type: 'participation',
        address: accountAddress,
        title: 'Number Of Referred Addresses',
        description: 'Number of registered accounts with your referral.',
        badge: 'numberOfReferredAddresses.png',
        points: referralAchievements ? Number(referralAchievements.getNumberOfReferredAddress) : 0
      },
      {
        id: '2',
        type: 'participation',
        address: accountAddress,
        title: 'Number Of Nfts',
        description: "Number of Cadinu Identity Arts' NFTs you own.",
        badge: 'numberOfNFTs.png',
        points: referralAchievements ? Number(referralAchievements.referralData[0]) : 0
      },
      {
        id: '3',
        type: 'ifo',
        address: accountAddress,
        title: 'Number of Referral Nfts',
        description: 'Number of Nfts your referred accounts own.',
        badge: 'numberOfReferredNFTs.png',
        points: referralAchievements ? Number(referralAchievements.referralData[1]) : 0
      },
      {
        id: '4',
        type: 'participation',
        address: accountAddress,
        title: 'Nft Points',
        description: "Purchasing Cadinu Identity Arts' Nfts gives you points.",
        badge: 'nftPoints.png',
        points: referralAchievements ? Number(referralAchievements.referralData[2]) : 0
      },
      // {
      //   id: '5',
      //   type: 'participation',
      //   address: accountAddress,
      //   title: 'Number Of Referred Addresses',
      //   description: 'Number of accounts that have registered with your address as their referral',
      //   badge: 'baller.svg',
      //   points: referralAchievements ? Number(referralAchievements.getNumberOfReferredAddress) : 0
      // },
      // {
      //   id: '6',
      //   type: 'participation',
      //   address: accountAddress,
      //   title: 'Number Of Referred Addresses',
      //   description: 'Number of accounts that have registered with your address as their referral',
      //   badge: 'baller.svg',
      //   points: referralAchievements ? Number(referralAchievements.getNumberOfReferredAddress) : 0
      // },
    
    ]
  
    const ReferralStatusCard = (onSuccess)=>{
      return(
        <Card>
        <CardBody>
          {/* <IconStatBox icon={PrizeIcon} title={profile ? profile.points : '-'} subtitle={t('Points')} /> */}
          <Flex alignItems="start" flexDirection={isMobile ? 'column' :'row'} width='100%' >
          <SecondaryCard  mb="24px" width='100%' mx='5px'>
            {/* <Icon width="44px" mr="24px" color='crrentColor'} /> */}
            <div style={{paddingBottom : "11px"}}>
              <Heading as="h4" scale="md" color= 'text'>
                Withdrawn Amount
              </Heading>
              <Text textTransform="uppercase" color= 'textSubtle' fontSize="18px" mt='10px' bold>
                { referralAchievements ? 
                `${formatEther(referralAchievements?.referralData[3])}
                CBON ~
                ${(Number(formatEther(referralAchievements?.referralData[3]))* Number(cbonPrice)).toLocaleString('en', { maximumFractionDigits: 10 })}  USD`
                : '-'}
              </Text>
            </div>
            {/* <Icon width="44px" mr="24px" color='crrentColor'} /> */}
          </SecondaryCard>
            <SecondaryCard  mb="24px" width='100%' mx='5px'>
            
            <Row>
              <Heading as="h4" scale="md" color= 'text'>
                Available Amount
              </Heading>
              </Row>
              <Flex flexDirection='row'  flexWrap='wrap' justifyContent='space-between'>
              <Text textTransform="uppercase" color= 'textSubtle' fontSize="18px" mt='10px' bold>
              {referralAchievements ?
                `${formatEther(referralAchievements?.referralData[4])}
                CBON ~
                ${(Number(formatEther(referralAchievements?.referralData[4]))* Number(cbonPrice)).toLocaleString('en', { maximumFractionDigits: 10 })}  USD`
               :'-' }
              </Text>
              <Button
                isLoading={withdrawLoading}
                onClick={()=> withdraw?.()}
                disabled={!withdraw || referralAchievements?.referralData[4] === 0n}
                style={{float:'right'}}
              >
                Withdraw 
              </Button>
              </Flex>
    </SecondaryCard>
      </Flex>
          <Heading as="h4" scale="md" mb="16px">
            {t('Referral Status')}
          </Heading>
          <ClaimPointsCallout onSuccess={onSuccess} />
          <AchievementsList />
        </CardBody>
      </Card>
      )
    }

    const AchievementsList = () => {
    
      if (isLoading) {
        if (isMobile) {
          return <Skeleton width="100%" height="64px" />
        }
        return <Skeleton width="540px" height="64px" />
      }
    
      return (
        <>
          <Grid>
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </Grid>
          {achievements.length === 0 && (
            <Flex alignItems="center" justifyContent="center" style={{ height: '64px' }}>
              <Heading as="h5" scale="md" color="textDisabled">
                {t('No achievements yet!')}
              </Heading>
            </Flex>
          )}
        </>
      )
    }
  return (
    <>
    {ReferralStatusCard(refresh)}
    {account === getAddress(accountAddress) && 
    <Card mt='15px'>
      <CardBody>
        <Heading>
        Your Referral Link: 
        </Heading>
        <Flex verticalAlign='center' m='20px'>
          <Text color='secondary'>
            {`https://apps.cadinu.io/create-profile?ref=${account}`}
          </Text>
          <CopyButton 
            text={`https://apps.cadinu.io/create-profile?ref=${account}`}
            tooltipMessage='Link coppied to clipboard'
            width ={20}
            color='secondary'          
            />
        </Flex>
      </CardBody>
    </Card>
}
    </>
    // <Achievements
    //   achievements={achievements}
    //   isLoading={isAchievementFetching}
    //   points={profile?.points}
    //   onSuccess={refresh}
    // />
  )
}

NftProfileAchievementsPage.Layout = NftProfileLayout

export default NftProfileAchievementsPage
