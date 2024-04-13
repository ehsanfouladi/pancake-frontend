
export interface Project {
  id: number
  created_at: string
  updated_at: string
  name: string
  url: string
  token: string
  token_symbol: string
  verified_owner: string
  logo: string
}
export interface Competition {
  _id: number
  start_time: number
  end_time: number
  pool_address: string
  exchange_name: string
  number_of_winners: number
  reward_amount: string
  reward_token: string
  reward_token_symbol: string
  is_boosted: boolean
  token_0: string
  token_1: string
  is_live: boolean
  is_finished: boolean
  competition_type: string
  token_to_buy: string
  fee: number
  is_verified: boolean
  is_core: boolean
  is_reward_set: boolean
  project: Project
}


export interface RankListDetail {
  origin: string
  amountUSD: number
  estimatedReward: number
}



export const MAX_PER_PAGE = 10

