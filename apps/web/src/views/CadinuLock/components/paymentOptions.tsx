import { baseColors } from '@pancakeswap/ui/tokens/colors'
import { Box, Flex, Text, Toggle } from '@pancakeswap/uikit'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { formatRawAmount } from 'utils/formatCurrencyAmount'

export const PaymentOptions = ({
  isPayWithCbon, setIsPayWithCbon, cadinuLockContract,priceInCbon,setPriceInCbon,priceInNative,setPriceInNative
}) => {
  const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  textAlign: center;
  justify-content: center
`
  const getPriceInCbon = useCallback(async()=>{
    const price = await cadinuLockContract.read.priceInCbon()
    const formattedPrice = formatRawAmount(price.toString(), 18, 10)
    setPriceInCbon(formattedPrice)
    return price
  },[])
  const getPriceInNative = useCallback(async()=>{
    const price = await cadinuLockContract.read.priceInNative()
    const formattedPrice = formatRawAmount(price.toString(), 18, 10)
    setPriceInNative(formattedPrice)
    return price
  },[])

  useEffect(() => {
      if(priceInCbon===''){
        getPriceInCbon()
      }
      if(priceInNative===''){
        getPriceInNative()
      }
    },[])
  
      return (
        <>
    <ToggleWrapper>
    <Text mx="12px">Pay with Native</Text>
    <Toggle
      id="staked-only-farms"
      scale="sm"
      checked={isPayWithCbon}
      onChange={() => setIsPayWithCbon(!isPayWithCbon)}
      defaultColor='success'
      />
    <Text m='12px'>Pay with Cbon</Text>
  </ToggleWrapper>
  <Flex justifyContent='center'>
   <Box style={{textAlign:'center' , display:'inline-block'}}>
    <Text color={baseColors.success}>Lock Price: 
   {isPayWithCbon ? 
     ` ${priceInCbon.toLocaleString()} CBON`
     
     :
       ` ${priceInNative.toLocaleString()} BNB`
      
      }
      </Text>
   </Box>
   </Flex>
   </>
  )
}


