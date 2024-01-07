import qs from 'qs'
import useSWR from 'swr'
import { ResponseGameType, ResponseGameDataType } from '../types'
import { transformGame, GameType } from '../utils/transformGame'

interface UseAllGameProps {
  query: string
  currentPage: number
  sortBy: string
}

interface AllGameType {
  isFetching: boolean
  gamesData: GameType
}

const useAllGames = ({
  query,
  sortBy,
  currentPage,
}: UseAllGameProps): AllGameType => {
  const { data: gamesData, isLoading } = useSWR(
    ['/games', query, currentPage, sortBy],
    async () => {
      try {
        const urlParamsObject = {
          ...(query && { _q: query }),
          populate: 'image',
          sort: sortBy,
          pagination: {
            page: currentPage,
            pageSize: 10,
          },
        }
        const queryString = qs.stringify(urlParamsObject)
        const response = await fetch(`/api/games?${queryString}`)
        const result: ResponseGameType = await response.json()
        return {
          data: result.data.map((i: ResponseGameDataType) => transformGame(i)) ?? [],
          pagination: { ...result.meta.pagination },
        }
      } catch (error) {
        console.error('Fetch All Game Error: ', error)
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
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
    },
  )

  return {
    isFetching: isLoading,
    gamesData: gamesData ?? {
      data: [],
      pagination: {
        page: 0,
        pageSize: 0,
        pageCount: 0,
        total: 0,
      },
    },
  }
}

export default useAllGames
