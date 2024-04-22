import { bscTokens } from "@pancakeswap/tokens"

export const COMPETITION_API_URL = 'https://api.cadinu.io/api/competitions'
export const COMPETITION_V2_API_URL = 'http://localhost:8000/api/competitions/v2'

export const exchanges = [
  {
    "id": 1,
    "name": 'All',
    "display_name": "All",
    "mobile_display_name": "All"
  },
  {
    "id": 2,
    "name": 'cadinuSwap',
    "display_name": "Cadinu Swap",
    "mobile_display_name": "Cadinu"
  },
  {
    "id": 3,
    "name": 'pancakeSwap',
    "display_name": "Pancake Swap",
    "mobile_display_name": "Pancake"
  },
  {
    "id": 4,
    "name": 'uniSwap',
    "display_name": "Uni Swap",
    "mobile_display_name": "Uni"
  },
  
] 


export const rewardTokens = [
  {
    "id": 1,
    "token": '',
    "display_name": "All",

  },
  {
    "id": 2,
    "token": bscTokens.bnb.address,
    "display_name": "BNB",

  },
  {
    "id": 3,
    "token": bscTokens.usdt.address,
    "display_name": "USDT",
    
  },
  {
    "id": 4,
    "token": 'other',
    "display_name": "Other",
    
  },

] 