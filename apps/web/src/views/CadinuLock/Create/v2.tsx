import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Flex,
  Heading, Input,
  LinkExternal, Text, useToast
} from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import BigNumber from 'bignumber.js'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Container from 'components/Layout/Container'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useToken } from 'hooks/Tokens'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCallWithGasPriceNative } from 'hooks/useCallWithGasPriceNative'
import useCbonApprovalStatus from 'hooks/useCbonApprovalStatus'
import useCbonApprove from 'hooks/useCbonApprove'
import { useCadinuLockContract } from 'hooks/useContract'
import isEmpty from 'lodash/isEmpty'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useInitialBlock } from 'state/block/hooks'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { parseEther } from 'viem'
import { DatePicker, DatePickerPortal, TimePicker } from 'views/Voting/components/DatePicker'
import { useAccount } from 'wagmi'
import Layout from '../components/Layout'
import { PaymentOptions } from '../components/paymentOptions'
import { ADMINS } from '../config'
import { combineDateAndTime, getFormErrors } from './helpers'
import { FormErrors, Label, SecondaryLabel } from './styles'
import { FormState } from './types'

const V2 = ()=>{
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
        amount: 0,
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
      minAmount: parseEther(`${amount}`),
      onApproveSuccess: async ({ receipt }) => {
        toastSuccess(
          t('Contract enabled - you can now lock your tickets'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      },
      onConfirm: async () => {
        const functionName = isVesting ? isPayWithCbon ? 'vestingLockByCbon' :'vestingLockByNative' : isPayWithCbon ? 'lockByCbon' :'lockByNative'
        const params = isVesting ? 
        isPayWithCbon ? 
          [
            ownerIsMe ? account : owner,
            tokenAddress,
            true,
            parseEther(`${amount}`),
            combineDateAndTime(tgeDate, tgeTime),
            BigInt(tgePercent * 100),
            BigInt(cycle * 24 * 3600),
            BigInt(cycleReleasePercent * 100),
            title
          ] : [
            ownerIsMe ? account : owner,
            tokenAddress,
            true,
            parseEther(`${amount}`),
            combineDateAndTime(tgeDate, tgeTime),
            BigInt(tgePercent * 100),
            BigInt(cycle * 24 * 3600),
            BigInt(cycleReleasePercent * 100),
            title
          ] 
          : isPayWithCbon ? 
          [
            ownerIsMe ? account : owner,
            tokenAddress,
            true,
            parseEther(`${amount}`),
            combineDateAndTime(lockUntilDate,lockUntilTime),
            title
          ] : [
            ownerIsMe ? account : owner,
            tokenAddress,
            true,
            parseEther(`${amount}`),
            combineDateAndTime(lockUntilDate,lockUntilTime),
            title
          ]
          // TODO: check with pnpm dev
            return callWithGasPriceNative(
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
      updateValue(inputName, value)
    }

    const handleDateChange = (key: string) => (value: Date) => {
      updateValue(key, value)
    }
  
    const options = useMemo(() => {
      return {
        hideIcons:
          account && ADMINS.includes(account.toLowerCase())
            ? []
            : ['guide', 'fullscreen', 'preview', 'side-by-side', 'image'],
      }
    }, [account])
  
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
                { PaymentOptions({
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
export default V2;
