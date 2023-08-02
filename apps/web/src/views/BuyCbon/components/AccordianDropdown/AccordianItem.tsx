import { Box, Flex, InfoIcon, RowBetween, Text, TooltipText, useTooltip } from '@pancakeswap/uikit'
import { CryptoCard } from 'components/Card'
import { FiatOnRampModalButton } from 'components/FiatOnRampModal/FiatOnRampModal'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BuyCbonState } from 'state/buyCbon/reducer'
import { getRefValue } from 'views/BuyCbon/hooks/useGetRefValue'
import { ProviderQoute } from 'views/BuyCbon/hooks/usePriceQuoter'
import styled, { useTheme } from 'styled-components'
import BigNumber from 'bignumber.js'
import { ProviderIcon } from 'views/BuyCbon/Icons'
import { useTranslation } from '@pancakeswap/localization'
import { isMobile } from 'react-device-detect'
import Image from 'next/image'
import formatLocaleNumber from 'utils/formatLocaleNumber'

import MercuryoAltSvg from '../../../../../public/images/onRampProviders/mercuryo_new_logo_black.png'
import MercuryoAltSvgLight from '../../../../../public/images/onRampProviders/mercuryo_new_logo_white.png'

const DropdownWrapper = styled.div<{ isClicked: boolean }>`
  padding-top: ${({ isClicked }) => (isClicked ? '20px' : '0px')};
  width: 100%;
`
const FEE_TYPES = ['Total Fees', 'Networking Fees', 'Provider Fees']

const FeeItem = ({
  feeTitle,
  feeAmount,
  currency,
  provider,
  index,
}: {
  feeTitle: string
  feeAmount: number
  currency: string
  provider: string
  index: number
}) => {
  const {
    currentLanguage: { locale },
  } = useTranslation()

  if (provider === 'Mercuryo' && (index === 1 || index === 2)) return <></>
  return (
    <RowBetween>
      <Text fontSize="14px" color="textSubtle">
        {feeTitle}
      </Text>
      <Text ml="4px" fontSize="14px" color="textSubtle">
        {formatLocaleNumber({ number: feeAmount, locale })} {currency}
      </Text>
    </RowBetween>
  )
}

