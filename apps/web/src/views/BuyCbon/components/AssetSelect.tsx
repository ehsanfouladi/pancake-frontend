import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  CircleLoader,
  CopyButton,
  CurrencyLogo,
  Flex,
  RowBetween,
  RowFixed,
  Text,
  useModal,
} from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { useAccount } from 'wagmi'
import styled from 'styled-components'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useAllOnRampTokens } from 'hooks/Tokens'
import { bscTokens } from '@pancakeswap/tokens'

const AssetSelectButton = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
  box-shadow: ${({ theme }) => theme.shadows.inset};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.dropdown};
  transition: border-radius 0.15s;
`

const chainIdToNetwork: { [network: number]: string } = {
  1: 'Ethereum',
  56: 'Binance Chain',
}

function Balance({ balance, currency }: { balance: CurrencyAmount<Currency>; currency: Currency }) {
  return (
    <Flex alignItems="center" justifyContent="center">
      <Text paddingRight="4px">{formatAmount(balance, 4)}</Text>
      <Text color="textSubtle" fontSize="12px" ellipsis fontWeight="bold" textAlign="center" paddingTop="2px">
        {`${currency?.symbol}`}
      </Text>
    </Flex>
  )
}
export type BigintIsh = bigint | number | string

const AssetSelect = ({ onCurrencySelect, currency, bnbAmount, cbonPrice }) => {
  const { t } = useTranslation()
  const account = useAccount()
  const balance = CurrencyAmount.fromFractionalAmount(bscTokens.cbon, bnbAmount * 1000000000000000000n, cbonPrice)

  // const balanceb = balanceB/cbonPrice
  const onRampTokens = useAllOnRampTokens()
  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      mode="onramp-output"
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      showCommonBases={false}
      showSearchInput={false}
      tokensToShow={onRampTokens as any}
    />,
  )

  // const onCurrencySelectClick = useCallback(() => {
  //   onPresentCurrencyModal()
  // }, [onPresentCurrencyModal])

  return (
    <Flex flexDirection="column">
      <Flex justifyContent="space-between" px="4px">
        <Text mb="8px" bold fontSize="12px" textTransform="uppercase" color="secondary">
          {t('You will get')}
        </Text>
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          {balance ? <Balance balance={balance} currency={currency} /> : account.address ? <CircleLoader /> : null}
        </RowFixed>
      </Flex>
      <AssetSelectButton>
        <RowBetween>
          <Text>{chainIdToNetwork[currency?.chainId]}</Text>
          <Flex>
            <Box width={68} height={24}>
              <Flex flexDirection="row-reverse" alignContent="space-between" verticalAlign="center">
                <span>
                  <CurrencyLogo currency={currency} size="24px" />
                </span>
                <span>
                  <CopyButton text={currency.address} tooltipMessage="Copy CBON Address" color="secondary" mt={-2} />
                </span>
              </Flex>
            </Box>
            <Text mx="4px">{currency?.symbol}</Text>
            {/* <ArrowDropDownIcon /> */}
          </Flex>
        </RowBetween>
      </AssetSelectButton>
    </Flex>
  )
}

export default AssetSelect
