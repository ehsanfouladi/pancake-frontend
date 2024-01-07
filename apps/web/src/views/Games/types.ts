  export interface GameImageType {
    id: number
    attributes: {
      url: string
      formats: {
        medium: {
          url: string
        }
        small: {
          url: string
        }
        thumbnail: {
          url: string
        }
      }
    }
  }
  
  export interface ResponseGameDataType {
    id: number
    attributes: {
      name: string
      description: string
      link: string
      image: {
        data: GameImageType
      }
    }
  }
  
  export interface PaginationType {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
  
  export interface ResponseGameType {
    data: ResponseGameDataType[]
    meta: {
      pagination: PaginationType
    }
  }
  
  