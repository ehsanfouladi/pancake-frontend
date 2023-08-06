import { useEffect, useState } from 'react'
import { createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'

import styled, { keyframes } from 'styled-components'
import { useAccount } from 'wagmi'
import { Box, Flex, Heading, Skeleton, Balance } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { TicketPurchaseCard } from '../svgs'
import BuyTicketsButton from './BuyTicketsButton'
import { claimADAbi } from '../../../config/abi/claimAD'
import { getClaimAddress } from '../../../utils/addressHelpers'
import { getClaimContract } from '../../../utils/contractHelpers'
import WalletNotConnected from './WalletNotConnected'
import Countdown from '../../Lottery/components/Countdown'

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
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : 'linear-gradient(180deg, #7645d9 0%, #452a7a 100%)'};
  width: 200px;
  ${({ theme }) => theme.mediaQueries.xs} {
    width: 200px;
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
const client = createPublicClient({
  chain: bsc,
  transport: http(),
})

const Hero = ({ disabled, setDisabled, setIsSuccess, isSuccess, maxReward }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const claimAddress = getClaimAddress()
  const claimContract = getClaimContract()

  const [lastRewardTime, setLastRewardTime] = useState(0)
  const getlastRewardTime = async () => {
    const fetchedlastRewardTime = await client.readContract({
      address: claimContract.address as `0x${string}`,
      abi: claimADAbi,
      functionName: 'lastRewardTime',
      args: [account],
    })
    const lastRewardTimeAsInt = parseInt(fetchedlastRewardTime && fetchedlastRewardTime?.toString(), 10)
    setLastRewardTime(lastRewardTimeAsInt)
    return fetchedlastRewardTime
  }

  const [timeBetweenEachClaim, setTimeBetweenEachClaim] = useState(0)
  const getTimeBetweenEachClaim = async () => {
    const fetchedTimeBetweenEachClaim = await client.readContract({
      address: claimContract.address as `0x${string}`,
      abi: claimADAbi,
      functionName: 'timeBetweenEachClaim',
    })
    const timeBetweenEachClaimAsInt = parseInt(
      fetchedTimeBetweenEachClaim && fetchedTimeBetweenEachClaim?.toString(),
      10,
    )
    setTimeBetweenEachClaim(timeBetweenEachClaimAsInt)
    return fetchedTimeBetweenEachClaim
  }

  const postCountdownText = 'until next reward.'
  const [nextEventTime, setNextEventTime] = useState(0)
  const nextEventTimeCalc = (lastRewardTimeAsEntry, timeBetweenEachClaimAsEntry) => {
    const calc = lastRewardTimeAsEntry + timeBetweenEachClaimAsEntry
    return calc
  }

  const [isClaimAvailable, setIsClaimAvailable] = useState(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getTimeBetweenEachClaim().catch(console.error)
    getlastRewardTime().catch(console.error)
    const nextEventTimeCalculated = nextEventTimeCalc(lastRewardTime, timeBetweenEachClaim)
    setNextEventTime(nextEventTimeCalculated)
    if (lastRewardTime > 0 && Math.floor(Date.now() / 1000) < nextEventTimeCalculated) {
      setIsClaimAvailable(false)
      setDisabled(true)
      setTimeout(() => {
        setIsClaimAvailable(true)
        setDisabled(false)
      }, (nextEventTimeCalculated - Math.floor(Date.now() / 1000)) * 1000)
    }
    if (lastRewardTime === 0) {
      setIsClaimAvailable(true)
      setDisabled(false)
    }
  }, [isSuccess, lastRewardTime, timeBetweenEachClaim, Date.now()])

  const getHeroHeading = () => {
    return (
      <>
        <Flex alignItems="center" justifyContent="center" flexDirection="column">
          <Flex alignItems="center" justifyContent="center" mb="1px">
            {!isClaimAvailable && account && lastRewardTime > 0 ? (
              <div>
                <Heading style={{ zIndex: 1 }} mb="8px" scale="md" color="#ffffff" id="lottery-hero-title">
                  {t('The Cadinu Claim Airdrop')}
                </Heading>
                <Countdown nextEventTime={nextEventTime} postCountdownText={postCountdownText} preCountdownText="" />{' '}
              </div>
            ) : (
              <Heading scale="xl" color="#ffffff" mb="28px" textAlign="center">
                Get Free CADINU Now!
              </Heading>
            )}
          </Flex>
          {/* <Heading scale="xl" color="#ffffff" mb="24px" textAlign="center"> */}
          {/*  {t('Get Free CADINU!')} */}
          {/* </Heading> */}
        </Flex>
        {isClaimAvailable && (
          <Heading mb="16px" scale="lg" color="#ffffff" textAlign="center">
            {t('win up to')}
          </Heading>
        )}

        {maxReward ? (
          <PrizeTotalBalance
            fontSize="48px"
            bold
            unit=" CADINU"
            value={maxReward}
            mb="4px"
            decimals={0}
            textAlign="center"
          />
        ) : (
          <Skeleton my="7px" height={60} width={190} />
        )}
      </>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center" mb="120px">
      <Decorations />
      <StarsDecorations display={['none', 'none', 'block']}>
        <img src="/images/lottery/star-big.png" width="124px" height="109px" alt="" />
        <img src="/images/lottery/star-small.png" width="70px" height="62px" alt="" />
        <img src="/images/lottery/three-stars.png" width="130px" height="144px" alt="" />
      </StarsDecorations>

      {getHeroHeading()}
      {!account ? (
        <WalletNotConnected />
      ) : (
        <TicketContainer
          position="relative"
          width={['240px', '288px']}
          height={['94px', '113px']}
          alignItems="center"
          justifyContent="center"
        >
          <ButtonWrapper>
            <StyledBuyTicketButton
              disabled={disabled}
              themeMode="light"
              setIsSuccess={(p) => setIsSuccess(p)}
              contract={claimContract}
              contractAddress={claimAddress}
            />
          </ButtonWrapper>
          <TicketSvgWrapper>
            <TicketPurchaseCard width="100%" />
          </TicketSvgWrapper>
        </TicketContainer>
      )}
    </Flex>
  )
}

export default Hero
