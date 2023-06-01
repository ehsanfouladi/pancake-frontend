import {useEffect, useMemo, useState} from 'react'
import {useRouter} from "next/navigation";
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
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
  Skeleton,
  Button,
  useModal,
  Box,
  CardFooter,
  ExpandableLabel,
  Balance,
} from '@pancakeswap/uikit'
import {useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction} from 'wagmi'
import { LotteryStatus } from 'config/constants/types'

import { useTranslation } from '@pancakeswap/localization'
import {CADINU} from '@pancakeswap/tokens'
import { useLottery } from 'state/lottery/hooks'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import ViewTicketsModal from './ViewTicketsModal'
import BuyTicketsButton from './BuyTicketsButton'
import { dateTimeOptions } from '../helpers'
import RewardBrackets from './RewardBrackets'
import useBUSDPrice from "../../../hooks/useBUSDPrice"
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

const NextDrawWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
`

const NextDrawCard = ({isSuccess}) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const { address: account } = useAccount()
  const claimAddress = getClaimAddress()
  const claimContract = getClaimContract(claimAddress)

  //
  //
  //
  //
  // const [totalRewardClaimedOrPaidToUsers, setRewardClaimedOrPaidToUsers] = useState(null)
// const {data:fetchedTotalRewardClaimedByUsers, isSuccess:totlaClaimedIsSuccess} = useContractRead({
//         address: claimContract.address as `0x${string}`,
//         abi: claimADAbi,
//         functionName:"totalClaimedByUsers",
//         onSuccess: (()=>{
//           if(fetchedTotalRewardClaimedByUsers){
//           console.log("totalRewardClaimedByUsers", fetchedTotalRewardClaimedByUsers)
//         }})}
//   );

  const [totalRewardClaimedByUsers , setTotalRewardClaimedByUsers] = useState(null);
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

  // const {data:fetchedTotalRewardPaidToUsers, isSuccess:totlaPaidIsSuccess} = useContractRead({
  //       address: claimContract.address as `0x${string}`,
  //       abi: claimADAbi,
  //       functionName:"totalRewardForAllUsers",
  //    onSuccess: (()=>{
  //         if(fetchedTotalRewardPaidToUsers){
  //         console.log("totalRewardPaidToUsers", fetchedTotalRewardPaidToUsers)
  //       }})
  // }
  // );
  const [totalRewardPaidToUsers , setTotalRewardPaidToUsers] = useState(null);
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
// const {data:fetchedTotalClaim, isSuccess:fetchedTotalClaimIsSuccess} = useContractRead({
//         address: claimContract.address as `0x${string}`,
//         abi: claimADAbi,
//         functionName:"totalClaim",
//         args:[account]
//       }
//      );
  const [totalClaim , setTotalClaim] = useState(null);
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
    //
    // const totalClaim =

  // const {data:fetchedAvailableReward, isSuccess:fetchedAvailableRewardIsSuccess} = useContractRead(
  //         {
  //       address: claimContract.address as `0x${string}`,
  //       abi: claimADAbi,
  //       functionName:"availableReward",
  //       args:[account],
  //       staleTime: 2,
  //       structuralSharing:false,
  //       onSettled(data){
  //                 console.log("CHECKK ZAMAN")
  //             }
  //     }
  //    )

    const [availableReward , setAvailableReward] = useState(null)
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




  const {config, error: prepareClaimError, status} = usePrepareContractWrite({
    address: claimContract.address as `0x${string}`,
    abi: claimADAbi,
    functionName: 'claim',
    onError(error) {
        console.log('PrepareErrors', error)
    },
    })
  const {
    data: claimData,
    isLoading: claimIsLoading,
    isSuccess: claimIsSuccess,
    error:claimError,
    write: transferToWallet
    }
    = useContractWrite({
      ...config,
    })
  const {isLoading, isSuccess:isSuccessClaim} = useWaitForTransaction({
    hash: claimData?.hash,
    })

  // useEffect(  ()=> {
  //     if (account) {
  //         if (!availableReward) {
  //             getAvailableReward()
  //         }
  //         if (!totalClaim) {
  //             getTotalClaim()
  //         }
  //         if (!totalRewardClaimedByUsers) {
  //             getTotalRewardClaimedByUsers()
  //         }
  //         if (!totalRewardPaidToUsers) {
  //             getTotalRewardPaidToUsers()
  //         }
  //     }
  //       }, []
  //
  //   )


useEffect(()=>{
        getTotalRewardClaimedByUsers();
        getTotalRewardPaidToUsers();
    if (account){
        getAvailableReward();

        getTotalClaim();

    }
},[isSuccessClaim, isSuccess, account] )








  const totalRewardClaimedOrPaidToUsers = useMemo( ()=> {
          return (totalRewardClaimedByUsers + totalRewardPaidToUsers)
      },[totalRewardClaimedByUsers, totalRewardPaidToUsers]
)
  // console.log("RewardClaimedOrPaidToUsers", totalRewardClaimedOrPaidToUsers)

  // const price = useBUSDPrice(CADINU[ChainId.BSC])
  // const cakePriceBusd = useMemo(() => (price ? new BigNumber(price.toSignificant(6)) : BIG_ZERO), [price])


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
