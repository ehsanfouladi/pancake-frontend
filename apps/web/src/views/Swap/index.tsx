import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import {
  BottomDrawer,
  Flex,
  Modal,
  ModalV2,
  useMatchBreakpoints,
  Card,
  CardProps,
  Heading,
  Message,
  Button,
  ButtonMenuItem,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@pancakeswap/uikit'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
// import { AppBody } from 'components/App'
import { useRouter } from 'next/router'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { currencyId } from 'utils/currencyId'

import { useSwapHotTokenDisplay } from 'hooks/useSwapHotTokenDisplay'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useSingleTokenSwapInfo, useSwapState } from 'state/swap/hooks'
import styled from 'styled-components'
import Page from '../Page'
import PriceChartContainer from './components/Chart/PriceChartContainer'
import HotTokenList from './components/HotTokenList'
import useWarningImport from './hooks/useWarningImport'
import { V3SwapForm } from './V3Swap'
import { StyledInputCurrencyWrapper, StyledSwapContainer } from './styles'
import { SwapFeaturesContext } from './SwapFeaturesContext'

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  max-width: 412px;
  width: 500px;
  z-index: 1;
`
// const StyledHeaderInner = styled(Flex)`
//   flex-direction: row;
//   justify-content: space-between;
//   align-items: start;
//   margin-top: 32px;
//   margin-bottom: 32px;
//   align-self: center;

//   ${({ theme }) => theme.mediaQueries.sm} {
//     flex-direction: row;
//     align-items: center;
//     align-self: center;
//     margin-top: 32px;
//     margin-bottom: 32px;
//   }
// `
/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export function AppBody({ children, ...cardProps }: { children: React.ReactNode } & CardProps) {
  return <BodyWrapper {...cardProps}>{children}</BodyWrapper>
}

