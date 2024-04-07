import { Box, CheckmarkCircleFillIcon, Flex, Heading, HelpFilledIcon, Image, InfoFilledIcon, LinkExternal, PreTitle, Tag, Text, VerifiedIcon } from "@pancakeswap/uikit";
import Page from "components/Layout/Page";
import { useActiveChainId } from "hooks/useActiveChainId";
import { useRouter } from "next/router";
import useSWR from "swr";
import { getBlockExploreLink } from "utils";
import { COMPETITION_V2_API_URL } from "views/TradingRewardV2/constants";

interface Competition {

  _id: number
  start_time: number
  end_time: number
  pool_address: string
  exchange_name: string
  number_of_winners: number
  reward_amount: number
  reward_token: string
  reward_token_symbol: string
  is_boosted: boolean
  token_0: string
  token_1: string
  is_live: boolean
  is_finished: boolean
  competition_type: string
  token_to_buy: string
  fee: number
  is_verified: boolean
  is_core: boolean
  is_reward_set: boolean
}

interface Pool {

  id: number
  name: string
  url: string
}

interface ProjectUrls {
  x_url: string | null
  telegram_url: string | null
  reddit_url: string | null
  instagram_url: string | null
  github_url: string | null
  medium_url: string | null
  youtube_url: string | null
  whitepaper_url: string | null
}
interface Project {
  id: number
  live_competitions: Competition[]
  upcoming_competitions: Competition[]
  finished_competitions: Competition[]
  name: string | null
  url: string | null
  token: string
  token_symbol: string | null
  verified_owner: string | null
  created_at: string
  updated_at: string
  is_verified: boolean
  is_audited: boolean
  is_core: boolean
  overview: string
  pools: Pool[]
  urls: ProjectUrls
  logo: string
}

const CompetitionProject = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const projectToken = router.query.projectToken
  const fetcher = url => fetch(url).then(res => res.json());
  const { data, isLoading } = useSWR<Project>(
    `${COMPETITION_V2_API_URL}/projectDetail/${projectToken}`
    , fetcher
  )

  return (
    <Page>
      {data && (
        <>
          <Flex flexDirection='row' alignItems='center'>
            {data.logo ?
              <Image mr='5px' style={{ borderRadius: '100%' }} alt={`${data.name}-Logo`} width={50} height={50} src={`http://localhost:8000${data.logo}`} />
              : < HelpFilledIcon color="textSubtle" width={50} height={50} />
            }
            <Heading fontSize='48px'>
              {data?.name}
            </Heading>
            <PreTitle mx='10px'>({data.token_symbol})</PreTitle>
            {data.is_verified && <VerifiedIcon color="primary" />}
          </Flex>
          <Flex flexDirection='row' justifyContent='start' mt='10px'>
            {/* <Tag  mr='5px'>verified <VerifiedIcon ml='5px' color="gold" /></Tag> */}
            {data.is_core && <Tag mx='5px'>core <InfoFilledIcon ml='5px' color="gold" /></Tag>}
            {data.is_audited && <Tag mx='5px' >audited <CheckmarkCircleFillIcon ml='5px' color="secondary" /></Tag>}
          </Flex>
          <Flex
            flexDirection='row'
            justifyContent='start'
            mt='10px'
            border='solid'
            borderWidth='2px'
            borderRadius='15px'
            borderColor='primary'
            backgroundColor='#d7e7e7'
          >
            <Box p='10px' >
              <Text bold mr='25px' mb='15px'>
                Overview:
              </Text>
              <Text ml='15px' mb='25px'>
                {data.overview}
              </Text>
              <Flex flexDirection='row' justifyContent='flex-start' mb='15px'>
                <Text bold mr='25px'>
                  Contract:
                </Text>
                <LinkExternal
                  isBscScan
                  href={getBlockExploreLink(data.token, 'address', chainId)}
                  bold
                >view contract</LinkExternal>
              </Flex>
              <Flex flexDirection='row' justifyContent='flex-start' mb='15px'>
                <Text bold mr='25px'>
                  Pools on:
                </Text>
                {data.pools?.map(pool => (
                  <LinkExternal
                    mr='10px'
                    pr='5px'
                    href={pool.url}
                    bold
                    style={{ borderRight: 'solid' }}
                  >{pool.name}</LinkExternal>
                ))}
              </Flex>
              <Flex flexDirection='row' justifyContent='flex-start' mb='15px'>
                <Text bold mr='25px'>
                  Official Links:
                </Text>
                {data.urls &&
                  Object.entries(data.urls)
                    .filter(([key, value]) => value != null)
                    .map(([key, value]) => (
                      <LinkExternal
                        mr='10px'
                        pr='5px'
                        href={value}
                        bold
                        style={{ borderRight: 'solid' }}
                      >{key.charAt(0).toUpperCase() + key.replace('_url', '').slice(1)}</LinkExternal>
                    ))}
              </Flex>

            </Box>
          </Flex>
          <Flex
            flexDirection='row'
            justifyContent='start'
            mt='10px'
            border='solid'
            borderWidth='2px'
            borderRadius='15px'
            borderColor='primary'
            backgroundColor='#d7e7e7'
          >
            <Box p='10x'>
              <Text bold ml='15px' mt='10px'> Competitions: </Text>
              {data.live_competitions && data.live_competitions.length > 0 &&
                <Flex flexDirection='row' justifyContent='flex-start' mb='15px'>
                  <Text ml='25px' mr='25px'> Live Competitions:</Text>
                  {data.live_competitions.map(competition => (
                    <LinkExternal
                      mr='10px'
                      pr='5px'
                      href={`trading-competition-v2/top-traders/${competition._id}`}
                      bold
                      style={{ borderRight: 'solid' }}
                    >{competition._id}</LinkExternal>
                  ))
                  }
                </Flex>
              }
              {data.upcoming_competitions && data.upcoming_competitions.length > 0 &&
                <Flex flexDirection='row' justifyContent='flex-start' mb='15px'>
                  <Text ml='25px' mr='25px'> Upcoming Competitions:</Text>
                  {data.upcoming_competitions.map(competition => (
                    <LinkExternal
                      mr='10px'
                      pr='5px'
                      href={`trading-competition-v2/top-traders/${competition._id}`}
                      bold
                      style={{ borderRight: 'solid' }}
                    >{competition._id}</LinkExternal>
                  ))
                  }
                </Flex>
              }
              {data.finished_competitions && data.finished_competitions.length > 0 &&
                <Flex flexDirection='row' justifyContent='flex-start' mb='15px'>
                  <Text ml='25px' mr='25px'> Finished Competitions:</Text>
                  {data.finished_competitions.map(competition => (
                    <LinkExternal
                      mr='10px'
                      pr='5px'
                      href={`trading-competition-v2/top-traders/${competition._id}`}
                      bold
                      style={{ borderRight: 'solid' }}
                    >{competition._id}</LinkExternal>
                  ))
                  }
                </Flex>
              }
            </Box>
          </Flex>
        </>
      )}
    </Page>
  )
}

export default CompetitionProject