import { fetchAPI } from '../utils/api'
import { ResponseGameType, ResponseGameDataType } from '../types'
import { transformGame, GameType } from '../utils/transformGame'

interface GetGameProps {
  url: string
  urlParamsObject?: Record<string, any>
}

export const getGame = async ({ url, urlParamsObject = {} }: GetGameProps): Promise<GameType> => {
  try {
    const response: ResponseGameType = await fetchAPI(url, urlParamsObject)
    return {
      data: response.data.map((i: ResponseGameDataType) => transformGame(i)) ?? [],
      pagination: { ...response.meta.pagination },
    }
  } catch (error) {
    console.error('[ERROR] Fetching Game', error)
    return {
      data: [],
      pagination: {
        page: 0,
        pageSize: 0,
        pageCount: 0,
        total: 0,
      },
    }
  }
}
