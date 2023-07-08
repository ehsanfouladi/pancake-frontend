import {Button, useModal, WaitIcon, ButtonProps} from '@pancakeswap/uikit'
import BigNumber from "bignumber.js";
import {useEffect,  useState} from "react";
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
import claimADAbi from "../../../config/abi/claimAD";
import WinRateModal from "./rewardShowModal";

interface BuyTicketsButtonProps extends ButtonProps {
  disabled?: boolean
  themeMode?: string
  contract
  contractAddress
  setIsSuccess
}
// const PrizeTotalBalance = styled(Balance)`
//   background: ${({ theme }) => theme.colors.gradientGold};
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
// `

const BuyTicketsButton: React.FC<React.PropsWithChildren<BuyTicketsButtonProps>> = ({
  disabled,
  themeMode,
    contract,

    setIsSuccess,

  ...props
}) => {
    const {t} = useTranslation()
    const {address: account} = useAccount()
    const {isDark} = useTheme()
    const [reward, setReward] = useState(0)

    const {config} = usePrepareContractWrite({
        address: contract.address as `0x${string}`,
        abi: claimADAbi,
        functionName: 'rewardCalculation',

        onError(error) {
            // eslint-disable-next-line no-console
            console.log('PrepareErrors', error)
        },
    })
    const {
        data: rewardCalculatedData,
        write:calculate

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
        // await console.log("REWARD", reward)
        return fetchedLastReward;


    }
       const [openWinRateModal] = useModal(
    <WinRateModal reward={reward}/>
  )
    const audio = new Audio ('/applause.mp3')
    useEffect(() => {
        if (isSuccess) {
             getLastReward().catch(console.error)
             openWinRateModal();
             setIsSuccess(isSuccess);
             audio.play().then()
        }}, [isSuccess, reward])

    const getBuyButtonText = () => {
        if (!disabled) {
            return t('Click to Win')
        }
        return (
            <>
                <WaitIcon mr="4px" color="textDisabled"/> {t('next reward is comming soon!')}
            </>
        )
    }

    const themeStr = themeMode ?? (isDark ? 'dark' : 'light')
    const sound = new Audio('/cash-register-sound-effect.mp3')
    const onClickHandler = ()=> {
        sound.play().then()
        calculate?.()
            }

    return (
        <>
            <Button data-theme={themeStr} {...props} disabled={disabled || isLoading} onClick={onClickHandler}>
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
