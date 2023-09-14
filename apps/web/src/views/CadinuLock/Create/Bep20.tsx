import {
    AutoRenewIcon,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Input,
    LinkExternal,
    Text,
    useModal,
    useToast,
    ReactMarkdown,
    Checkbox,
    Toggle,
    useTooltip,
    HelpIcon,
  } from '@pancakeswap/uikit'
  import snapshot from '@snapshot-labs/snapshot.js'
  import isEmpty from 'lodash/isEmpty'
  import times from 'lodash/times'
  import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
  import { useInitialBlock } from 'state/block/hooks'
  import { useTranslation } from '@pancakeswap/localization'
  import truncateHash from '@pancakeswap/utils/truncateHash'
  import ConnectWalletButton from 'components/ConnectWalletButton'
  import Container from 'components/Layout/Container'
  import dynamic from 'next/dynamic'
  import Link from 'next/link'
  import { useRouter } from 'next/router'
  import { getBlockExploreLink } from 'utils'
  import { DatePicker, DatePickerPortal, TimePicker } from 'views/Voting/components/DatePicker'
  import { useAccount, useContractReads, useWalletClient } from 'wagmi'
  import Layout from '../components/Layout'
  import VoteDetailsModal from '../components/CadinuLockPurchase'
  import { ADMINS, PANCAKE_SPACE, VOTE_THRESHOLD } from '../config'
  import { combineDateAndTime, getFormErrors } from './helpers'
  import { FormErrors, Label, SecondaryLabel } from './styles'
  import { FormState } from './types'
