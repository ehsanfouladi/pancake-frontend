import { useTranslation } from "@pancakeswap/localization"
import { Box, Container, Flex, FlexLayout, Input, PageSection, Text, useToast } from "@pancakeswap/uikit"
import truncateHash from "@pancakeswap/utils/truncateHash"
import ApproveConfirmButtons, { ButtonArrangement } from "components/ApproveConfirmButtons"
import { ToastDescriptionWithTx } from "components/Toast"
import { cadinuTradingCompetitionV2 } from "config/abi/cadinuTradingCompetitionV2"
import { format } from "date-fns"
import { useToken } from "hooks/Tokens"
import useApproveConfirmTransaction from "hooks/useApproveConfirmTransaction"
import { useCallWithGasPriceNative } from "hooks/useCallWithGasPriceNative"
import { useCompetitionV2Contract } from "hooks/useContract"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { getCadinuTradingCompetitionV2Address } from "utils/addressHelpers"
import { formatUnits, parseEther, parseUnits } from "viem"
import { DatePickerPortal } from "views/CadinuLock/components/DatePicker"
// import Layout from "views/CadinuLock/components/Layout"
import WalletNotConnected from "views/Claim/components/WalletNotConnected"
import Page from "views/Page"
import FlexRow from "views/Predictions/components/FlexRow"
import { COMPETITION_V2_API_URL } from "views/TradingRewardV2/constants"
import { SecondaryLabel } from "views/Voting/CreateProposal/styles"
import { useAccount, useContractReads, usePrepareContractWrite, useSignMessage } from "wagmi"



const Layout = styled.div`
  align-items: start;
  display: grid;
  grid-gap: 32px;
  grid-template-columns: minmax(0, 1fr);
  border: solid;
  border-width: 1px;
  border-radius: 15px;
  padding: 12px;
  

  ${({ theme }) => theme.mediaQueries.lg} {
    grid-template-columns: 450px 450px;
  }
`

