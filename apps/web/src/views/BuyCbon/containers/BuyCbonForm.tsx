import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { BuyCbonState } from 'state/buyCbon/reducer'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, NativeCurrency, Percent } from '@pancakeswap/sdk'
import { ArrowDownIcon, Box, Button, Text } from '@pancakeswap/uikit'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import {
  calculateDefaultAmount,
  fetchMinimumBuyAmount,
  useBuyCbonActionHandlers,
  useBuyCbonErrorInfo,
} from 'state/buyCbon/hooks'
import { useOnRampCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import styled from 'styled-components'
import toString from 'lodash/toString'
import { CryptoFormView } from 'views/BuyCbon/types'
import { FormHeader } from './FormHeader'
import { FormContainer } from '../components/FormContainer'
import AssetSelect from '../components/AssetSelect'
import GetQuotesButton from '../components/GetQuotesButton'
import { fiatCurrencyMap } from '../constants'
import { CADINU, bscTokens } from '@pancakeswap/tokens'
import { FlipButton } from 'views/Swap/V3Swap/containers/FlipButton'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'
import { getPreSaleCbonContract } from 'utils/contractHelpers'
import { preSaleCbonAbi } from 'config/abi/preSaleCbon'
import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import useNativeCurrency from 'hooks/useNativeCurrency'

const CenterWrapper = styled.div`
  position: absolute;
  left: 48.5%;
  top: 33%;
`

// Since getting a quote with a number with more than 2 decimals (e.g., 123.121212),
// the quote provider won't return a quote. Therefore, we restrict the fiat currency input to a maximum of 2 decimals.

export function BuyCbonForm({
  setModalView,
  modalView,
  buyCbonState,
  fetchQuotes,
  setIsBuySuccess,
}: {
  setModalView: Dispatch<SetStateAction<CryptoFormView>>
  modalView: CryptoFormView
  buyCbonState: BuyCbonState
  fetchQuotes: () => Promise<void>,
  setIsBuySuccess: Function
}) {
  const { t } = useTranslation()
  const client = createPublicClient({ 
    chain: bsc,
    transport: http()
  })
  
  const [CBONPrice, setCBONPrice] = useState(1n);
  
  const preSaleContract = getPreSaleCbonContract();
  
  const getCbonPriceInWei = async()=>{
    const fetchedCbonPriceInWei:any = await client.readContract({
      address: preSaleContract.address as `0x${string}`,
      abi: preSaleCbonAbi,
      functionName: 'CBONPriceInWei'
    })
    // const CBONPriceInWei = new BigNumber (fetchedCbonPriceInWei?.toString())
      setCBONPrice(fetchedCbonPriceInWei)
  }
  const [isRunning, setIsRunning] = useState(false)
  const getIsPreSaleRuning = async()=>{
    const isPreSaleRunning = await client.readContract({
      address: preSaleContract.address as `0x${string}`,
      abi: preSaleCbonAbi,
      functionName: 'isPreSaleRunning'
    })

    console.log("isPreSaleRunning", isPreSaleRunning);
    
    
    setIsRunning(isPreSaleRunning===true? true : false)
  }

  
  const {
    typedValue,
    // [Field.INPUT]: { currencyId: inputCurrencyId },
    // [Field.OUTPUT]: { currencyId: outputCurrencyId },
   
  } = buyCbonState
  const [bnbAmountBig, setBnbAmountBig] = useState(0n)

  const { config } = usePrepareContractWrite({
    address: preSaleContract.address as `0x${string}`,
    abi: preSaleCbonAbi,
    functionName: 'preSale',
    value:bnbAmountBig,

    onError(error) {
      // eslint-disable-next-line no-console
      console.log('PrepareErrors', error)
    },
  })
  const { data: preSaleData, write: preSale } = useContractWrite({
    ...config,
  })
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: preSaleData?.hash,
    // confirmations: 3
  })
  useEffect(() => {
    if(isSuccess){
      setIsBuySuccess(true)
    }
  }, [isSuccess, setIsBuySuccess])
  
  const inputCurrency = bscTokens.cbon

  const outputCurrency: any = useNativeCurrency()
  const { onFieldAInput } = useBuyCbonActionHandlers()
  const handleTypeOutput = useCallback(
    (value: string) => {
      if (value === '' || value) {
        onFieldAInput(value)
      }
    },
    [onFieldAInput],
  )

  // need to reloacte this
  // const fetchMinBuyAmounts = useCallback(async () => {
  //   const limitAmounts = await fetchMinimumBuyAmount(outputCurrencyId, inputCurrencyId)

  //   if (!limitAmounts) return

  //   onFieldAInput(toString(calculateDefaultAmount(limitAmounts.baseCurrency?.minBuyAmount)))

  //   onLimitAmountUpdate(
  //     limitAmounts.baseCurrency?.minBuyAmount,
  //     limitAmounts.quoteCurrency?.minBuyAmount,
  //     limitAmounts.baseCurrency?.maxBuyAmount,
  //     limitAmounts.quoteCurrency?.maxBuyAmount,
  //   )
  // }, [outputCurrencyId, inputCurrencyId, onFieldAInput, onLimitAmountUpdate])
  
  useEffect(() => {
    // fetchMinBuyAmounts()
    getCbonPriceInWei()
    getIsPreSaleRuning()
    const bnbBig = Number(typedValue) * 10**18
    const bnbBigInt = BigInt(Math.floor(bnbBig))
    setBnbAmountBig(bnbBigInt)
  }, [typedValue])

  const handleOutputSelect = ()=> void(null)
  const {address: account} = useAccount()
  const inputBalance = useCurrencyBalance(account, outputCurrency)
  const maxAmountInput = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])
  const handlePercentInput = useCallback(
    (percent: number) => {
      if (maxAmountInput) {
        onFieldAInput( maxAmountInput.multiply(new Percent(percent, 100)).toExact())
      }
    },
    [maxAmountInput, onFieldAInput],
  )
  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onFieldAInput( maxAmountInput.toExact())
    }
  }, [maxAmountInput, onFieldAInput])
  return (
    <>
      <FormHeader title={t('Get CBON Now')} subTitle={t('Spend BNB to Get CBON')} />
      <FormContainer>
        <CurrencyInputPanel
        id="bnb-currency-input"
        showUSDPrice
        showMaxButton
        disableCurrencySelect={true}
        // showCommonBases
        inputLoading={false}
        currencyLoading={!false}
        title={
          <Text px="4px" bold fontSize="12px" textTransform="uppercase" color="secondary">
            {t('I want to spend')}
          </Text>}
        maxAmount={maxAmountInput}
        value={typedValue}
        showQuickInputButton
        currency={outputCurrency}
        onUserInput={handleTypeOutput}
        onCurrencySelect={handleOutputSelect}
        onMax={handleMaxInput}
        // otherCurrency={outputCurrency}
        onPercentInput = {handlePercentInput}
      />
      <CenterWrapper>
          <ArrowDownIcon className="icon-down" color="primary" width="22px" />
      </CenterWrapper>
      <AssetSelect onCurrencySelect={handleOutputSelect} currency={inputCurrency} bnbAmount={bnbAmountBig} cbonPrice={CBONPrice}/>
      <Button onClick={()=>preSale?.()} disabled={!preSale}>
        Get Cbon
      </Button>
      </FormContainer>
    </>
  )
}
