
import { Container, Flex } from "@pancakeswap/uikit"
import { useProfile } from "state/profile/hooks"
import Page from "views/Page"
import { ProfileRewardCard } from "views/Profile/components/ProfileRewards"
import Banner from "./components/banner"
import { CampaignCard } from "./components/campaignCard"

const ProfileReward = () => {
    const { profile } = useProfile()
    return (
        <Page>
            <Container>
                <Banner />
                {
                    profile &&
                    <ProfileRewardCard />
                }
                <Flex justifyContent='center' mb='25px'>
                    <CampaignCard />
                </Flex>


            </Container>
        </Page>
    )
}

export default ProfileReward