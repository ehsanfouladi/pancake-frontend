import { useTranslation } from "@pancakeswap/localization";
import { Box, CardBody, CardRibbon, Flex, Grid, Skeleton, SkeletonV2, Text } from "@pancakeswap/uikit";
import styled from "styled-components";
import { RankListDetail } from "views/TradingReward/hooks/useRankList";
import RankingCard from "./RankedCards";

interface Campaign {
    rewardTokenSymbol: string
    totalReward: number
    exclusiveRewards: number[]
    exclusiveRewardTakenByAddress: RankListDetail[]
}


const StyledCardBody = styled(CardBody)`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`
const StyledCardRibbon = styled(CardRibbon)`
  right: -20px;
  top: -20px;

  ${({ theme }) => theme.mediaQueries.xs} {
    right: -10px;
    top: -10px;
  }
`

const PreviousCampaginCardBody: React.FC<
    React.PropsWithChildren<{ campaignData: Campaign; isLoading: boolean}>
> = ({ campaignData, isLoading }) => {
    const { t } = useTranslation()
    return (
        <StyledCardBody>
            <Flex justifyContent={['center', null, null, 'flex-start']} flexDirection='column'>
            <Box mb='25px'>
                <Grid
                    gridGap={['16px', null, null, null, null, '1px']}
                    gridTemplateColumns={['10fr', null, null, null, null, 'repeat(2, 1fr)']}
                >
                    <Text bold>Total Reward Amount: </Text>
                    {isLoading ? <Skeleton /> :
                    <Text>{campaignData?.totalReward} {campaignData?.rewardTokenSymbol} </Text>
                }
                </Grid>
            </Box>
            <Text bold mb='25px'>Exclusive Reward Winners: </Text>
            
                <Grid
                    gridGap={['16px', null, null, null, null, '24px']}
                    gridTemplateColumns={['1fr', null, null, null, null, `repeat(3, 1fr)`]}
                >
                    {isLoading ? <SkeletonV2 /> :
                    campaignData?.exclusiveRewardTakenByAddress?.map(user => (
                        <RankingCard rank={1} user={user as RankListDetail} tokenSymbol={campaignData?.rewardTokenSymbol} />))
                    }
                </Grid>
            </Flex>
        </StyledCardBody>
    )
}
export default PreviousCampaginCardBody