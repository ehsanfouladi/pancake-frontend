import { ChainId } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { ACCESS_RISK_API } from 'config/constants/endpoints'

import { string as zString, object as zObject, enum as zEnum } from 'zod'

const zBand = zEnum(['5/5', '4/5', '3/5', '2/5', '1/5'])
export const zRiskTokenData = zObject({
  trust_level: zString(),
  band: zBand,
  scanned_ts: zString(),
})

export const TOKEN_RISK = {
  UNKNOWN: -1,
  VERY_LOW: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 4,
} as const

export const TOKEN_RISK_MAPPING = {
  '5/5': TOKEN_RISK.VERY_LOW,
  '4/5': TOKEN_RISK.LOW,
  '3/5': TOKEN_RISK.MEDIUM,
  '2/5': TOKEN_RISK.HIGH,
  '1/5': TOKEN_RISK.VERY_HIGH,
} as const

export interface RiskTokenInfo {
  address: string
  chainId: ChainId
  riskLevel: (typeof TOKEN_RISK)[keyof typeof TOKEN_RISK]
  scannedTs: number
}

const fetchRiskApi = async (address: string, chainId: number) => {
  const response = await fetch(`${ACCESS_RISK_API}/${chainId}/${address}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  const result = await response.json()
  return result
}

export const fetchRiskToken = async (address: string, chainId: number): Promise<RiskTokenInfo> => {
  const riskApi = await fetchRiskApi(address, chainId)
  const data = zRiskTokenData.parse(riskApi.data)
  // eslint-disable-next-line camelcase
  const { band, scanned_ts } = data

  
  

  if ( address===bscTokens.cadinu.address){
    return{
      address,
      chainId,
      riskLevel: TOKEN_RISK_MAPPING['4/5'],
      scannedTs: parseInt(scanned_ts, 10)
    }
  }

  return {
    address,
    chainId,
    riskLevel: TOKEN_RISK_MAPPING[band],
    scannedTs: parseInt(scanned_ts, 10),
  }
}
