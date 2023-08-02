import { createReducer } from '@reduxjs/toolkit'
import { atomWithReducer } from 'jotai/utils'
import {
  Field,
  replaceBuyCbonState,
  resetBuyCbonState,
  selectCurrency,
  setMinAmount,
  setRecipient,
  setUsersIpAddress,
  typeInput,
} from './actions'

export interface BuyCbonState {
  readonly typedValue: string
  readonly recipient: string | null
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly minAmount: number
  readonly minBaseAmount: number
  readonly maxAmount: number
  readonly maxBaseAmount: number
  readonly userIpAddress: string | null
}

const initialState: BuyCbonState = {
  typedValue: '',
  recipient: null,
  [Field.INPUT]: {
    currencyId: '',
  },
  [Field.OUTPUT]: {
    currencyId: '',
  },
  minAmount: null,
  minBaseAmount: null,
  maxAmount: null,
  maxBaseAmount: null,
  userIpAddress: null,
}

export const reducer = createReducer<BuyCbonState>(initialState, (builder) =>
  builder
    .addCase(resetBuyCbonState, () => initialState)
    .addCase(typeInput, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        typedValue,
      }
    })
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      return {
        ...state,
        [field]: { currencyId },
      }
    })
    .addCase(setMinAmount, (state, { payload: { minAmount, minBaseAmount, maxAmount, maxBaseAmount } }) => {
      state.minAmount = minAmount
      state.minBaseAmount = minBaseAmount
      state.maxAmount = maxAmount
      state.maxBaseAmount = maxBaseAmount
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(setUsersIpAddress, (state, { payload: { ip } }) => {
      state.userIpAddress = ip
    })
    .addCase(
      replaceBuyCbonState,
      (
        state,
        {
          payload: {
            typedValue,
            recipient,
            inputCurrencyId,
            outputCurrencyId,
            minAmount,
            minBaseAmount,
            maxAmount,
            maxBaseAmount,
          },
        },
      ) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          typedValue,
          recipient,
          minAmount,
          minBaseAmount,
          maxAmount,
          maxBaseAmount,
          userIpAddress: state.userIpAddress,
        }
      },
    ),
)

export const buyCbonReducerAtom = atomWithReducer(initialState, reducer)
