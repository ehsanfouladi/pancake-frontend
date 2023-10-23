import { useTranslation } from '@pancakeswap/localization'
import { ChevronDownIcon, Flex, Tab, TabMenu as UIKitTabMenu } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { Address } from 'viem'

export enum NftType {
  ALL = 'all',
  MYNFTS = 'myNFTs'
}
interface TabMenuProps {
  nftType: NftType
  onTypeChange: (nftType: NftType) => void
  account: Address
}

const StyledTabMenu = styled.div`
  padding-top: 16px;
`

const getIndexFromType = (nftType: NftType) => {
  switch (nftType) {
    default:
      case NftType.ALL:
        return 0
    case NftType.MYNFTS:
      return 1
  }
}

const getTypeFromIndex = (index: number) => {  
  switch (index) {
    default:
      case 0:
        return NftType.ALL
    case 1:
      return NftType.MYNFTS
  }
}

const TabMenu: React.FC<React.PropsWithChildren<TabMenuProps>> = ({ nftType, onTypeChange, account }) => {
  const { t } = useTranslation()
  const handleItemClick = (index: number) => {
    onTypeChange(getTypeFromIndex(index))
  }

  return (
    <StyledTabMenu>
      <UIKitTabMenu activeIndex={getIndexFromType(nftType)} onItemClick={handleItemClick} isShowBorderBottom={false}>
        <Tab>
          <Flex alignItems="center">
            <ChevronDownIcon color="currentColor" mr="4px" />
            {t('All')}
          </Flex>
        </Tab>
        <Tab disabled={!account} >
          {' '}
          <Flex alignItems="center">
            <ChevronDownIcon color="currentColor" mr="4px" />
            {t('My NFTs')}
          </Flex>
        </Tab>
      </UIKitTabMenu>
    </StyledTabMenu>
  )
}

export default TabMenu
