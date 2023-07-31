import { Flex, Heading } from "@pancakeswap/uikit"
import { CurrencyInputPanel } from "@pancakeswap/uikit/src/widgets/Swap/CurrencyInputPanel"
import { useMemo, useState } from "react"
import { useSwapState } from "state/swap/hooks"
import { V3SwapForm } from "views/Swap/V3Swap"
import { FormContainer } from "views/Swap/V3Swap/components"
import { Field } from 'state/swap/actions'

const BuyCryptoPage = () => {
  const [inputValue, setInputValue] = useState('')
  
  return (
    <>
    
    <FormContainer>
      
    </FormContainer>
    
    </>
  )
}

BuyCryptoPage.chains = 56

export default BuyCryptoPage
