import {useEffect, useMemo, useState} from 'react'
import claimADAbi from 'config/abi/claimAD.json';
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import {readContract} from "@wagmi/core";
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Heading,
  Text,
  Button,
  Balance,
} from '@pancakeswap/uikit'

import {useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction} from 'wagmi'
import { useTranslation } from '@pancakeswap/localization'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import {getClaimContract} from "../../../utils/contractHelpers";
import {getClaimAddress} from "../../../utils/addressHelpers";




const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-column-gap: 32px;
    grid-template-columns: auto 1fr;
  }
`

const StyledCard = styled(Card)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 520px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 756px;
  }
`

// const NextDrawWrapper = styled.div`
//   background: ${({ theme }) => theme.colors.background};
//   padding: 24px;
// `

const NextDrawCard = ({isSuccess}) => {
  const {
    t,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentLanguage: { locale },
  } = useTranslation()
  const { address: account } = useAccount()
  const claimAddress = getClaimAddress()
  const claimContract = getClaimContract(claimAddress)

  const [totalRewardClaimedByUsers , setTotalRewardClaimedByUsers] = useState(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  const getTotalRewardClaimedByUsers = async () => {
      const fetchedTotalRewardClaimedByUsers = await readContract({
          address: claimContract.address as `0x${string}`,
          abi: claimADAbi,
          functionName: 'totalClaimedByUsers',
      });

    const totalRewardClaimedByUsersBig = new BigNumber(fetchedTotalRewardClaimedByUsers?.toString())
    const totalRewardClaimedByUsersAsInt =getBalanceNumber(totalRewardClaimedByUsersBig);
    setTotalRewardClaimedByUsers(totalRewardClaimedByUsersAsInt);
    return fetchedTotalRewardClaimedByUsers;
  };

  const [totalRewardPaidToUsers , setTotalRewardPaidToUsers] = useState(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  const getTotalRewardPaidToUsers = async () => {
      const fetchedTotalRewardPaidToUsers = await readContract({
          address: claimContract.address as `0x${string}`,
          abi: claimADAbi,
          functionName: 'totalRewardForAllUsers',
      });
      const RewardPaidToUsersBig = new BigNumber(fetchedTotalRewardPaidToUsers?.toString());

      const RewardPaidToUsersAsInt =  getBalanceNumber(RewardPaidToUsersBig);
      setTotalRewardPaidToUsers(RewardPaidToUsersAsInt);
      return fetchedTotalRewardPaidToUsers;
  }
  const [totalClaim , setTotalClaim] = useState(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  const getTotalClaim = async () => {
     const fetchedTotalClaim = await readContract({
        address: claimContract.address as `0x${string}`,
        abi: claimADAbi,
        functionName: 'totalClaim',
        args: [account]
        });
     const totalClaimBig = new BigNumber(fetchedTotalClaim?.toString());
     const totalClaimAsInt = getBalanceNumber(totalClaimBig);
     setTotalClaim(totalClaimAsInt);
     return fetchedTotalClaim
     }

    const [availableReward , setAvailableReward] = useState(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getAvailableReward = async () => {
      const fetchedAvailableReward = await readContract({
          address: claimContract.address as `0x${string}`,
          abi: claimADAbi,
          functionName: 'availableReward',
          args: [account]
      })
      const availableRewardBig = new BigNumber(fetchedAvailableReward?.toString());
      const availableRewardAsInt = getBalanceNumber(availableRewardBig);
      setAvailableReward(availableRewardAsInt);
      return fetchedAvailableReward

  }

  const {config} = usePrepareContractWrite({
    address: claimContract.address as `0x${string}`,
    abi: claimADAbi,
    functionName: 'claim'}
    )
  const {
    data: claimData,
    isLoading: claimIsLoading,
    write: transferToWallet
    }
    = useContractWrite({
      ...config,
    })
  const { isSuccess:isSuccessClaim} = useWaitForTransaction({
    hash: claimData?.hash,
    })


useEffect(()=>{
        getTotalRewardClaimedByUsers().catch(console.error);
        getTotalRewardPaidToUsers().catch(console.error);

    if (account){
        getAvailableReward().catch(console.error);
        getTotalClaim().catch(console.error);
    }
},[
    isSuccessClaim,
    isSuccess,
    account,
    getAvailableReward,
    getTotalRewardClaimedByUsers,
    getTotalRewardPaidToUsers,
    getTotalClaim,
] )


  const totalRewardClaimedOrPaidToUsers = useMemo( ()=> {
          return (totalRewardClaimedByUsers + totalRewardPaidToUsers)
      },[totalRewardClaimedByUsers, totalRewardPaidToUsers]
)
  const getPrizeBalances = () => {
    return (
      <>
          <Balance
            fontSize="24px"
            color="secondary"
            textAlign={['center', null, null, 'left']}
            lineHeight="1"
            bold
            // prefix="~$"
            unit = " CADINU"
            value={totalRewardClaimedOrPaidToUsers && totalRewardClaimedOrPaidToUsers}
            decimals={0}
          />

      </>
    )
  }

  return (
    <StyledCard>
      <CardHeader p="16px 24px">
        <Flex justifyContent="space-between">
          <Heading mr="12px">{t('Claim Information')}</Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <Grid>
          <Flex justifyContent={['center', null, null, 'flex-start']} >
            <Heading>{t('Total CADINU Rewarded')}</Heading>
          </Flex>
          <Flex flexDirection="column" mb="18px">
            {getPrizeBalances()}
          </Flex>

          <Flex justifyContent={['center', null, null, 'flex-start']} >
            <Heading>{t('You Already Claimed')}</Heading>
          </Flex>
          <Flex flexDirection={['column', null, null, 'row']} alignItems={['center', null, null, 'flex-start']}>
              <Flex
                flexDirection="column"
                mr={[null, null, null, '24px']}
                alignItems={['center', null, null, 'flex-start']}
              >

                  <Flex justifyContent={['center', null, null, 'flex-start']} mb="16px">
                      <Balance value={totalClaim && totalClaim} decimals={0} display="inline" bold mx="4px" />
                    <Text display="inline"> CADINU </Text>
                  </Flex>

              </Flex>
          </Flex>
             <Flex justifyContent={['center', null, null, 'flex-start']} >
            <Heading>{t('You Can Claim')}</Heading>
             </Flex>
          <Flex flexDirection={['column', null, null, 'row']} alignItems={['center', null, null, 'flex-start']}>
              <Flex
                flexDirection="column"
                mr={[null, null, null, '24px']}
                alignItems={['center', null, null, 'flex-start']}
              >
                  <Flex justifyContent={['center', null, null, 'flex-start']} mb="16px">
                      <Balance value={availableReward && availableReward} decimals={0} display="inline" bold mx="4px" />
                    <Text display="inline"> CADINU </Text>


                  </Flex>
              </Flex>
          </Flex>
        </Grid>
              {account && (
        <div>

              <Flex
                  flexDirection={['column', null, null, "row-reverse"]}
                  alignItems={['center', 'center', 'center', 'flex-start']}
              >
                  <Flex
                flexDirection="row-reverse"
                mr={[null, null, null, "10px"]}
                mb={[null, null, null, "10px"]}


                alignItems={['center', 'center', 'center', 'flex-start']}
              >
                <Button  isLoading={claimIsLoading} onClick={()=>transferToWallet?.()}>{claimIsLoading ? "Check Wallet..." : "Claim Now"}</Button>
                  </Flex>
              </Flex>
</div> )}

      </CardBody>
      </StyledCard>
  )}

export default NextDrawCard
