import {useEffect, useMemo, useState} from "react";
import {readContract} from "@wagmi/core";
import {floor} from "lodash";
import styled, { keyframes } from 'styled-components'
import {useAccount, useContractRead, useContractWrite, usePrepareContractWrite} from "wagmi";
import { Box, Flex, Heading, Skeleton, Balance } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { useTranslation } from '@pancakeswap/localization'
import BigNumber from 'bignumber.js'
import { TicketPurchaseCard } from '../svgs'
import BuyTicketsButton from './BuyTicketsButton'
import claimADAbi from "../../../config/abi/claimAD.json";
import {getClaimAddress} from "../../../utils/addressHelpers";
import {getClaimContract} from "../../../utils/contractHelpers";
import WalletNotConnected from "./WalletNotConnected";
import useGetNextClaimEvent from "../hooks/useGetNextClaimEvent";
import {ClaimStatus} from "../../../config/constants/types";
import Countdown from "../../Lottery/components/Countdown";
import NextDrawCard from "../../Lottery/components/NextDrawCard";


export const floatingStarsLeft = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(10px, 10px);
  }
  to {
    transform: translate(0, -0px);
  }
`

export const floatingStarsRight = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-10px, 10px);
  }
  to {
    transform: translate(0, -0px);
  }
`

const floatingTicketLeft = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-10px, 15px);
  }
  to {
    transform: translate(0, -0px);
  }
`

const floatingTicketRight = keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(10px, 15px);
  }
  to {
    transform: translate(0, -0px);
  }
`

const mainTicketAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(6deg);
  }
  to {
    transform: rotate(0deg);
  }
`

const TicketContainer = styled(Flex)`
  animation: ${mainTicketAnimation} 3s ease-in-out infinite;
`

const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradientGold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const StyledBuyTicketButton = styled(BuyTicketsButton)<{ disabled: boolean }>`
  background: ${({ theme, disabled, contract, contractAddress, setIsSuccess}) =>
    disabled ? theme.colors.disabled : 'linear-gradient(180deg, #7645d9 0%, #452a7a 100%)'};
  width: 200px;
  ${({ theme }) => theme.mediaQueries.xs} {
    width: 240px;
  }
`

const ButtonWrapper = styled.div`
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-4deg);
`

const TicketSvgWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-4deg);
`

const Decorations = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: url(/images/decorations/bg-star.svg);
  background-repeat: no-repeat;
  background-position: center 0;
`

const StarsDecorations = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;

  & img {
    position: absolute;
  }

  & :nth-child(1) {
    animation: ${floatingStarsLeft} 3s ease-in-out infinite;
    animation-delay: 0.25s;
  }
  & :nth-child(2) {
    animation: ${floatingStarsLeft} 3.5s ease-in-out infinite;
    animation-delay: 0.5s;
  }
  & :nth-child(3) {
    animation: ${floatingStarsRight} 4s ease-in-out infinite;
    animation-delay: 0.75s;
  }
  & :nth-child(4) {
    animation: ${floatingTicketLeft} 6s ease-in-out infinite;
    animation-delay: 0.2s;
  }
  & :nth-child(5) {
    animation: ${floatingTicketRight} 6s ease-in-out infinite;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & :nth-child(1) {
      left: 3%;
      top: 42%;
    }
    & :nth-child(2) {
      left: 9%;
      top: 23%;
    }
    & :nth-child(3) {
      right: 2%;
      top: 24%;
    }
    & :nth-child(4) {
      left: 8%;
      top: 67%;
    }
    & :nth-child(5) {
      right: 8%;
      top: 67%;
    }
  }

  ${({ theme }) => theme.mediaQueries.md} {
    & :nth-child(1) {
      left: 10%;
      top: 42%;
    }
    & :nth-child(2) {
      left: 17%;
      top: 23%;
    }
    & :nth-child(3) {
      right: 10%;
      top: 24%;
    }
    & :nth-child(4) {
      left: 17%;
      top: 67%;
    }
    & :nth-child(5) {
      right: 17%;
      top: 67%;
    }
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    & :nth-child(1) {
      left: 19%;
      top: 42%;
    }
    & :nth-child(2) {
      left: 25%;
      top: 23%;
    }
    & :nth-child(3) {
      right: 19%;
      top: 24%;
    }
    & :nth-child(4) {
      left: 24%;
      top: 67%;
    }
    & :nth-child(5) {
      right: 24%;
      top: 67%;
    }
  }
`

