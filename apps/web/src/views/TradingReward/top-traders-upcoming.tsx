import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CardHeader, CardRibbon, Flex, IfoSkeletonCardDetails, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { format } from 'date-fns'
import styled from 'styled-components'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import { COMPETITION_API_URL } from './constants'

const UpcomingCompetitions = () => {

const BACKGROUND_COLOR = 'radial-gradient(55.22% 134.13% at 57.59% 0%, #60EFFF 0%, #45CAFF 33.21%, #0061FF 79.02%)'


const StyledBackground = styled(Flex)<{ showBackgroundColor: boolean }>`
  position: relative;
  flex-direction: column;
  padding-top: 0px;
  margin-bottom: 48px;
  background: ${({ showBackgroundColor }) => (showBackgroundColor ? BACKGROUND_COLOR : '')};
  z-index: 0;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 88px 0;
  }
`

const StyledHeading = styled(Text)`
  position: relative;
  font-size: 40px;
  font-weight: 900;
  line-height: 98%;
  letter-spacing: 0.01em;
  background: linear-gradient(166.02deg, #0061FF -5.1%, #0061FF 75.24%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: auto;
  margin-bottom:40px;
  padding: 0 16px;
  text-align: center;

  &::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    padding: 0 16px;
    z-index: -1;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: 8px rgb(96, 239, 255, 1);
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 56px;
    padding: 0;

    &::after {
      padding: 0;
    }
  }
`

  const {address:account} = useAccount()
  const {t} = useTranslation()
  const {isMobile} =useMatchBreakpoints()
  const fetcher = url => fetch(url).then(res => res.json())

  const {data, isLoading} = useSWR(`${COMPETITION_API_URL}/upcoming-competitions`,fetcher )

  return (
    <StyledBackground showBackgroundColor={true} justifyContent='center' >
      <StyledHeading data-text={t('Upcoming Competitions')}
      
      >{t('Upcoming Competitions')}</StyledHeading>
      <Flex flexDirection={isMobile ? 'column' : 'row'}
      width={['328px', '100%']}
      flexWrap="wrap"
      maxWidth="100%"
      height="100%"
      alignItems='flex-start'
      justifyContent="center"
      position="relative"
      >
        {isLoading &&(
          <IfoSkeletonCardDetails />
        )}
        {data && data.competitions.map(competition=>(

          <Card ribbon={competition.isBoosted && <CardRibbon text='Boosted' ribbonPosition="right" />}
          m='15px' 
          style={{
            width:isMobile ? '.9 rem' : '100%',
            flex: '0 1 28%',
            minWidth: isMobile && "calc(98% - 1em)",
            // height: '2800px',
            border: '10px',
            backgroundColor: 'transparent'
          }}
          >
            
        <CardHeader style={{textAlign:'center'}} >
          
          <Text>Competition ID #{competition._id}</Text>
        </CardHeader>
        <CardBody style={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}>
          <Box>
          <Text>  {`Pool: ${competition.token0}/${competition.token1}`}</Text>
          <Text>  {`Start Time: ${format(new Date(Number(competition.startTime * 1000)), 'yyyy-MM-dd HH:mm')}`}</Text>
          <Text>  {`End Time: ${format(new Date(Number(competition.endTime * 1000)), 'yyyy-MM-dd HH:mm')}`}</Text>
          <Text>  {`Exchange: ${competition.exchangeName}`}</Text>
          </Box>
        </CardBody>
      </Card>
        ))}
            
      </Flex>
    </StyledBackground>
 )}
export default UpcomingCompetitions
