import { ContextApi } from '@pancakeswap/localization'
import { format, isValid, parseISO } from 'date-fns'
import { isAddress } from 'views/V3Info/utils'
import { FormState, Formv3State } from './types'

export const combineDateAndTime = (date: Date, time: Date) => {
  if (!isValid(date) || !isValid(time)) {
    return null
  }

  const dateStr = format(date, 'yyyy-MM-dd')
  const timeStr = format(time, 'HH:mm:ss')

  return parseISO(`${dateStr}T${timeStr}`).getTime() / 1e3
}

export const getFormErrors = (formData: FormState, t: ContextApi['t'], isVesting:boolean, isOwnerMe: boolean) => {

  const { owner,tokenAddress,title,amount,tgeDate,tgeTime,lockUntilDate,lockUntilTime  } = formData
  const errors: { [key: string]: string[] } = {}

  if (!tokenAddress) {
    errors.tokenAddress = [t('%field% is required', { field: 'Token Address' })]
  }

  if (!isOwnerMe &&!owner) {
    errors.tokenAddress = [t('%field% is required', { field: 'Owner' })]
  }

  if(!isOwnerMe && !isAddress(owner)){
    errors.owner = [t(`Owner address is invalid`)]
  }

  if(!isAddress(tokenAddress)){
    errors.tokenAddress = [t(`Token Address is invalid`)]
  }

  if (!title) {
    errors.title = [t('%field% is required', { field: 'Title' })]
  }
  if (!amount) {
    errors.amount = [t('%field% is required', { field: 'Amount' })]
  } 
 
  if (isVesting && !isValid(tgeDate)) {
    errors.tgeDate = [t('Please select a valid date')]
  }
  if (isVesting && !isValid(tgeTime)) {
    errors.tgeTime = [t('Please select a valid time')]
  }
  if (isVesting && combineDateAndTime(tgeDate,tgeTime) < Date.now()/1e3){
    errors.tgeTime = [t('Unlock date and time cannot be in past.')]
  }


  if (!isVesting &&!isValid(lockUntilDate)) {
    errors.lockUntilDate = [t('Please select a valid date')]
  }

  if (!isVesting && !isValid(lockUntilTime)) {
    errors.lockUntilTime = [t('Please select a valid time')]
  }

  if (!isVesting && combineDateAndTime(lockUntilDate,lockUntilTime) < Date.now()/1e3){
    errors.lockUntilTime = [t('Unlock date and time cannot be in past.')]
  }

  return errors
}

export const getv3FormErrors = (formv3Data: Formv3State, t: ContextApi['t'], isOwnerMe: boolean)=>{
  const { owner,title,lockUntilDate,lockUntilTime} = formv3Data
  const errors: { [key: string]: string[] } = {}

  

  if (!isOwnerMe &&!owner) {
    errors.owner = [t('%field% is required', { field: 'Owner' })]
  }

  if(!isOwnerMe && !isAddress(owner)){
    errors.owner = [t(`Owner address is invalid`)]
  }

  
  if (!title) {
    errors.title = [t('%field% is required', { field: 'Title' })]
  }

  if (!isValid(lockUntilDate)) {
    errors.lockUntilDate = [t('Please select a valid date')]
  }

  if (!isValid(lockUntilTime)) {
    errors.lockUntilTime = [t('Please select a valid time')]
  }

  if (combineDateAndTime(lockUntilDate,lockUntilTime) < Date.now()/1e3){
    errors.lockUntilTime = [t('Unlock date and time cannot be in past.')]
  }
  return errors
}