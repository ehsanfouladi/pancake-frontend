import {Button, useModal, WaitIcon, ButtonProps, Balance} from '@pancakeswap/uikit'
import BigNumber from "bignumber.js";
import {useEffect, useMemo, useState} from "react";
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { useTranslation } from '@pancakeswap/localization'
import { useTheme } from '@pancakeswap/hooks'
import {
    useAccount,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction
} from "wagmi";
import {readContract} from '@wagmi/core'
import styled from "styled-components";
import claimADAbi from "../../../config/abi/claimAD.json";
import WinRateModal from "./rewardShowModal";

interface BuyTicketsButtonProps extends ButtonProps {
  disabled?: boolean
  themeMode?: string
  contract
  contractAddress
  setIsSuccess
}
const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradientGold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const BuyTicketsButton: React.FC<React.PropsWithChildren<BuyTicketsButtonProps>> = ({
  disabled,
  themeMode,
    contract,
    contractAddress,
    setIsSuccess,

  ...props
}) => {
    const {t} = useTranslation()
    const {address: account} = useAccount()
    const {isDark} = useTheme()
    const [reward, setReward] = useState(0)

    const {config, error: fetchRewardError, status} = usePrepareContractWrite({
        address: contract.address as `0x${string}`,
        abi: claimADAbi,
        functionName: 'rewardCalculation',
        onError(error) {
            console.log('PrepareErrors', error)
        },
    })
    const {
        data: rewardCalculatedData,
        isLoading: isRewardCalculatedLoading,
        isSuccess: isRewardCalculatedSuccess,
        error:rewardCalculateError,
        write: calculate
    }
        = useContractWrite({
        ...config,
    })

    const {isLoading, isSuccess} = useWaitForTransaction({
        hash: rewardCalculatedData?.hash,
        // confirmations: 3

    })
    const getLastReward = async () => {
        const fetchedLastReward = await readContract({
            address: contract.address as `0x${string}`,
            abi: claimADAbi,
            functionName: 'lastReward',
            args: [account]
        })

        const BigReward = new BigNumber(fetchedLastReward?.toString())
        const balancedReward = getBalanceNumber(BigReward)
        // await setReward(balancedReward)
        setReward(balancedReward)
        console.log("REWARD", reward)
        // await console.log("REWARD", reward)
        return fetchedLastReward;


    }
    useEffect(() => {
        console.log("IsSuccess", isSuccess)
        if (isSuccess) {
             getLastReward()
             openWinRateModal()
             setIsSuccess(isSuccess)
    }}, [isSuccess, reward])

    const getBuyButtonText = () => {
        if (!disabled) {
            return t('Check for Reward')
        }
        return (
            <>
                <WaitIcon mr="4px" color="textDisabled"/> {t('next reward is comming soon!')}
            </>
        )
    }

    const themeStr = themeMode ?? (isDark ? 'dark' : 'light')
    const [openWinRateModal] = useModal(
    <WinRateModal reward={reward}/>
  )
    return (
        <>
            <Button data-theme={themeStr} {...props} disabled={disabled || isLoading} onClick={() => {
                calculate?.()
            }}>
                {!isLoading ?
                    getBuyButtonText() : (
                        <>
                            <WaitIcon mr="4px" color="textDisabled"/>
                            Please Wait...
                        </>)
                }
            </Button>
        </>
    )

}
export default BuyTicketsButton;
