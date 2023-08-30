import styled from 'styled-components'
import { TabMenu as UIKitTabMenu, Tab, Flex, VerifiedIcon, LockIcon,  ChevronDownIcon } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { CadinuLockType } from 'state/types'
import { Address } from 'viem'

interface TabMenuProps {
  lockType: CadinuLockType
  onTypeChange: (lockType: CadinuLockType) => void
  account: Address
}

const StyledTabMenu = styled.div`
  background-color: ${({ theme }) => theme.colors.input};
  padding-top: 16px;
`

const getIndexFromType = (lockType: CadinuLockType) => {
  switch (lockType) {
    case CadinuLockType.ALL:
      return 0
    case CadinuLockType.MYLOCK:
      return 1
  }
}

const getTypeFromIndex = (index: number) => {  
  switch (index) {
    case 0:
      return CadinuLockType.ALL
    case 1:
      return CadinuLockType.MYLOCK
  }
}

const TabMenu: React.FC<React.PropsWithChildren<TabMenuProps>> = ({ lockType, onTypeChange, account }) => {
  const { t } = useTranslation()
  const handleItemClick = (index: number) => {
    onTypeChange(getTypeFromIndex(index))
  }

  return (
    <StyledTabMenu>
      <UIKitTabMenu activeIndex={getIndexFromType(lockType)} onItemClick={handleItemClick}>
        <Tab>
          <Flex alignItems="center">
            <ChevronDownIcon color="currentColor" mr="4px" />
            {t('All')}
          </Flex>
        </Tab>
        <Tab disabled={!account} >
          {' '}
          <Flex alignItems="center">
            <LockIcon color="currentColor" mr="4px" />
            {t('My Locks')}
          </Flex>
        </Tab>
      </UIKitTabMenu>
    </StyledTabMenu>
  )
}

export default TabMenu