const IncreaseReward = () => {

  const router = useRouter()
  const { id: competitionId} = router.query
  const { address: account } = useAccount()
  const [chainId, setChainId] = useState(null);
  const { toastError, toastSuccess } = useToast()
  const [signature, setSignature] = useState('')
  const [amount, setAmount] = useState('')

  const {
    t,
    currentLanguage: { locale },
  } = useTranslation();





  

  const contract = {
    address: getCadinuTradingCompetitionV2Address(Number(chainId)),
    abi: cadinuTradingCompetitionV2
  }
  console.log('contract', contract);
  
  const { data: competitionDetails } = useContractReads({
    enabled: competitionId !== '',
    contracts: [
      {
        ...contract,
        functionName: 'owner'
      },
      {
        ...contract,
        functionName: 'getCompetitionData',
        args: [competitionId && BigInt((Number(competitionId) - 1).toString())]
      }
    ],
    watch: chainId !== null
  })

  const token = useToken(competitionDetails?.[1]?.result.rewardToken)
  const competitionV2Contract = useCompetitionV2Contract(Number(chainId))
  const { callWithGasPriceNative } = useCallWithGasPriceNative()
  const { isApproving, isApproved, isConfirming, handleApprove, handleConfirm } = useApproveConfirmTransaction({
    token,
    spender: getCadinuTradingCompetitionV2Address(Number(chainId)),
    minAmount: parseUnits(amount.toString(), token?.decimals) ? parseUnits(amount.toString(), token?.decimals) : 0n,
    onApproveSuccess: async ({ receipt }) => {
      toastSuccess(
        t('Contract enabled - you can increase competition reward'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
      )
    },
    onConfirm: async () => {
      const functionName = 'boostCompetition'
      const params = [
        Number(competitionId) - 1,
        parseEther(amount)
      ]
      // TODO: check with pnpm dev
      return callWithGasPriceNative(
        competitionV2Contract,
        functionName,
        params,
        0n,

      )
    },
    onSuccess: async ({ receipt }) => {
      toastSuccess(t('Reward increased!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />);
      handleIncreaseReward();

    },
  });


  const { config } = usePrepareContractWrite({
    address: getCadinuTradingCompetitionV2Address(Number(chainId)),
    abi: cadinuTradingCompetitionV2,
    functionName: 'boostCompetition',
    args: [
      Number(competitionId) - 1,
      parseEther(amount)
    ]
  })

  const handleUpdateDatabase = async () => {

    try {
      const res = await fetch(`${COMPETITION_V2_API_URL}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          account,
          competitionId,
        }),
      })
      if (res.ok) {
        toastSuccess('Database Updated!')
      }
    } catch (error) {
      toastError(error instanceof Error && error?.message ? error.message : JSON.stringify(error))
    }
  }

  // const { data: increaseRewardData, write: increaseReward } = useContractWrite(config)

  const { signMessage: handleIncreaseReward } = useSignMessage({
    message: account,
    onSuccess(data) {
      setSignature(data);
      handleUpdateDatabase();
    }
  })

  // const { data: trasaction } = useWaitForTransaction({
  //   hash: increaseRewardData?.hash,
  //   onSuccess: () => {
  //     toastSuccess('Reward Successfully Increased', <ToastDescriptionWithTx txHash={increaseRewardData.hash} />)
  //     handleUpdateDatabase()


  //   }

  // })


  const handleFormSubmit = async (e) => {
    e.preventDefault()
  }
  // if(competitionDetails && account && account.toLowerCase() !== competitionDetails[0].result?.toLowerCase()){
  //     return (<NotFound />)
  // }

  useEffect(() => {
    // This function will be called when the router is ready
    const handleRouterReady = () => {
      const chainIdValue = router.query.chainId;
      const parsedChainId = chainIdValue
        ? Array.isArray(chainIdValue)
          ? parseInt(chainIdValue[0], 10)
          : parseInt(chainIdValue, 10)
        : null;

      if (isNaN(parsedChainId)) {
        console.error('chainId is not a number');
        // Handle the error case here
      } else {
        setChainId(parsedChainId);
      }
    };

    // Check if the router is ready and if not, set up an event listener
    if (router.isReady) {
      handleRouterReady();
    } else {
      router.events.on('routeChangeComplete', handleRouterReady);
      // Clean up the event listener when the component unmounts
      return () => {
        router.events.off('routeChangeComplete', handleRouterReady);
      };
    }
  }, [router]);
  if (chainId === null) {
    return <div>Loading...</div>;
  }


  if (!account) {
    return (
      <Container>
        <WalletNotConnected />
      </Container>
    )
  }
  return (
    <Page>
      <Container>
        <PageSection index={1} hasCurvedDivider={false} dividerPosition="top">
          {competitionDetails && competitionDetails[1].status === 'success' && (
            <>
              <Layout>
                <Box >
                  <FlexRow justifyContent='space-between'>
                    <Text bold>Competition ID: </Text>
                    <Text>{competitionId}</Text>
                  </FlexRow>
                  <FlexRow justifyContent='space-between'>
                    <Text bold>Start Time</Text>
                    {format(new Date(Number(competitionDetails[1].result?.startTime) * 1000), 'yyyy-MM-dd HH:mm')}
                  </FlexRow>
                  <FlexRow justifyContent='space-between'>
                    <Text bold>End Time</Text>
                    {format(new Date(Number(competitionDetails[1]?.result?.endTime) * 1000), 'yyyy-MM-dd HH:mm')}
                  </FlexRow>
                  <FlexRow justifyContent='space-between'>
                    <Text bold>Pool Address</Text>
                    <Text>
                      {truncateHash(competitionDetails[1].result.poolAddress)}
                    </Text>
                  </FlexRow>
                </Box>
                <Box>
                  <FlexRow justifyContent='space-between'>
                    <Text bold>Number of Winners</Text>
                    <Text>{competitionDetails[1]?.result?.numberOfWinners.toString()}</Text>
                  </FlexRow>
                  <FlexRow justifyContent='space-between'>
                    <Text bold>Reward Token</Text>
                    <Text>
                      {truncateHash(competitionDetails[1].result.rewardToken)}
                    </Text>
                  </FlexRow>
                  <FlexRow justifyContent='space-between'>
                    <Text bold>Reward Amount</Text>
                    <Text>{formatUnits(competitionDetails[1]?.result?.rewardAmount, 18).toString()}</Text>
                  </FlexRow>
                  <FlexRow justifyContent='space-between'>
                    <Text bold>Is Boosted</Text>
                    <Text>{competitionDetails[1]?.result?.isBoosted.toString()}</Text>
                  </FlexRow>
                </Box>
              </Layout>
            </>
          )}
        </PageSection>
        {/* <PageSection index={2} hasCurvedDivider={false} dividerPosition="bottom" > */}
        <FlexLayout>
        <Flex justifyContent='center' flexDirection='column'  justifyItems='center'>
          <form onSubmit={handleFormSubmit}>
              <Box>
                <Box mb="24px" style={{textAlign:'center'}}>
                  <SecondaryLabel htmlFor="rewards">Amount to Increase</SecondaryLabel>
                  <Input
                    id='rewards'
                    name="rewards"
                    placeholder='0'
                    value={amount}
                    scale="sm"
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Box>

              </Box>
          </form>
            < ApproveConfirmButtons
              isApproveDisabled={isApproved}
              isApproving={isApproving}
              isConfirmDisabled={!amount}
              isConfirming={isConfirming}
              onApprove={handleApprove}
              onConfirm={handleConfirm}
              buttonArrangement={ButtonArrangement.SEQUENTIAL}
              confirmLabel={t('Increase Reward')}
              confirmId="Increase"
            />
        </Flex>
        </FlexLayout>
          <DatePickerPortal />
        {/* </PageSection> */}
      </Container>
    </Page>
  )
}

export default IncreaseReward