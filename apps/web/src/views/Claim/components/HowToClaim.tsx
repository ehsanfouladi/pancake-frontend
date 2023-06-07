import styled from 'styled-components'
import { Box, Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBorder};
  height: 1px;
  margin: 40px 0;
  width: 100%;
`

const StepContainer = styled(Flex)`
  gap: 24px;
  width: 100%;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const StyledStepCard = styled(Box)`
  display: flex;
  align-self: baseline;
  position: relative;
  background: ${({ theme }) => theme.colors.cardBorder};
  padding: 1px 1px 3px 1px;
  border-radius: ${({ theme }) => theme.radii.card};
`

const StepCardInner = styled(Box)`
  width: 100%;
  padding: 24px;
  background: ${({ theme }) => theme.card.background};
  border-radius: ${({ theme }) => theme.radii.card};
`

type Step = { title: string; subtitle: string; label: string }

const StepCard: React.FC<React.PropsWithChildren<{ step: Step }>> = ({ step }) => {
  return (
    <StyledStepCard width="100%">
      <StepCardInner height={['200px', '180px', null, '200px']}>
        <Text mb="16px" fontSize="12px" bold textAlign="right" textTransform="uppercase">
          {step.label}
        </Text>
        <Heading mb="16px" scale="lg" color="secondary">
          {step.title}
        </Heading>
        <Text color="textSubtle">{step.subtitle}</Text>
      </StepCardInner>
    </StyledStepCard>
  )
}

interface HowToPlayProps {
  children?: React.ReactNode;
  minRewardAmount: number;
}



// @ts-ignore
const HowToPlay: React.FC<HowToPlayProps> = ({minRewardAmount}) => {
  const { t } = useTranslation()

  const steps: Step[] = [
    {
      label: t('Step %number%', { number: 1 }),
      title: t('Connect Wallet'),
      subtitle: t("Connect your wallet to CADINU's Click-to-win."),
    },
    {
      label: t('Step %number%', { number: 2 }),
      title: t('Click to Win'),
      subtitle: t('Wait for your turn, then click the "click-to-win" button.'),
    },
    {
      label: t('Step %number%', { number: 3 }),
      title: t('Claim Rewards'),
      subtitle: t('Whenever you wish, you can claim your CADINU TOKEN rewards.'),
    },
  ]
  return (
    <Box width="100%">
      <Flex mb="40px" alignItems="center" flexDirection="column">
        <Heading mb="24px" scale="xl" color="secondary">
          {t('How to win')}
        </Heading>
        <Text textAlign="center">
          {t(
            'With each click, you will win some CADINU tokens!',
          )}
        </Text>
        <Text>{t('Simple!')}</Text>
      </Flex>
      <StepContainer>
        {steps.map((step) => (
          <StepCard key={step.label} step={step} />
        ))}
      </StepContainer>
      <Divider />
      {/* <GappedFlex flexDirection={['column', 'column', 'column', 'row']}> */}
        <Flex flex="24" flexDirection="column" >
          <Heading mb="24px" scale="lg" color="secondary">
            {t('Winning Criteria')}
          </Heading>

          <Text mb="16px" color="textSubtle" textAlign="justify">
            Whenever the rewards pool is evacuated, the maximum reward will be displayed as zero. We will immediately inform you on CADINU<span>&#39;</span>s social media after charging the rewards pool through click-to-win (C2W) opportunities. Follow CADINU<span>&#39;</span>s social media accounts and turn on its notifications to be one of the first users informed about the distribution of rewards and updates regarding CADINU TOKEN! Stay engaged with our C2W activities to earn CADINU TOKEN and maximize your rewards!
          </Text>
          <Text mb="16px" color="textSubtle" textAlign="justify">
            {`When participating in click-to-win (C2W) activities, please note that the minimum prize amount is ${minRewardAmount && minRewardAmount} CADINU tokens. However, it's important to keep in mind that the maximum prize amount can vary and may be different each time. So, before you click, you can check the current maximum reward on offer. This ensures that you know the potential prize you can earn before proceeding.`}
          </Text>
          <Text mb="16px" color="textSubtle" textAlign="justify">
            All click-to-win (C2W) operations within CADINU are conducted on the Binance Smart Chain (BSC). As a result, there is a gas fee associated with these transactions. For the first click, the gas fee is approximately 0.00035 BNB, while subsequent clicks incur a fee of about 0.00017 BNB. It<span>&#39;</span>s important to note that these gas fees can vary depending on the congestion level on the blockchain.

          </Text>

        </Flex>

    </Box>
  )
}

export default HowToPlay
