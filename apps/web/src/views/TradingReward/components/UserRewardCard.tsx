import { useTranslation } from "@pancakeswap/localization"
import { Box, Button, Card, Flex, Message, MessageText, Text, useToast } from "@pancakeswap/uikit"
import { useCbonPrice, useCbonPriceAsBN } from "@pancakeswap/utils/useCakePrice"
import { GreyCard } from "components/Card"
import { ToastDescriptionWithTx } from "components/Toast"
import { cadinuTradingCompetition } from "config/abi/cadinuTradingCompetition"
import { useCallback, useEffect, useState } from "react"
import { getCadinuTradingCompetitionAddress } from "utils/addressHelpers"
import { formatUnits, } from "viem"
import { readContracts, useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import { minAmountDisplay } from "../utils/minAmountDisplay"





export const UserRewardCard = () => {
    const {t}=useTranslation()
    const { address:account} = useAccount()
    const {toastSuccess } = useToast()
    const [availableReward, setAvailableReward] = useState(null)
    const [withdrawnReward , setWithdrawnReward ] = useState(null)
    const cbonPrice = useCbonPriceAsBN()
    const tradingRewardContract = {
        abi:cadinuTradingCompetition,
        address: getCadinuTradingCompetitionAddress()
    }

    const getRewards = useCallback( async ()=>{
        const data = await  readContracts({
            contracts :[
              {
              ...tradingRewardContract,
              functionName: 'users',
              args:[account]
              },
            ]
        })
        if (data[0].status === 'success'){
          setAvailableReward(data[0].result[0])
          setWithdrawnReward(data[0].result[1])
        }
    }, [account])

    const {config} = usePrepareContractWrite({
      address:getCadinuTradingCompetitionAddress(),
      abi:cadinuTradingCompetition,
      functionName:'withdrawReward'
    })
    const {data, write:handleClaim, isSuccess:isClaimSuccess} = useContractWrite(config)
    const {data:receipt} = useWaitForTransaction({
      hash: data?.hash,
      onSuccess: ()=>toastSuccess(t('Success!'),
          <ToastDescriptionWithTx txHash={data?.hash}>
            {t('You have successfully claimed available tokens.')}
          </ToastDescriptionWithTx>,)
    })

    useEffect(() => {
      if (!availableReward || !withdrawnReward ){
        getRewards()
      }
    
    }, [account,isClaimSuccess])
    
    
  return (
    <Box width={['100%', '100%', '100%', '48.5%']}>
          <Card
           style={{ width: '100%' }}>
        <Box padding={['24px']}>
          <Text bold textAlign="right" mb="24px">
            {t('Your Trading Reward')}
          </Text>
          <GreyCard>
            <Flex flexDirection={['column', 'column', 'column', 'row']}>
              <Box>
                <Text textTransform="uppercase" fontSize="12px" color="secondary" bold mb="4px">
                  {t('Your total unclaimed trading rewards')}
                </Text>
                <Text bold fontSize={['40px']}>
                  {minAmountDisplay({ amount: Number(formatUnits(availableReward || 0n, 18)) * Number(cbonPrice), prefix: '$' })}
                </Text>
                <Text fontSize={['14px']} color="textSubtle">
                  {minAmountDisplay({ amount: Number(formatUnits(availableReward || 0n, 18)), prefix: '~', unit: ' CBON' })}
                </Text>
              </Box>
              <Button
                width={['100%', '100%', '100%', 'fit-content']}
                m={['10px 0 0 0', '10px 0 0 0', '10px 0 0 0', 'auto 0 auto auto']}
                disabled={!availableReward || !account}
                onClick={handleClaim}
              >
                {t('Claim All')}
              </Button>
            </Flex>
          </GreyCard>
          <GreyCard mt="24px">
            <Box>
              <Text color="textSubtle" textTransform="uppercase" fontSize="12px" bold>
                {t('Your TOTAL withdrawn trading Reward')}
              </Text>
              <Text bold fontSize={['24px']}>
                {minAmountDisplay({ amount: Number(formatUnits(withdrawnReward || 0n,18)) * Number(cbonPrice), prefix: '$' })}
              </Text>
              <Text fontSize={['14px']} color="textSubtle">
                  {minAmountDisplay({ amount: Number(formatUnits(withdrawnReward || 0n, 18)), prefix: '~', unit: ' CBON' })}
                </Text>
            </Box>
          </GreyCard>
        </Box>
      </Card>
    </Box>

  )
}
