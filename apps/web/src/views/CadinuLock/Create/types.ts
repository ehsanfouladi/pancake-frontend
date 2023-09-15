
export interface FormState {

  tokenAddress: string
  owner : string
  title : string
  amount: number
  tgeDate: Date | null
  tgeTime: Date | null
  tgePercent: number
  cycle: number
  cycleReleasePercent: number
  lockUntilDate: Date | null
  lockUntilTime: Date | null
}

export interface Formv3State {

  nftId: string
  owner : string
  title : string
  lockUntilDate: Date | null
  lockUntilTime: Date | null
}
