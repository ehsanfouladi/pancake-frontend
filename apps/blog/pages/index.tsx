import { SWRConfig } from 'swr'
import { InferGetServerSidePropsType } from 'next'
import { getArticle, getCategories } from 'hooks/getArticle'
import { Box } from '@pancakeswap/uikit'
import NewBlog from 'components/NewBlog'
import AuthorsChoice from 'components/AuthorsChoice'
import AllArticle from 'components/Article/AllArticle'

export async function getStaticProps() {
  const [latestArticles, authorChoiceArticle, categories] = await Promise.all([
    getArticle({
      url: '/articles',
      urlParamsObject: {
        populate: 'categories,image',
        sort: 'createdAt:desc',
        pagination: { limit: 1 },
      },
    }),
    getArticle({
      url: '/articles',
      urlParamsObject: {
        populate: 'categories,image',
        sort: 'createdAt:desc',
        pagination: { limit: 9 },
        filters: {
          categories: {
            name: {
              $eq: 'Author’s choice',
            },
          },
        },
      },
    }),
    getCategories(),
  ])

  return {
    props: {
      fallback: {
        '/latestArticles': latestArticles.data,
        '/authorChoiceArticle': authorChoiceArticle.data,
        '/categories': categories,
      },
    },
    revalidate: 60,
  }
}

const BlogPage: React.FC<InferGetServerSidePropsType<typeof getStaticProps>> = ({ fallback }) => {
  return (
    <SWRConfig value={{ fallback }}>
      <Box width="100%" mb="150px">
        <NewBlog />
        <AuthorsChoice />
        <AllArticle />
      </Box>
    </SWRConfig>
  )
}

export default BlogPage
