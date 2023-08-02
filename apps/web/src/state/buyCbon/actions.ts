import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('buyCbon/selectCurrency')
export const typeInput = createAction<{ typedValue: string }>('buyCbon/typeInputBuyCbon')
export const resetBuyCbonState = createAction<void>('buyCbon/resetbuyCbonState')
export const setRecipient = createAction<{ recipient: string | null }>('buyCbon/setRecipient')
export const setMinAmount = createAction<{
  minAmount: number
  minBaseAmount: number
  maxAmount: number
  maxBaseAmount: number
}>('buyCbon/setMinAmount')
export const setUsersIpAddress = createAction<{ ip: string | null }>('buyCbon/setUsersIpAddress')
export const replaceBuyCbonState = createAction<{
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  minAmount?: number | null
  minBaseAmount?: number | null
  maxAmount?: number | null
  maxBaseAmount?: number | null
}>('swap/replaceBuyCbonState')
