import { Box, Button, Text, Heading, ProposalIcon, Flex, MoreIcon } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import Link from 'next/link'
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
              {t('Got a question?')}
            </Heading>
            <Text as="p">
              {t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ')}
            </Text>
            <Text as="p" mb="16px">
              {t(
                "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
              )}
            </Text>

            <Link href="https://cadinu.io" passHref prefetch={false}>
              <Button startIcon={<MoreIcon color="currentColor" width="24px" />}>{t('Read More')}</Button>
            </Link>
          </Box>
          {/* <DesktopImage src="/images/voting/voting-bunny.png" width={173} height={234} /> */}
        </Flex>
      </Container>
    </StyledFooter>
  )
}

export default Footer
