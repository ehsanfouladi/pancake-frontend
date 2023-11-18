import { Box, Text, Heading, Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import Container from 'components/Layout/Container'
// import DesktopImage from './DesktopImage'

const StyledFooter = styled(Box)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding-bottom: 32px;
  padding-top: 32px;
`

const Footer = () => {
  const { t } = useTranslation()

  return (
    <StyledFooter>
      <Container>
        <Flex alignItems="center" justifyContent="space-between">
          <Box pr="32px">
            <Heading as="h2" scale="lg" mb="16px">
              {t('Cadinu Lock')}
            </Heading>
            <Text as="p">
              {t('Introducing Cadinu Lock, the ultimate solution for securing your tokens, liquidities and NFT positions (liquidity V3).')}
            </Text>
            <Text as="p" mb="16px">
              {t(
                "With Cadinu Lock, you can now have complete peace of mind knowing that your valuable assets are protected from any unauthorized access or manipulation. This innovative product offers a seamless and user-friendly interface, allowing you to effortlessly lock and safeguard your digital assets with just a few clicks. Whether you're a seasoned trader, token holder or a liquidity provider, Cadinu Lock ensures that your investments remain safe and secure.",
              )}
            </Text>
            <Text as="p" mb="16px">
              {t(
                "Don't compromise on the security of your assets – choose Cadinu Lock today and unlock a worry-free experience in the world of decentralized finance.",
              )}
            </Text>
            {/* <Link href="https://cadinu.io" passHref prefetch={false}>
              <Button startIcon={<MoreIcon color="currentColor" width="24px" />}>{t('Read More')}</Button>
            </Link> */}
          </Box>
          {/* <DesktopImage src="/images/voting/voting-bunny.png" width={173} height={234} /> */}
        </Flex>
      </Container>
    </StyledFooter>
  )
}

export default Footer
