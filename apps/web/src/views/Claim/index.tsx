import styled from 'styled-components'
import {useEffect, useState} from "react";
import BigNumber from "bignumber.js";
import {useContractRead} from "wagmi";
import {readContract} from "@wagmi/core";
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { Flex, PageSection } from '@pancakeswap/uikit'
import {CNY_TITLE_BG, GET_TICKETS_BG} from './pageSectionStyles'
import {PageMeta} from '../../components/Layout/Page'
import Hero from "./components/Hero";
import NextDrawCard from "./components/NextClaimCard";
import HowToClaim from "./components/HowToClaim";
import claimADAbi from "../../config/abi/claimAD.json";
import {getClaimAddress} from "../../utils/addressHelpers";
import {getClaimContract} from "../../utils/contractHelpers";

const ClaimPage = styled.div`
  max-height: calc(1100vh - 64px);`
const Claim = () => {
    const [disabled, setDisabled] = useState (false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenInPot, setTokenInPot] = useState(0);
    const claimAddress = getClaimAddress();
    const claimContract = getClaimContract(claimAddress);

  const {
    data: maxRewardAmount,
  } = useContractRead(
      {
      address: claimContract.address as `0x${string}`,
      abi: claimADAbi,
      functionName: 'maxRewardAmount',

  })
  const maxRewardBig = new BigNumber(maxRewardAmount?.toString())
  const maxReward = getBalanceNumber(maxRewardBig)
    if (maxReward === 0){
        setDisabled(true)
    }

     const getTokenInPot = async () => {
      const fetchedTokenInPot = await readContract({
          address: claimContract.address as `0x${string}`,
          abi: claimADAbi,
          functionName: 'tokenInPot',

      });
    const tokenInPotBig = new BigNumber(fetchedTokenInPot?.toString())
     const tokenInPotAsInt = getBalanceNumber(tokenInPotBig)
    setTokenInPot(tokenInPotAsInt);

    return fetchedTokenInPot;
  };

          const [totalRewardForAllUsers, setTotalRewardForAllUsers] = useState(0)
     const getTotalRewardForAllUsers = async () => {
      const fetchedTotalRewardForAllUsers = await readContract({
          address: claimContract.address as `0x${string}`,
          abi: claimADAbi,
          functionName: 'totalRewardForAllUsers',

      });
     const totalRewardForAllUsersBig = new BigNumber(fetchedTotalRewardForAllUsers?.toString())
     const totalRewardForAllUsersAsInt = getBalanceNumber(totalRewardForAllUsersBig)
    setTotalRewardForAllUsers(totalRewardForAllUsersAsInt);
    return fetchedTotalRewardForAllUsers;
  };
      const calculatedAvailableTokenForPrize = ()=>
      {
          return tokenInPot - totalRewardForAllUsers
      }
  useEffect(()=>{
      getTotalRewardForAllUsers().catch(console.error);
      getTokenInPot().catch(console.error);
      const AvailableTokenForPrize = calculatedAvailableTokenForPrize()
      if(tokenInPot>0 && totalRewardForAllUsers>0) {
          if (maxReward > AvailableTokenForPrize) {
              setDisabled(true)
          }
      }

  }, [isSuccess,tokenInPot,totalRewardForAllUsers])


    return (
        <>
          <PageMeta />
          <ClaimPage>
              <PageSection background={CNY_TITLE_BG} index={2}  clipFill={{ light: '#19A7CE' }}>
                  <Hero maxReward={maxReward} disabled={disabled} setDisabled={setDisabled} setIsSuccess={setIsSuccess} isSuccess={isSuccess} />
              </PageSection>
               <PageSection
              containerProps={{ style: { marginTop: '-30px' } }}
              background={GET_TICKETS_BG}
              concaveDivider
              // hasCurvedDivider
              clipFill={{ light: '#146C94' }}
              dividerPosition="bottom"
              index={1}
            >
              <Flex alignItems="center" justifyContent="center" flexDirection="column"  pt="24px">
                <NextDrawCard isSuccess={isSuccess} prizeAvailable={tokenInPot - totalRewardForAllUsers}/>
              </Flex>
            </PageSection>
              <PageSection index={3}>
                  <HowToClaim />
              </PageSection>
          </ClaimPage>
        </>
      )
    }
    export default Claim