const CnyDecorations = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;

  & :nth-child(1),
  & :nth-child(2) {
    display: none;
    z-index: 1;
  }

  & :nth-child(1) {
    position: absolute;
    top: 0;
    left: 15%;
    animation: ${floatingStarsLeft} 3s ease-in-out infinite;
    animation-delay: 0.25s;
  }

  & :nth-child(2) {
    position: absolute;
    bottom: 0;
    right: 15%;
    animation: ${floatingStarsLeft} 3.5s ease-in-out infinite;
    animation-delay: 0.5s;
  }

  & :nth-child(3) {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 0;
    transform: translate(-50%, -50%);
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    & :nth-child(1),
    & :nth-child(2),
    & :nth-child(3) {
      display: block;
    }
  }
`

const Hero = ({disabled , setDisabled, setIsSuccess , isSuccess}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const claimAddress = getClaimAddress()
  const claimContract = getClaimContract(claimAddress)



  const {
    data: maxRewardAmount,
    isError:maxRewardAmountIsError,
    isLoading:maxRewardAmountIsLoading
  } = useContractRead(
      {
      address: claimContract.address as `0x${string}`,
      abi: claimADAbi,
      functionName: 'maxRewardAmount',
          onSuccess(){
              console.log(maxRewardAmount.toString())
              console.log(typeof(maxRewardAmount))

          },
      onError(error) {
      console.log('Error', error)
    },
  })
  const maxRewardBig = new BigNumber(maxRewardAmount?.toString())
  const maxReward = getBalanceNumber(maxRewardBig)

  const {
      data:lastRewardTime,
      isSuccess:lastRewardTimeIsSuccess,
      isLoading: lastRewardTimeIsLoading
  } = useContractRead({
            address: claimContract.address as `0x${string}`,
            abi: claimADAbi,
            functionName:"lastRewardTime",
            args:[account]
        }
    )
  const lastRewardTimeAsInt = useMemo(
        ()=> {
            return parseInt(
                lastRewardTime && lastRewardTime.toString(),
                10)
        },
        [lastRewardTime,lastRewardTimeIsSuccess, isSuccess])

  const {
      data:timeBetweenEachClaim,
      isSuccess:timeBetweenEachClaimIsSuccess
  } = useContractRead({
            address: claimContract.address as `0x${string}`,
            abi: claimADAbi,
            functionName:"timeBetweenEachClaim",

        }
    )
  const timeBetweenEachClaimAsInt = useMemo(
         ()=> parseInt(
             timeBetweenEachClaim && timeBetweenEachClaim.toString(),
            10),
        [timeBetweenEachClaim])


  const {
        nextEventTime,
        postCountdownText,
        preCountdownText
    } = useGetNextClaimEvent(lastRewardTimeAsInt, ClaimStatus.OPEN, timeBetweenEachClaimAsInt)

  const [isClaimAvailable, setIsClaimAvailable] = useState(true)

  useEffect(()=>{
      if (
          !lastRewardTimeIsLoading && lastRewardTimeIsSuccess &&
          floor(Date.now()/1000) < lastRewardTimeAsInt + timeBetweenEachClaimAsInt
      ){
          setIsClaimAvailable(false)
          setDisabled(true)
          setTimeout(()=>{
          setIsClaimAvailable(true)
          setDisabled(false)},
              ((lastRewardTimeAsInt + timeBetweenEachClaimAsInt) - floor(Date.now()/1000))*1000
              )
      }
      if (isSuccess) {
          setIsClaimAvailable(false)
          setDisabled(true)
          // setIsSuccess(false)
          setTimeout(() => {
              setIsClaimAvailable(true)
              setDisabled(false)
              }, (timeBetweenEachClaimAsInt * 1000)
          )
      }
      console.log("checkiiiidee")

  },[isSuccess, timeBetweenEachClaimAsInt, lastRewardTimeAsInt, lastRewardTimeIsLoading, lastRewardTimeIsSuccess])


  const getHeroHeading = () => {
      return (
        <>

            {lastRewardTimeIsSuccess && (
                <>
            <Flex alignItems="center" justifyContent="center" flexDirection="column" pt="24px">
                 <Flex alignItems="center" justifyContent="center" mb="48px" pt="24px">
                     {!isClaimAvailable ?(
                      <Countdown
                        nextEventTime={nextEventTime}
                        postCountdownText={postCountdownText}
                        preCountdownText=""
                     /> ) : (
                         <Heading scale="xl" color="#ffffff" mb="24px" textAlign="center">
                             Get Free CADINU Now!
                         </Heading>
                         )
                     }
                </Flex>
                  {/* <Heading scale="xl" color="#ffffff" mb="24px" textAlign="center"> */}
                  {/*  {t('Get Free CADINU!')} */}
                  {/* </Heading> */}

              </Flex>
            <Heading mb="32px" scale="lg" color="#ffffff" textAlign="center">
            {t('win up to')}
            </Heading>

          {maxRewardAmount ? (

              <PrizeTotalBalance fontSize="64px" bold unit=' CADINU' value={maxReward} mb="8px" decimals={0} />
          ) : (
               <Skeleton my="7px" height={60} width={190} />
          )}
 </>
            )}
        </>
      )

    return (
      <Heading mb="24px" scale="xl" color="#ffffff">
        {t('Tickets on sale soon')}
      </Heading>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      {/* <CnyDecorations> */}
      {/*  <img src="/images/cny-asset/cny-lantern-1.png" width="200px" height="280px" alt="" /> */}
      {/*  <img src="/images/cny-asset/cny-lantern-2.png" width="184px" height="210px" alt="" /> */}
      {/*  <img src="/images/cny-asset/cny-frame.png" width="900px" height="400px" alt="" /> */}
      {/* </CnyDecorations> */}
      <Decorations />
      <StarsDecorations display={['none', 'none', 'block']}>
        <img src="/images/lottery/star-big.png" width="124px" height="109px" alt="" />
        <img src="/images/lottery/star-small.png" width="70px" height="62px" alt="" />
        <img src="/images/lottery/three-stars.png" width="130px" height="144px" alt="" />
        <img src="/images/lottery/cadinu_ticket_3.svg" width="123px" height="83px" alt="" />
        <img src="/images/lottery/cadinu_ticket_4.svg" width="121px" height="72px" alt="" />
      </StarsDecorations>
      <Heading style={{ zIndex: 1 }} mb="8px" scale="md" color="#ffffff" id="lottery-hero-title">
        {t('The Cadinu Claim Airdrop')}
      </Heading>
      {getHeroHeading()}
        {!account ?
            (<WalletNotConnected />)
            :(
      <TicketContainer
        position="relative"
        width={['240px', '288px']}
        height={['94px', '113px']}
        alignItems="center"
        justifyContent="center"
      >
        <ButtonWrapper>
          <StyledBuyTicketButton
              disabled = {disabled}
              themeMode="light"
              setIsSuccess= {(p)=>setIsSuccess(p)}
              contract={claimContract}
              contractAddress={claimAddress}

          />
        </ButtonWrapper>
        <TicketSvgWrapper>
          <TicketPurchaseCard width="100%" />
        </TicketSvgWrapper>
      </TicketContainer>)}
    </Flex>
  )
}

export default Hero
