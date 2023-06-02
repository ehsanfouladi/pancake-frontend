import styled from 'styled-components'
import {readContract} from "@wagmi/core";
import claimADAbi from 'config/abi/claimAD.json';
import {useAccount, useContractRead} from "wagmi";
import {ChainId} from "@pancakeswap/sdk";
import {CADINU} from '@pancakeswap/tokens'
import {BIG_ZERO} from '@pancakeswap/utils/bigNumber'
import {useEffect, useMemo, useState, useRef} from "react";
import BigNumber from "bignumber.js";
import {Balance, Button, Flex, Heading, PageSection, Skeleton} from '@pancakeswap/uikit'
import {useTranslation} from '@pancakeswap/localization'
import useTheme from 'hooks/useTheme'
import {CNY_TITLE_BG, GET_TICKETS_BG} from './pageSectionStyles'
import {PageMeta} from '../../components/Layout/Page'
import {getClaimContract} from "../../utils/contractHelpers";
import {getClaimAddress} from "../../utils/addressHelpers";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import Hero from "./components/Hero";
// import {GET_TICKETS_BG} from "../Lottery/pageSectionStyles";
import {ClaimStatus} from "../../config/constants/types";
import Countdown from "../Lottery/components/Countdown";
import NextDrawCard from "./components/NextClaimCard";
import useGetNextClaimEvent from "./hooks/useGetNextClaimEvent";
import useGetLastReward from "./hooks/useGetLastReward";
import {floor} from "lodash";


const ClaimPage = styled.div`
  max-height: calc(1100vh - 64px);`
const Claim = () => {
    const { address: account } = useAccount()
    const [lastRewardTime, setLastRewardTime] = useState(null)
    const [timeBetweenEachClaim, setTimeBetweenEachClaim] = useState(null)
    const [disabled, setDisabled] = useState (false)
    const [isSuccess, setIsSuccess] = useState(false)

    const PrizeTotalBalance = styled(Balance)`
      background: ${({ theme }) => theme.colors.gradientGold};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
`
    const claimAddress = getClaimAddress()
    const claimContract = getClaimContract(claimAddress)
    const price = useBUSDPrice(CADINU[ChainId.BSC])

    const cadinuPriceBusd = useMemo(() => (price ? new BigNumber(price.toSignificant(6)) : BIG_ZERO), [price])
      // useChi()
    const { t } = useTranslation()
    const { theme } = useTheme()

    const getLastReward = async () => {
        const fetchedLastReward = await readContract({
            address: claimContract.address as `0x${string}`,
            abi: claimADAbi,
            functionName: 'lastReward',
            args: [account]
        })
        return fetchedLastReward
    }

    const getLastRewardTime = async () => {
        const fetchedLastRewardTime = await readContract({
            address: claimContract.address as `0x${string}`,
            abi: claimADAbi,
            functionName: 'lastRewardTime',
            args: [account]
        })
        setLastRewardTime(fetchedLastRewardTime)
        console.log("fetchedLastRewardTime", fetchedLastRewardTime)
        return fetchedLastRewardTime
    }

    const getTimeBetweenEachClaim = async () => {
        const fetchedTimeBetweenEachClaim = await readContract({
            address: claimContract.address as `0x${string}`,
            abi: claimADAbi,
            functionName: 'timeBetweenEachClaim',
        })
        setTimeBetweenEachClaim(fetchedTimeBetweenEachClaim)
        console.log(fetchedTimeBetweenEachClaim)
        return fetchedTimeBetweenEachClaim
    }
    // useEffect(()=>{
    //     getTimeBetweenEachClaim()
    //     console.log("<<<<<<<<<<<<<<<<betweencheck>>>>>>>>>>>>>")
    // })

    const LastRewardTimeAsInt = useMemo(
        ()=> parseInt(
            lastRewardTime && lastRewardTime.toString(),
            10),
        [lastRewardTime])

    const timeBetweenEachClaimAsInt = useMemo(
         ()=> parseInt(
             timeBetweenEachClaim && timeBetweenEachClaim.toString(),
            10),
        [timeBetweenEachClaim])


    return (
        <>
          <PageMeta />
          <ClaimPage>
              <PageSection background={CNY_TITLE_BG} index={1} hasCurvedDivider clipFill={{ light: '#7E0C33' }}>
                  <Hero disabled={disabled} setDisabled={setDisabled} setIsSuccess={setIsSuccess} isSuccess={isSuccess} />
              </PageSection>
               <PageSection
              containerProps={{ style: { marginTop: '-30px' } }}
              background={GET_TICKETS_BG}
              concaveDivider
              hasCurvedDivider
              clipFill={{ light: '#7E0C33' }}
              dividerPosition="top"
              index={2}
            >
              <Flex alignItems="center" justifyContent="center" flexDirection="column"  pt="24px">
                <NextDrawCard isSuccess={isSuccess} />
              </Flex>
            </PageSection>
          </ClaimPage>
        </>
      )
    }
    export default Claim
