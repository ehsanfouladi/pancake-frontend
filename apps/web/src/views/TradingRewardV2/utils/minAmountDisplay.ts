import { formatNumber } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'

interface MinAmountDisplayProps {
  amount: number
  prefix?: string
  unit?: string
}

export const minAmountDisplay = ({ amount, prefix = '', unit = '' }: MinAmountDisplayProps) => {
  return new BigNumber(amount).gt(0) && new BigNumber(amount).lte(0.01)
    ? `<${prefix}0.01${unit}`
    : `${prefix}${formatNumber(amount)}${unit}`
}
