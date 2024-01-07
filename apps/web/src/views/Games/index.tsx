import {
  Flex,
  Heading,
  PageSection
} from '@pancakeswap/uikit'
import { PageMeta } from 'components/Layout/Page'
import styled from 'styled-components'
import AllGames from './components/AllGames'
import { getGame } from './hooks/getGame'


export async function getStaticProps() {
  const [games] = await Promise.all([
    getGame({
      url: '/games',
      urlParamsObject: {
        populate: 'image',
        sort: 'createdAt:desc',
        pagination: { limit: 1 },
      },
    })
  ])

  return {
    props: {
      fallback: {
        '/games': games.data,
      },
    },
    revalidate: 60,
  }
}


const Games = ({ fallback }) => {

  
  

  const StyledHeading = styled(Heading)`
    font-family: Arial, Helvetica, sans-serif;
    font-size: 36px;
    font-weight: bold;
    color: #f7f7f7;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-stroke: 6px transparent;
    text-shadow: 0px 4px 4px rgba(7, 43, 76);
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 8px;
  `

  const ShowCasePage = styled.div`
    min-height: calc(100vh - 50px);
  `
  return (
    <>
      <PageMeta />
      <ShowCasePage>
        <PageSection index={1} background="linear-gradient(135deg, #4c57a3 0%, #899dcf 100%)" hasCurvedDivider={false}>
          <StyledHeading>CADINU Games </StyledHeading>
          <StyledHeading>Have Fun While Playing Your Favorite Game</StyledHeading>
          <Flex
            width={['328px', '100%']}
            flexWrap="wrap"
            maxWidth="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            position="relative"
            >
          <AllGames />
          </Flex>
        </PageSection>
      </ShowCasePage>
    </>
  )
}

export default Games