function AccordionItem({
  active,
  btnOnClick,
  buyCbonState,
  quote,
  fetching,
}: {
  active: boolean
  btnOnClick: any
  buyCbonState: BuyCbonState
  quote: ProviderQoute
  fetching: boolean
}) {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const theme = useTheme()
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(105)
  const multiple = false
  const [visiblity, setVisiblity] = useState(false)
  const [mobileTooltipShow, setMobileTooltipShow] = useState(false)

  const isActive = () => (multiple ? visiblity : active)

  const toogleVisiblity = useCallback(() => {
    setVisiblity((v) => !v)
    btnOnClick()
  }, [setVisiblity, btnOnClick])

  useEffect(() => {
    if (active) {
      const contentEl = getRefValue(contentRef)
      setHeight(contentEl.scrollHeight + 100)
    } else setHeight(105)
  }, [active])

  const MoonapyAmt = useMemo(() => {
    const totalFees = new BigNumber(quote.networkFee).plus(new BigNumber(quote.providerFee))
    const fiatAmountAfterFees = new BigNumber(buyCbonState.typedValue).minus(totalFees)
    const AssetRate = new BigNumber(quote.quote)
    const moonPayQuote = fiatAmountAfterFees.dividedBy(AssetRate).toNumber()
    return moonPayQuote
  }, [quote, buyCbonState])

  const MercuryAmt = useMemo(() => {
    const binanceConnectQuote = new BigNumber(quote.amount).minus(new BigNumber(quote.networkFee))
    return binanceConnectQuote.toNumber()
  }, [quote])

  let finalQuote = quote.amount
  if (quote.provider === 'MoonPay') finalQuote = MoonapyAmt
  if (quote.provider === 'Mercuryo') finalQuote = MercuryAmt

  const {
    tooltip: buyCbonTooltip,
    tooltipVisible: buyCbonTooltipVisible,
    targetRef: buyCbonTargetRef,
  } = useTooltip(
    <Box maxWidth="150px">
      <Text as="p">
        {t('Price quote from provider is currently unavailable. Please try again or try a different amount')}
      </Text>
    </Box>,
    {
      placement: isMobile ? 'top' : 'bottom',
      trigger: isMobile ? 'focus' : 'hover',
      ...(isMobile && { manualVisible: mobileTooltipShow }),
    },
  )

  if (quote.amount === 0) {
    return (
      <Flex flexDirection="column">
        <CryptoCard padding="16px 16px" style={{ height: '48px' }} position="relative" isClicked={false} isDisabled>
          <RowBetween paddingBottom="20px">
            {quote.provider === 'Mercuryo' ? (
              <Flex mt="5px">
                <Image src={theme.isDark ? MercuryoAltSvgLight : MercuryoAltSvg} alt="#" width={120} />
              </Flex>
            ) : (
              <ProviderIcon provider={quote.provider} width="130px" isDisabled={false} />
            )}
            <TooltipText
              ref={buyCbonTargetRef}
              onClick={() => setMobileTooltipShow(false)}
              display="flex"
              style={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Flex alignItems="center" justifyContent="center">
                <Text ml="4px" fontSize="14px" color="textSubtle">
                  Quote not available
                </Text>
                <InfoIcon color="textSubtle" pl="4px" pt="2px" />
              </Flex>
            </TooltipText>
            {buyCbonTooltipVisible && (!isMobile || mobileTooltipShow) && buyCbonTooltip}
          </RowBetween>
        </CryptoCard>
      </Flex>
    )
  }
  return (
    <Flex flexDirection="column">
      <CryptoCard
        padding="16px 16px"
        style={{ height }}
        onClick={!isActive() ? toogleVisiblity : () => null}
        position="relative"
        isClicked={active}
        isDisabled={false}
      >
        <RowBetween paddingBottom="8px">
          {quote.provider === 'Mercuryo' ? (
            <Flex mt="5px">
              <Image src={theme.isDark ? MercuryoAltSvgLight : MercuryoAltSvg} alt="#" width={120} />
            </Flex>
          ) : (
            <ProviderIcon provider={quote.provider} width="130px" isDisabled={false} />
          )}

          <Text ml="4px" fontSize="22px" color="#7A6EAA" fontWeight="bold">
            {formatLocaleNumber({ number: finalQuote, locale })} {buyCbonState.INPUT.currencyId}
          </Text>
        </RowBetween>
        <RowBetween pt="12px">
          <Text fontSize="15px">
            {buyCbonState.INPUT.currencyId} {t('rate')}
          </Text>
          <Text ml="4px" fontSize="16px">
            = {formatLocaleNumber({ number: quote.quote, locale })} {buyCbonState.OUTPUT.currencyId}
          </Text>
        </RowBetween>

        <DropdownWrapper ref={contentRef} isClicked={!isActive()}>
          {FEE_TYPES.map((feeType: string, index: number) => {
            let fee = 0
            if (index === 0) fee = quote.networkFee + quote.providerFee
            else if (index === 1) fee = quote.networkFee
            else fee = quote.providerFee
            return (
              <FeeItem
                key={feeType}
                feeTitle={feeType}
                feeAmount={fee}
                currency={buyCbonState.OUTPUT.currencyId}
                provider={quote.provider}
                index={index}
              />
            )
          })}
          <FiatOnRampModalButton
            provider={quote.provider}
            inputCurrency={buyCbonState.INPUT.currencyId}
            outputCurrency={buyCbonState.OUTPUT.currencyId}
            amount={buyCbonState.typedValue}
            disabled={fetching}
          />
        </DropdownWrapper>
      </CryptoCard>
    </Flex>
  )
}

export default AccordionItem
