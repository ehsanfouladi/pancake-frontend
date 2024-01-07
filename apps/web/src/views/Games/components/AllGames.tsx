import { useTranslation } from '@pancakeswap/localization'
import { Box, CardHeader, Flex, PaginationButton, Text } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AppBody } from '..'
import useAllGames from '../hooks/useAllGames'


const StyledCard = styled(Flex)`
  width: 100%;
  border-radius: 0;
  overflow: hidden;
  flex-direction: column;

  // ${({ theme }) => theme.mediaQueries.xxl} {
  //   border: ${({ theme }) => `1px solid ${theme.colors.cardBorder}`};
  //   border-bottom: ${({ theme }) => `3px solid ${theme.colors.cardBorder}`};
  //   border-radius: ${({ theme }) => theme.radii.card};
  // }
`

const AllGames = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt:desc')
  // const sortByItems = [
  //   { label: t('Newest First'), value: 'createdAt:desc' },
  //   { label: t('Oldest First'), value: 'createdAt:asc' },
  //   { label: t('Sort Title A-Z'), value: 'title:asc' },
  //   { label: t('Sort Title Z-A'), value: 'title:desc' },
  // ]
  useEffect(() => {
    setCurrentPage(1)
  }, [query, sortBy])


  const { gamesData, isFetching } = useAllGames({
    query,
    sortBy,
    currentPage,
  })
  const games = gamesData?.data

  const handlePagination = (value: number) => {
    setCurrentPage(1)
    setCurrentPage(value)
  }

  return (
    <>
      <Flex p={['0', '0', '0', '0', '0', '0', '0 16px']}>
        <Flex width={['100%', '100%', '100%', '100%', '100%', '100%', '907px']} flexDirection="column">
          <Flex
            mb={['18px', '18px', '18px', '24px']}
            flexDirection={['column-reverse', 'column-reverse', 'column-reverse', 'row']}
            alignItems={['flexStart', 'flexStart', 'flexStart', 'center']}
            p={['0 16px', '0 16px', '0 16px', '0 16px', '0 16px', '0 16px', '0']}
          >

            {!isFetching && games.length === 0 ? (
              <Text bold fontSize={20} padding={['0 16px', '0 16px', '0 16px', '0 16px', '0 16px', '0 16px', '0']}>
                {t('No results found.')}
              </Text>
            ) : (
              games.map((app) => {
                return (
                    <Link
                      href={app.link} >
                    <StyledCard>
                      <AppBody

                        m={['15px', '10px']}
                        padding="0"
                        // background="#F3F2EE"
                        background={`${({ theme }) => theme.colors.background}`}
                        style={{
                          flex: '0 1 24%',
                          // maxWidth: "calc(95% - 1em)"
                          height: '260px',
                          border: '10px',
                        }}
                      >
                        <CardHeader style={{ textAlign: 'center' }}>
                          <strong>{app.name}</strong>
                        </CardHeader>
                        <Box
                          // className='appCard'
                          
                          style={{
                            height: "200px",
                            width: "100%",
                            background: `url(${app.imgUrl})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: '220px 220px',
                            padding: "0",

                            // textAlign: 'center',
                            // backgroundImage: `url(${app.imgUrl}) `,
                          }}
                        >
                          {/* <Image
                            src={app.imgUrl}
                            alt={app.name}
                            width={200}
                            height={200}
                            style={{
                              padding: '0',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              // borderRadius:"100%",
                            }}
                          /> */}
                        </Box>
                        {/* <CardFooter style={{ textAlign: 'center', whiteSpace: 'pre-wrap', verticalAlign: 'center' }}>
                      {app.description}
                    
                    </CardFooter> */}
                      </AppBody>
              </StyledCard>
                    </Link>
                  )
                })
            )}
          </Flex>

          <PaginationButton
            showMaxPageText
            currentPage={gamesData.pagination.page}
            maxPage={gamesData.pagination.pageCount}
            setCurrentPage={handlePagination}
          />

        </Flex>
      </Flex>
    </>
  )
}

export default AllGames


