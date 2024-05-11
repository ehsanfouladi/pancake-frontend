import { useTheme } from "@pancakeswap/hooks"
import { useTranslation } from "@pancakeswap/localization"
import { Container, Flex, Text } from "@pancakeswap/uikit"

const Banner = () => {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  return (
    <Container
      position="relative"
      backgroundColor={
        isDark
          ? 'radial-gradient(103.12% 50% at 50% 50%, #21193a 0%, #191326 100%)'
          : 'linear-gradient(154.45deg, #C1EDF0 -6.71%, #EAFBF7 31.9%, #D9E7FD 87.95%, #E0DAFE 105.77%)'
      }
    >
      <Flex
        position="relative"
        zIndex="1"
        margin="auto"
        justifyContent="space-between"
        width={['100%', '100%', '100%', '100%', '100%', '100%', '1140px']}
        flexDirection={[
          'column-reverse',
          'column-reverse',
          'column-reverse',
          'column-reverse',
          'column-reverse',
          'row',
        ]}
      >
        <Flex flexDirection="column" alignSelf="center" width={['100%', '100%', '100%', '700px']}>
          <Text bold fontSize={['40px', '40px', '40px', '60px']} color="secondary" lineHeight="110%">
            {t('Profile Reward Competition!')}
          </Text>
          <Text
            bold
            fontSize="40px"
            color="text"
            fontStyle="italic"
            lineHeight="110%"
            mb={['20px', '20px', '20px', '32px']}
          >
            {t('Earn Rewards .')}
          </Text>

          <Text bold mb="32px" maxWidth="520px" lineHeight="26.4px" fontSize={['16px', '16px', '16px', '24px']}>
            {t('Encrease your profile points for exclusive rewards!')}
          </Text>
        </Flex>
        {/* <UserRewardCard /> */}
      </Flex>
    </Container>
  )
}

export default Banner