import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Flex, LinkExternal, Text } from '@pancakeswap/uikit'
import Trans from 'components/Trans'
import styled from 'styled-components'

const stepList = [
  {
    title: <Trans> Choose Your Competition</Trans>,
    subTitle: (
      <Trans>Head to the Live Competition section on this page to select your preferred competition. Filter based on reward type, competition type, or swap platform like CADINU SWAP, PancakeSwap, or UniSwap. You can also choose between BSC or ETH chain competitions. Identify active trading pairs for a chance to win rewards in the CADINU Trading Competition Dapp.</Trans>
    ),
    imgUrl: '/images/trading-reward/step1-1.png',
  },
  {
    title: <Trans>Begin trading now!</Trans>,
    subTitle: (
      <Trans>
        Engage in active competitions to increase your chances of winning rewards. The more you trade (both buying and selling volume), the higher your potential rewards as a top performer in the CADINU trading competition &quot;Type Trade&quot;. Also, explore purchasing (selling= losing points) and holding assets in the &quot;Type Purchase&quot; competition for more opportunities.
      </Trans>
    ),
    imgUrl: '/images/trading-reward/step2-1.png',
  },
  {
    title: <Trans>Monitor your volume and rewards</Trans>,
    subTitle: <Trans>Stay updated on your trading volume and rewards by regularly checking the leaderboard of your selected trading competition. Compare your progress with other competitors to gauge your performance level and stay ahead in the game.</Trans>,
    imgUrl: '/images/trading-reward/step3-1.png',
  },
  {
    title: <Trans>Claim your rewards</Trans>,
    subTitle: (
      <Trans>After emerging victorious in each competition, return to this page to effortlessly claim your rewards from previous periods. Simply connect your wallet to the CADINU Swap trading competition to initiate the process and enjoy your well-deserved rewards.</Trans>
    ),
    imgUrl: '/images/trading-reward/step4-1.png',
  },
]

const StyledCard = styled(Card)`
  width: 100%;
  background: transparent;
  > div {
    background: transparent;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    background: ${({ theme }) => theme.colors.cardBorder};
    > div {
      background: ${({ theme }) => theme.colors.backgroundAlt};
    }
  }
`

const HowToEarn = () => {
  const { t } = useTranslation()

  return (
    <Box id="howToEarn" padding="0 16px" m={['72px 0', '72px 0', '72px 0', '143px 0 108px 0']}>
      <Box margin={['auto']} width={['100%', '100%', '100%', '100%', '100%', '100%', '1140px']}>
        <StyledCard>
          <Flex flexDirection="column" padding={['50px 0 0 0', '50px 0 0 0', '50px 0 0 0', '50px 0']}>
            <Text bold mb={['24px']} color="secondary" textAlign="center" fontSize={['40px']}>
              {t('How to Win')}
            </Text>
            <Flex flexWrap="wrap" flexDirection={['column', 'column', 'column', 'row']}>
              {stepList.map((step, index) => (
                <Flex
                  key={step.imgUrl}
                  width={['100%', '100%', '100%', '50%', '25%']}
                  flexDirection="column"
                  padding={['42px 22px', '42px 22px', '42px 22px', '0 22px']}
                >
                  <Flex
                    flexDirection={['column-reverse', 'column-reverse', 'column-reverse', 'column-reverse', 'column']}
                  >
                    <Text
                      fontSize="12px"
                      bold
                      textAlign={['left', 'left', 'left', 'left', 'right']}
                      m={['0 0 8px 0', '0 0 8px 0', '0 0 8px 0', '0 0 8px 0', '0 0 32px 0']}
                    >
                      {`Step ${index + 1}`}
                    </Text>
                    {/* <Box margin="0 auto">
                      <Image src={step.imgUrl} width={180} height={180} alt={`step${index + 1}`} />
                    </Box> */}
                  </Flex>
                  <Text lineHeight="110%" bold fontSize={['24px']} color="secondary" mb={['16px']}>
                    {step.title}
                  </Text>
                  <Text color="textSubtle" >{step.subTitle}</Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </StyledCard>
      </Box>
      <LinkExternal
        external
        href="https://docs.cadinu.io/products/trading-competation"
        margin={['auto', 'auto', 'auto', '42px auto 0 auto']}
      >
        {t('Learn More')}
      </LinkExternal>
    </Box>
  )
}

export default HowToEarn
