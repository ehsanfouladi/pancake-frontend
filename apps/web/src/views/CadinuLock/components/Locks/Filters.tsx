import { ChangeEvent } from 'react'
import { Flex, Radio, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { CadinuLockState } from 'state/types'

interface FiltersProps {
  filterState: CadinuLockState
  onFilterChange: (filterState: CadinuLockState) => void
  isLoading: boolean
}

const StyledFilters = styled(Flex).attrs({ alignItems: 'center' })`
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 14px 0 14px 24px;
`

const FilterLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  margin-right: 16px;
`

const options = [
  { value: CadinuLockState.TOKENS, label: 'Token' },
  { value: CadinuLockState.LIQUIDITY_V2, label: 'V2 Liquidity' },
  { value: CadinuLockState.LIQUIDITY_V3, label: 'V3 Liquidity' },
]

const Filters: React.FC<React.PropsWithChildren<FiltersProps>> = ({ filterState, onFilterChange, isLoading }) => {
  const { t } = useTranslation()

  return (
    <StyledFilters>
      {options.map(({ value, label }) => {
        
        
        const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
          const { value: radioValue } = evt.currentTarget
          onFilterChange(radioValue as CadinuLockState)
        }

        return (
          <FilterLabel key={label}>
            <Radio
              scale="sm"
              value={value}
              checked={filterState === value}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Text ml="8px">{t(label)}</Text>
          </FilterLabel>
        )
      })}
    </StyledFilters>
  )
}

export default Filters
