import { useTranslation } from '@pancakeswap/localization'
import { ChainId, NATIVE } from '@pancakeswap/sdk'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Box,
  Button,
  Flex,
  InfoIcon,
  Text,
  UserMenu,
  UserMenuDivider,
  UserMenuItem,
  useTooltip,
} from '@pancakeswap/uikit'
// import { useNetwork } from 'wagmi'
// import { useActiveChainId, useLocalNetworkChain } from 'hooks/useActiveChainId'
// import { useNetworkConnectorUpdater } from 'hooks/useActiveWeb3React'
import { useHover } from 'hooks/useHover'
// import { useSessionChainId } from 'hooks/useSessionChainId'
// import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
// import { chains } from 'utils/wagmi'
// import Image from 'next/image'
import { ASSET_CDN } from 'config/constants/endpoints'

import { Exchangelogo } from './ExchangeLogo'
import { exchanges, rewardTokens } from '../constants'

export const ExchangeSelect = ({ setSelectedExchange, selectedExchange }) => {
  const { t } = useTranslation()

  return (
    <>
      <Box px="16px" py="8px">
        <Text color="textSubtle">{t('Select an Exchange')}</Text>
      </Box>
      <UserMenuDivider />
      {exchanges
        .map((exchange) => (
          <UserMenuItem
            key={exchange.id}
            style={{ justifyContent: 'flex-start' }}
            onClick={() => exchange.id !== selectedExchange?.id && setSelectedExchange(exchange)}
          >
            {/* <Exchangelogo exchangeId={exchange.id} /> */}
            <Text color={exchange.id === selectedExchange?.id ? 'secondary' : 'text'} bold={exchange.id === selectedExchange?.id} pl="12px">
              {exchange.display_name}
            </Text>
          </UserMenuItem>
        ))}
      
    </>
  )
}

export const RewardSelect = ({ setSelectedRewardToken, selectedRewardToken }) => {
  const { t } = useTranslation()

  return (
    <>
      <Box px="16px" py="8px">
        <Text color="textSubtle">{t('Reward Token')}</Text>
      </Box>
      <UserMenuDivider />
      {rewardTokens
        .map((token) => (
          <UserMenuItem
            key={token.id}
            style={{ justifyContent: 'flex-start' }}
            onClick={() => token.id !== selectedRewardToken?.id && setSelectedRewardToken(token)}
          >
            {/* <tokenlogo tokenId={token.id} /> */}
            <Text color={token.id === selectedRewardToken?.id ? 'secondary' : 'text'} bold={token.id === selectedRewardToken?.id} pl="12px">
              {token.display_name}
            </Text>
          </UserMenuItem>
        ))}

    </>
  )
}