export default function Swap() {
  const { query } = useRouter()
  const { isDesktop } = useMatchBreakpoints()
  const {
    isChartExpanded,
    isChartDisplayed,
    setIsChartDisplayed,
    setIsChartExpanded,
    isChartSupported,
    isHotTokenSupported,
  } = useContext(SwapFeaturesContext)
  const [isSwapHotTokenDisplay, setIsSwapHotTokenDisplay] = useSwapHotTokenDisplay()
  const { t } = useTranslation()
  const [firstTime, setFirstTime] = useState(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleChartDisplayed = () => {
    setIsChartDisplayed((currentIsChartDisplayed) => !currentIsChartDisplayed)
  }

  useEffect(() => {
    if (firstTime && query.showTradingReward) {
      setFirstTime(false)
      setIsSwapHotTokenDisplay(true)

      if (!isSwapHotTokenDisplay && isChartDisplayed) {
        toggleChartDisplayed()
      }
    }
  }, [firstTime, isChartDisplayed, isSwapHotTokenDisplay, query, setIsSwapHotTokenDisplay, toggleChartDisplayed])

  // swap state & price data
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }
  const [newUrlExtention, setNewUrlExtention] = useState('')
  const singleTokenPrice = useSingleTokenSwapInfo(inputCurrencyId, inputCurrency, outputCurrencyId, outputCurrency)
  const warningSwapHandler = useWarningImport()
  useDefaultsFromURLSearch()
  const { onCurrencySelection } = useSwapActionHandlers()

  const handleOutputSelect = useCallback(
    (newCurrencyOutput: Currency) => {
      onCurrencySelection(Field.OUTPUT, newCurrencyOutput)
      warningSwapHandler(newCurrencyOutput)

      const newCurrencyOutputId = currencyId(newCurrencyOutput)

      if (newCurrencyOutputId === inputCurrencyId) {
        replaceBrowserHistory('inputCurrency', outputCurrencyId)
      }
      replaceBrowserHistory('outputCurrency', newCurrencyOutputId)
    },

    [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
  )
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const handlePancakeOnLoad = () => {
    setIframeLoaded(true)
  }

  const [multiSwapShow, setMultiSwapShow] = useState(false)
  const onShowButtonClick = () => {
    setMultiSwapShow(!multiSwapShow)
  }
  const PancakeIframe = useCallback(() => {
    return (
      <>
        <AppBody mx={isDesktop ? '5px' : 0} mt={isDesktop ? 0 : '20px'}>
          <Heading as="h3" textAlign="center" color="primary">
            PancakeSwap
          </Heading>
          <iframe
            title="PancakeSwap"
            src={`https://pancakeswap.finance/swap${newUrlExtention}`}
            width="100%"
            height="800px"
            // onLoad={handlePancakeOnLoad}
            style={!iframeLoaded ? { display: 'none' } : { display: 'block' }}
          />
        </AppBody>
      </>
    )
  }, [newUrlExtention, isDesktop, iframeLoaded])

  const UniSwapIframe = useCallback(() => {
    return (
      <AppBody mx={isDesktop ? '5px' : 0} mt={isDesktop ? 0 : '20px'}>
        <Heading as="h3" textAlign="center" color="primary">
          UniSwap
        </Heading>
        <iframe
          title="UniSwap"
          src={`https://app.uniswap.org/#/swap${newUrlExtention}`}
          width="100%"
          height="800px"
          onLoad={handlePancakeOnLoad}
          tabIndex={-500}
          style={!iframeLoaded ? { display: 'none' } : { display: 'block', position: 'relative' }}
        />
      </AppBody>
    )
  }, [newUrlExtention, isDesktop, iframeLoaded])

  const BiSwapIframe = useCallback(() => {
    return (
      <AppBody mx={isDesktop ? '5px' : 0} mt={isDesktop ? 0 : '20px'}>
        <Heading as="h3" textAlign="center" color="primary">
          Biswap
        </Heading>

        <iframe
          title="Biswap"
          src={`https://biswap.org/swap${newUrlExtention}`}
          width="100%"
          height="800px"
          // onLoad={handlePancakeOnLoad}
          style={!iframeLoaded ? { display: 'none' } : { display: 'block' }}
        />
      </AppBody>
    )
  }, [newUrlExtention, isDesktop, iframeLoaded])

  useEffect(() => {
    setNewUrlExtention(`?inputCurrency=${inputCurrencyId}&outputCurrency=${outputCurrencyId}`)
  }, [inputCurrencyId, outputCurrencyId])

  return (
    <Page removePadding={isChartExpanded} hideFooterOnDesktop={isChartExpanded}>
      <Flex width={['328px', '100%']} height="100%" justifyContent="center" position="relative" alignItems="flex-start">
        {isDesktop && isChartSupported && (
          <PriceChartContainer
            inputCurrencyId={inputCurrencyId}
            inputCurrency={currencies[Field.INPUT]}
            outputCurrencyId={outputCurrencyId}
            outputCurrency={currencies[Field.OUTPUT]}
            isChartExpanded={isChartExpanded}
            setIsChartExpanded={setIsChartExpanded}
            isChartDisplayed={isChartDisplayed}
            currentSwapPrice={singleTokenPrice}
          />
        )}
        {!isDesktop && isChartSupported && (
          <BottomDrawer
            content={
              <PriceChartContainer
                inputCurrencyId={inputCurrencyId}
                inputCurrency={currencies[Field.INPUT]}
                outputCurrencyId={outputCurrencyId}
                outputCurrency={currencies[Field.OUTPUT]}
                isChartExpanded={isChartExpanded}
                setIsChartExpanded={setIsChartExpanded}
                isChartDisplayed={isChartDisplayed}
                currentSwapPrice={singleTokenPrice}
                isFullWidthContainer
                isMobile
              />
            }
            isOpen={isChartDisplayed}
            setIsOpen={setIsChartDisplayed}
          />
        )}
        {isDesktop && isSwapHotTokenDisplay && isHotTokenSupported && (
          <HotTokenList handleOutputSelect={handleOutputSelect} />
        )}
        <ModalV2
          isOpen={!isDesktop && isSwapHotTokenDisplay && isHotTokenSupported}
          onDismiss={() => setIsSwapHotTokenDisplay(false)}
        >
          <Modal
            style={{ padding: 0 }}
            title={t('Top Token')}
            onDismiss={() => setIsSwapHotTokenDisplay(false)}
            bodyPadding="0px"
          >
            <HotTokenList
              handleOutputSelect={(newCurrencyOutput: Currency) => {
                handleOutputSelect(newCurrencyOutput)
                setIsSwapHotTokenDisplay(false)
              }}
            />
          </Modal>
        </ModalV2>

        <StyledSwapContainer $isChartExpanded={isChartExpanded}>
          <StyledInputCurrencyWrapper mt={isChartExpanded ? '24px' : '0'}>
            <AppBody mb="10px" id="foo">
              <V3SwapForm />
            </AppBody>
          </StyledInputCurrencyWrapper>
        </StyledSwapContainer>
      </Flex>
      <style>{`.decorated{
        margin-top:40px;
        margin-bottom:40px;
       text-align: center;
 }
.decorated > span{
    position: relative;
    display: inline-block;
    
}
.decorated > span:before, .decorated > span:after{
    content: '';
    position: absolute;
    top: 50%;
    border-bottom: 2px solid;
    border-color: black;
    width: 30vw;
    margin: 0 20px;
}
.decorated > span:before{
    right: 100%;
}
.decorated > span:after{
    left: 100%;
}`}</style>
      <ButtonMenuItem
        // role="button"
        scale='sm'
        variant='secondary'
        tabIndex={0}
        onClick={onShowButtonClick}
        mb="15px"
      >
        <h2 className="decorated">
          <span>{!multiSwapShow ?<ChevronDownIcon color="text" width="12px" /> : <ChevronUpIcon color="text" width="12px" />} {multiSwapShow ? 'Hide ' : 'Show '}Multi Swap {!multiSwapShow ?<ChevronDownIcon color="text" width="12px" /> : <ChevronUpIcon color="text" width="12px" />}</span>
        </h2>
      </ButtonMenuItem>
      {isDesktop ? (
        <>
          {multiSwapShow && (
            <Message variant="warning" mb="15px">
              In order for it to work properly, please accept the conditions of the exchange each time you select a
              pair.
            </Message>
          )}
          <Flex flexDirection="row-reverse" justifyContent="space-between" alignItems="center">
            {/* <span style={multiSwapShow ? { display: 'block' } : { display: 'none' }}>{UniSwapIframe()}</span>
            <span style={multiSwapShow ? { display: 'block' } : { display: 'none' }}>{BiSwapIframe()}</span>
            <span style={multiSwapShow ? { display: 'block' } : { display: 'none' }}>{PancakeIframe()}</span> */}
          </Flex>
        </>
      ) : (multiSwapShow && (
        <Flex flexDirection={isDesktop ? 'row' : 'column'} justifyContent="space-between" minHeight="2500px">
          <StyledSwapContainer $isChartExpanded={isChartExpanded}>
            <StyledInputCurrencyWrapper>
              {/* {UniSwapIframe()}
              {BiSwapIframe()}
              {PancakeIframe()} */}
            </StyledInputCurrencyWrapper>
          </StyledSwapContainer>
        </Flex>)
      )}
    </Page>
  )
}
