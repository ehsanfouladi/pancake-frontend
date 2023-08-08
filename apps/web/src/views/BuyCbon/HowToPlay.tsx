import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Heading, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBorder};
  height: 1px;
  margin: 40px 0;
  width: 100%;
`

const BulletList = styled.ul`
  list-style-type: none;
  margin-left: 8px;
  padding: 0;
  li {
    margin: 0;
    padding: 0;
  }
  li::before {
    content: '•';
    margin-right: 4px;
    color: ${({ theme }) => theme.colors.textSubtle};
  }
  li::marker {
    font-size: 12px;
  }
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
      <StepCardInner height={['295px', '275px', null, '275px']}>
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

const GappedFlex = styled(Flex)`
  gap: 24px;
`

const HowToPlay: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()

  const steps: Step[] = [
    {
      label: t('Step %number%', { number: 1 }),
      title: t('Connect Your Wallet'),
      subtitle: t(
        'To get started, connect your compatible wallet (e.g., MetaMask) to our platform. Ensure you are on the Binance Smart Chain (BSC) network.',
      ),
    },
    {
      label: t('Step %number%', { number: 2 }),
      title: t('Exchange BNB for CBON'),
      subtitle: t(' Enter the specific amount of BNB you wish to exchange  for CBON and press the button "Get CBON". '),
    },
    {
      label: t('Step %number%', { number: 3 }),
      title: t('Confirm Purchase'),
      subtitle: t(
        'Confirm the transaction in your wallet to complete purchasing. Double-check the details before proceeding.',
      ),
    },
  ]
  return (
    <Box width="100%">
      <Flex mb="40px" alignItems="center" flexDirection="column">
        <Heading mb="24px" scale="xl" color="secondary" textAlign="center">
          {t('Participating in CBON PreSale')}
        </Heading>
      </Flex>
      <StepContainer>
        {steps.map((step) => (
          <StepCard key={step.label} step={step} />
        ))}
      </StepContainer>
      <Divider />
      <GappedFlex flexDirection={['column', 'column', 'column', 'row']}>
        <Flex flex="2" flexDirection="column">
          <Heading mb="24px" scale="lg" color="secondary">
            {t("That's it! ")}
          </Heading>
          <Heading mb="24px" scale="md">
            {t(
              "You've successfully participated in the CBON PreSale. For displaying your CBON balance, Add it manually to your wallet.  CBON balance will be updated in real-time on your wallet.",
            )}
          </Heading>
          <Text mb="16px" color="textSubtle">
            {t('Note:')}
          </Text>
          <BulletList>
            <li>
              <Text display="inline" color="textSubtle">
                {t(
                  'Please note that participation in the CBON PreSale is open for all, so just ready your BNB in your wallet and start investing in your future.',
                )}
              </Text>
            </li>
            <li>
              <Text display="inline" color="textSubtle">
                {t(
                  'If you encounter any issues or need assistance, our support team is always ready to help For support, reach us on ',
                )}
                <a href="https://t.me/cadinuLover">Telegram</a>.
              </Text>
            </li>
          </BulletList>
        </Flex>
      </GappedFlex>
    </Box>
  )
}

export default HowToPlay