import { CurrencyAmount, Percent } from '@pancakeswap/swap-sdk-core';
import { getCadinuLockAddress } from 'utils/addressHelpers'
import { useToken } from 'hooks/Tokens'
import { useApproveCallback, useApproveCallbackFromAmount, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { BaseError, decodeFunctionData, getContractError, parseEther, parseUnits } from 'viem'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { getCadinuContract, getCadinuLockContract } from 'utils/contractHelpers'
import { useCadinuLockContract } from 'hooks/useContract'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import { SwitchButton } from '@pancakeswap/uikit/src/widgets/Swap/SwapWidget'
import { SwitchUnitsButton } from '@pancakeswap/uikit/src/components/BalanceInput/styles'
import styled from 'styled-components'
import { FlipButton } from 'views/Swap/V3Swap/containers/FlipButton'
import { paymentOptions } from '../components/paymentOptions'
import { CBON, bscTokens } from '@pancakeswap/tokens'
import useCakeApprove from 'hooks/useCakeApprove'
import useCakeApprovalStatus from 'hooks/useCakeApprovalStatus'
import BigNumber from 'bignumber.js'
import useCbonApprove from 'hooks/useCbonApprove'
import useCbonApprovalStatus from 'hooks/useCbonApprovalStatus'
import { formatBigInt } from '@pancakeswap/utils/formatBalance'
import { useCallWithGasPriceNative } from 'hooks/useCallWithGasPriceNative'
import { publicClient } from 'utils/wagmi'
import { ChainId } from '@pancakeswap/sdk'
import { CadinuLockAbi } from 'config/abi/cadinuLock'
import { getTransaction } from 'viem/dist/types/actions/public/getTransaction'
import { getTransactionReceipt } from 'viem/dist/types/actions/public/getTransactionReceipt'
import { isInteger } from 'lodash'

const Bep20 = ()=>{
  const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  textAlign: center;
  justify-content: center

`
const ReferenceElement = styled.div`
  display: inline-block;
`;
    const [state, setState] = useState<FormState>(() => ({
        tokenAddress: '',
        title: '',
        owner: '',
        amount:0,
        tgeDate: null,
        tgeTime: null,
        tgePercent:0,
        cycle: 0,
        cycleReleasePercent:0,
        lockUntilDate: null,
        lockUntilTime: null,
    }))

    const [isLoading, setIsLoading] = useState(false)
    const [isVesting, setIsVesting] = useState(false)
    const [ownerIsMe, setOwnerIsMe] = useState(true)
    const [isPayWithCbon, setIsPayWithCbon] = useState(false)
    const [priceInNative,setPriceInNative] = useState('')
    const [fieldsState, setFieldsState] = useState<{ [key: string]: boolean }>({})
    // const [onPresentVoteDetailsModal] = useModal(<VoteDetailsModal/>)
    const { t } = useTranslation()
    const { address: account } = useAccount()
    const initialBlock = useInitialBlock()
    const { push } = useRouter()
    const { toastSuccess, toastError } = useToast()
    
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const {
        tokenAddress,
        title,
        owner,
        amount,
        tgeDate,
        tgeTime,
        tgePercent,
        cycle,
        cycleReleasePercent,
        lockUntilDate,
        lockUntilTime
        } = state    
    const [priceInCbon,setPriceInCbon] = useState('')
    const token = useToken(state.tokenAddress)
    
    const cadinuLockContract = useCadinuLockContract()
    const {callWithGasPriceNative} = useCallWithGasPriceNative()
    
    // const a = useApproveCallbackFromAmount(
    //   {
    //     token: bscTokens.cbon,
    //     minAmount:BigInt(Number(priceInCbon)),
    //     targetAmount: BigInt(Number(priceInCbon)),
    //     spender: cadinuLockContract.address,
    //     addToTransaction: true,
    //     onApproveSuccess :
    //   }
    //   )
    const [returnedId, setReturnedId] = useState("")
    const { setLastUpdated, allowance } = useCbonApprovalStatus(cadinuLockContract.address)
    const {handleApprove:approveCbon} = useCbonApprove(setLastUpdated, cadinuLockContract.address, 'Cbon approved successfully!')
    
    const { isApproving, isApproved, isConfirming, handleApprove, handleConfirm } = useApproveConfirmTransaction({
      token,
      spender: cadinuLockContract.address,
      minAmount:parseUnits(amount.toString(),token?.decimals) ?  parseUnits(amount.toString(),token?.decimals): 0n,
      onApproveSuccess: async ({ receipt }) => {
        toastSuccess(
          t('Contract enabled - you can now lock your tickets'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      },
      onConfirm: async () => {
        const functionName = isVesting ? isPayWithCbon ? 'vestingLockCbon' :'vestingLockByNative' : isPayWithCbon ? 'lockByCbon' :'lockByNative'
        const params = isVesting ? 
        isPayWithCbon ? 
          [
            ownerIsMe ? account : owner,
            tokenAddress,
            false,
            parseUnits(amount.toString(),token?.decimals),
            combineDateAndTime(tgeDate, tgeTime),
            BigInt(tgePercent * 10),
            BigInt(cycle * 24 * 3600),
            BigInt(cycleReleasePercent * 10),
            title
          ] : [
            ownerIsMe ? account : owner,
            tokenAddress,
            false,
            parseUnits(amount.toString(),token?.decimals),
            combineDateAndTime(tgeDate, tgeTime),
            BigInt(tgePercent * 10),
            BigInt(cycle * 24 * 3600),
            BigInt(cycleReleasePercent * 10),
            title
          ] 
          : isPayWithCbon ? 
          [
            ownerIsMe ? account : owner,
            tokenAddress,
            false,
            parseUnits(amount.toString(),token?.decimals),
            combineDateAndTime(lockUntilDate,lockUntilTime),
            title
          ] : [
            ownerIsMe ? account : owner,
            tokenAddress,
            false,
            parseUnits(amount.toString(),token?.decimals),
            combineDateAndTime(lockUntilDate,lockUntilTime),
            title
          ]
            return await callWithGasPriceNative(
            cadinuLockContract,
            functionName,
            params,
            isPayWithCbon ? 0n : parseEther(priceInNative),

            )
      },
      onSuccess: async ({ receipt }) => {
        toastSuccess(t('Lock Created!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
        console.log('receipt', receipt);
        push(`/cadinu-lock/${tokenAddress}`)
      },
    })
    const formErrors = getFormErrors(state, t, isVesting, ownerIsMe)
    const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
    }

    // try {
    //     setIsLoading(true)
    //     const web3 = {
    //       getSigner: () => {
    //         return {
    //           _signTypedData: (domain, types, message) =>
    //             signer.signTypedData({
    //               account,
    //               domain,
    //               types,
    //               message,
    //               primaryType: 'Proposal',
    //             }),
    //         }
    //       },
    //     }
    //     const data: any = await client.proposal(web3 as any, account, {
    //       space: PANCAKE_SPACE,
    //       type: 'single-choice',
    //       title: name,
    //       body,
    //       start: combineDateAndTime(startDate, startTime),
    //       end: combineDateAndTime(endDate, endTime),
    //       choices: choices
    //         .filter((choice) => choice.value)
    //         .map((choice) => {
    //           return choice.value
    //         }),
    //       snapshot,
    //       discussion: '',
    //       plugins: JSON.stringify({}),
    //       app: 'snapshot',
    //     })
    //     // Redirect user to newly created proposal page
    //     push(`/voting/proposal/${data.id}`)
    //     toastSuccess(t('Proposal created!'))
    //   } catch (error) {
    //     toastError(t('Error'), (error as Error)?.message)
    //     console.error(error)
    //     setIsLoading(false)
    //   }
  
    const updateValue = (key: string, value: string | Date) => {
        setState((prevState) => ({
        ...prevState,
        [key]: value,
      }))
  
      // Keep track of what fields the user has attempted to edit
      setFieldsState((prevFieldsState) => ({
        ...prevFieldsState,
        [key]: true,
      }))
    }
  
    const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
      const { name: inputName, value } = evt.currentTarget
      if(inputName === 'amount'){
        if(Number(value) !==0 && Number(value) < 1/10**token?.decimals){
          window.alert(`Input amount for this token cannot be less than ${1/10**token?.decimals} `)
        }else if(!isInteger(Math.fround(Number(value)* Math.pow(10,token?.decimals)))){
          window.alert(`Input amount for this token must be of decimals of ${token?.decimals}`)
        }else{
          updateValue(inputName, value)
        }
      }else{
        updateValue(inputName, value)
      }
    }

    const handleDateChange = (key: string) => (value: Date) => {
      updateValue(key, value)
    }
  

  
    useEffect(() => {
      if (initialBlock > 0) {
        setState((prevState) => ({
          ...prevState,
          snapshot: Number(initialBlock),
        }))
      }
    }, [initialBlock, setState])
  
    return (
    <>
        <Container py="40px">
        <Box mb="48px">
          <Breadcrumbs>
            <Link href="/">{t('Home')}</Link>
            <Link href="/cadinu-lock">{t('Cadinu Lock')}</Link>
            <Text>{t('Create a Lock')}</Text>
          </Breadcrumbs>
        </Box>
        <form onSubmit={handleSubmit}>
          <Layout>
            <Box>
              <Box mb="24px">
                <Label htmlFor="tokenAddress">{t('Token Address')}</Label>
                <Input
                    id="tokenAddress"
                    name="tokenAddress"
                    placeholder='0x000...'
                    value={tokenAddress}
                    scale="lg"
                    onChange={handleChange}
                    required 
                />
                {formErrors.tokenAddress && fieldsState.tokenAddress && <FormErrors errors={formErrors.tokenAddress} />}
              </Box>
              <Box mb="24px">
                <Label htmlFor="title">{t('Title')}</Label>
                <Input 
                id="title" 
                name="title" 
                placeholder='Your Lock Title'
                value={title} 
                scale="lg" 
                onChange={handleChange} 
                required 
                />
                {formErrors.title && fieldsState.title && <FormErrors errors={formErrors.title} />}
              </Box>
            <Box mb="24px">
                <Label htmlFor="amount">{t('Amount')}</Label>
                <Input 
                id="amount" 
                name="amount" 
                type='number'
                placeholder='0'
                value={amount} 
                scale="lg" 
                onChange={handleChange} 
                required />
                {formErrors.amount && fieldsState.amount && <FormErrors errors={formErrors.amount} />}
            </Box>
            <Box mb="24px">
                <Checkbox
                id='isVesting'
                name='isVesting'
                onChange={()=>setIsVesting(!isVesting)}
                scale='sm'
                /> <strong>{t('Unlock Over Time (Use Vesting)')}</strong>
            </Box>
                {isVesting && (
            <>
              <Box mb="24px">
                    <Label htmlFor='tgePercent'>{t('Initial Release Percent')}</Label>
                    <Input 
                    id="tgePercent" 
                    name="tgePercent" 
                    placeholder='0%'
                    value={tgePercent} 
                    scale="lg" 
                    onChange={handleChange} 
                    required />
                    {formErrors.tgePercent && fieldsState.tgePercent && <FormErrors errors={formErrors.tgePercent} />}
                </Box>
                <Box mb="24px">
                    <Label htmlFor='cycle'>{t('Release Frequency (days)')}</Label>
                    <Input 
                    id="cycle" 
                    name="cycle" 
                    placeholder='0'
                    value={cycle} 
                    scale="lg" 
                    onChange={handleChange} 
                    required />
                    {formErrors.cycle && fieldsState.cycle && <FormErrors errors={formErrors.cycle} />}
                </Box>
                <Box mb="24px">
                    <Label htmlFor='cycleReleasePercent'>{t('Release Frequency Percent')}</Label>
                    <Input 
                    id="cycleReleasePercent"
                    name="cycleReleasePercent" 
                    placeholder='0%'
                    value={cycleReleasePercent} 
                    scale="lg" 
                    onChange={handleChange} 
                    required />
                    {formErrors.cycleReleasePercent && fieldsState.cycleReleasePercent && <FormErrors errors={formErrors.cycleReleasePercent} />}
                </Box>
                </>
                )}
            </Box>
            <Box>
              <Card>
                <CardHeader>
                  <Heading as="h3" scale="md">
                    {t('Lock Times')}
                  </Heading>
                </CardHeader>
                <CardBody>
                  {!isVesting 
                  ? (
                    <>
                  <Box mb="24px">
                    <SecondaryLabel>{t('Lock Until Date')}</SecondaryLabel>
                    <DatePicker
                      name="lockUntilDate"
                      onChange={handleDateChange('lockUntilDate')}
                      selected={lockUntilDate}
                      placeholderText="YYYY/MM/DD"
                    />
                    {formErrors.lockUntilDate && fieldsState.lockUntilDate && <FormErrors errors={formErrors.lockUntilDate} />}
                  </Box>
                  <Box mb="24px">
                    <SecondaryLabel>{t('Lock Until Time')}</SecondaryLabel>
                    <TimePicker
                      name="lockUntilTime"
                      onChange={handleDateChange('lockUntilTime')}
                      selected={lockUntilTime}
                      placeholderText="00:00"
                    />
                    {formErrors.lockUntilTime && fieldsState.lockUntilTime && <FormErrors errors={formErrors.lockUntilTime} />}
                  </Box>
                  </>)
                  :(
                  <>
                  <Box mb="24px">
                    <SecondaryLabel>{t('Initial Release Date')}</SecondaryLabel>
                    <DatePicker
                      name="tgeDate"
                      onChange={handleDateChange('tgeDate')}
                      selected={tgeDate}
                      placeholderText="YYYY/MM/DD"
                    />
                    {formErrors.tgeDate && fieldsState.tgeDate && <FormErrors errors={formErrors.tgeDate} />}
                  </Box>
                  <Box mb="24px">
                    <SecondaryLabel>{t('Initial Release Time')}</SecondaryLabel>
                    <TimePicker
                      name="tgeTime"
                      onChange={handleDateChange('tgeTime')}
                      selected={tgeTime}
                      placeholderText="00:00"
                    />
                    {formErrors.tgeTime && fieldsState.tgeTime && <FormErrors errors={formErrors.tgeTime} />}
                  </Box>
                  </>
                  )}
                  <Box mb="24px">
                <span>
                  <SecondaryLabel  htmlFor='ownerIsMe'>{t('Who Can Unlock The Tokens?')}</SecondaryLabel>
                  </span>
                  <span>
                <Checkbox
                id='ownerIsMe'
                name='ownerIsMe'
                defaultChecked
                onChange={()=>setOwnerIsMe(!ownerIsMe)}
                scale='sm'
                /> Me
                </span>
            </Box>
                  {ownerIsMe ?
                  account && (
                    <Flex alignItems="center" mb="24px">
                      <Text color="textSubtle" mr="16px">
                        {t('Owner:')}
                      </Text>
                      <LinkExternal isBscScan href={getBlockExploreLink(account, 'address')}>
                        {truncateHash(account)}
                      </LinkExternal>
                    </Flex>
                  )
                  :
                  <Box mb="12px">
                    <SecondaryLabel>{t('someone else')}</SecondaryLabel>
                    <Input 
                    id="owner" 
                    name="owner" 
                    placeholder='0x000...'
                    value={owner} 
                    scale="sm" 
                    onChange={handleChange} 
                    required />
                    {formErrors.owner && fieldsState.owner && <FormErrors errors={formErrors.owner} />}
                  </Box>
                }
                <hr />
                <SecondaryLabel style={{textAlign:'center'}}>Payment Method</SecondaryLabel>
                { paymentOptions({
                  isPayWithCbon,
                  setIsPayWithCbon,
                  cadinuLockContract,
                  priceInCbon,
                  setPriceInCbon,
                  priceInNative,
                  setPriceInNative
                  })}
                {isPayWithCbon && allowance < BigNumber(Number(priceInCbon)) &&

                  <>
                  <Button 
                    onClick={()=>approveCbon()}
                    width='100%'
                    my='12px'
                    disabled={!isEmpty(formErrors)}
                  >
                    Enable CBON
                  </Button>

                  </>

                }
                <hr />

                  {account ? (
                    <>
                    
                    <ApproveConfirmButtons
                      isApproveDisabled={isApproved}
                      isApproving={isApproving}
                      isConfirmDisabled={!isEmpty(formErrors)}
                      isConfirming={isConfirming}
                      onApprove={handleApprove}
                      onConfirm={handleConfirm}
                      buttonArrangement={ButtonArrangement.SEQUENTIAL}
                      confirmLabel={t('Lock')}
                      confirmId="LockInstant"
            />
                  
                    </>
                  ) : (
                    <ConnectWalletButton width="100%" type="button" />
                  )}
                </CardBody>
              </Card>
            </Box>
          </Layout>
        </form>
        <DatePickerPortal />
      </Container>
    </>
    )
}
export default Bep20;
