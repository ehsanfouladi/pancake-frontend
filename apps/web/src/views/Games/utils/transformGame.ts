import { ResponseGameDataType, PaginationType } from '../types'

export interface GameDataType {
  id: number
  name: string
  link: string
  imgUrl: string
  description: string
}

export interface GameType {
  data: GameDataType[]
  pagination: PaginationType
}

export const transformGame = (game: ResponseGameDataType): GameDataType => {
  return {
    id: game.id,
    name: game?.attributes?.name ?? '',
    description: game?.attributes?.description ?? '',
    link:  game?.attributes?.link ?? '',
    imgUrl: `https://cms.cadinu.io${game?.attributes?.image?.data?.attributes?.url}` ?? '',
  }
}
