import {
  MenuItemsType,
  DropdownMenuItemType,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  PancakeProtectorIcon,
  EarnIcon,
  TrophyIcon,
  TrophyFillIcon,
  NftIcon,
  NftFillIcon,
  MoreIcon,
  DropdownMenuItems,
  PlayCircleOutlineIcon,
} from '@pancakeswap/uikit'
import { ContextApi } from '@pancakeswap/localization'
import { SUPPORTED_CHAIN_IDS as POOL_SUPPORTED_CHAINS } from '@pancakeswap/pools'

import { SUPPORT_FARMS, SUPPORT_ONLY_BSC } from 'config/constants/supportChains'

export type ConfigMenuDropDownItemsType = DropdownMenuItems & { hideSubNav?: boolean }
export type ConfigMenuItemsType = Omit<MenuItemsType, 'items'> & { hideSubNav?: boolean; image?: string } & {
  items?: ConfigMenuDropDownItemsType[]
}

const addMenuItemSupported = (item, chainId) => {
  if (!chainId || !item.supportChainIds) {
    return item
  }
  if (item.supportChainIds?.includes(chainId)) {
    return item
  }
  return {
    ...item,
    disabled: true,
  }
}

const config: (
  t: ContextApi['t'],
  isDark: boolean,
  languageCode?: string,
  chainId?: number,
) => ConfigMenuItemsType[] = (t, isDark, languageCode, chainId) =>
  [
    {
      label: t('Trade'),
      icon: SwapIcon,
      fillIcon: SwapFillIcon,
      href: '/swap',
      // showItemsOnMobile: false,
      items: [
        {
          label: t('Swap'),
          href: '/swap',
          status: { text: t('New'), color: 'success' },
          // disabled: true,
        },
        {
          label: t('Liquidity'),
          href: '/liquidity',
          status: { text: t('New'), color: 'success' },
          // disabled: true,
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
    {
      label: t('Win'),
      href: '/lottery',
      icon: TrophyIcon,
      fillIcon: TrophyFillIcon,
      supportChainIds: SUPPORT_ONLY_BSC,
      items: [
        {
          label: t('Lottery'),
          href: '/lottery',
          image: '/images/decorations/lottery.png',
        },
        {
          label: t('Click To Win'),
          href: '/click-to-win',
          image: '/images/decorations/lottery.png',
        },
      ],
    },
    {
      label: t('Earn'),
      href: '/farms',
      icon: EarnIcon,
      fillIcon: EarnFillIcon,
      image: '/images/decorations/pe2.png',
      supportChainIds: SUPPORT_FARMS,
      items: [
        {
          label: t('Farms'),
          href: '/farms',
          supportChainIds: SUPPORT_FARMS,
          status: { text: t('New'), color: 'success' },
          // disabled: true,
        },
        {
          label: t('Pools'),
          href: '/pools',
          supportChainIds: POOL_SUPPORTED_CHAINS,
          status: { text: t('New'), color: 'success' },
          // disabled: true,
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },

    {
      label: t('Game'),
      icon: NftIcon,
      hideSubNav: true,
      items: [
        {
          label: t('Cadinu Games'),
          href: 'https://cadinu.io/beta-games',
          type: DropdownMenuItemType.EXTERNAL_LINK,
          status: { text: t('New'), color: 'success' },
        },
      ],
    },
    // {
    //   label: t('Info'),
    //   icon: NftIcon,
    //   fillIcon: NftIcon,
    //   href: '/info',
    //   showItemsOnMobile: true,
    //   items: [].map((item) => addMenuItemSupported(item, chainId)),
    // },

    {
      label: '',
      href: '/info',
      icon: MoreIcon,
      // type: DropdownMenuItemType.EXTERNAL_LINK,
      hideSubNav: true,
      items: [
        {
          label: t('Info'),
          href: '/info/v3',
          status: { text: t('New'), color: 'success' },
          // disabled: true,
        },

        {
          label: t('Voting'),
          href: '/voting',
          supportChainIds: SUPPORT_ONLY_BSC,
          image: '/images/voting/voting-bunny.png',
          status: { text: t('New'), color: 'success' },
        },
      ].map((item) => addMenuItemSupported(item, chainId)),
    },
  ].map((item) => addMenuItemSupported(item, chainId))

export default config
