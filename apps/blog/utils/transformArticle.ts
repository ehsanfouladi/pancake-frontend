import { ResponseArticleDataType, PaginationType } from 'types'

export interface ArticleDataType {
  id: number
  slug: string
  title: string
  locale: string
  imgUrl: string
  content: string
  createdAt: string
  publishedAt: string
  description: string
  categories: Array<string>
}

export interface ArticleType {
  data: ArticleDataType[]
  pagination: PaginationType
}

export const transformArticle = (article: ResponseArticleDataType): ArticleDataType => {
  return {
    id: article.id,
    slug: article?.attributes?.slug ?? '',
    title: article?.attributes?.title ?? '',
    content: article?.attributes?.content ?? '',
    createdAt: article?.attributes?.createdAt ?? '',
    publishedAt: article?.attributes?.publishedAt ?? '',
    locale: article?.attributes?.locale ?? '',
    description: article?.attributes?.description ?? '',
    imgUrl: `http://localhost:1337${article?.attributes?.image?.data?.[0]?.attributes?.url}` ?? '',
    categories: article.attributes?.categories?.data?.map((i) => i.attributes.name),
  }
}
