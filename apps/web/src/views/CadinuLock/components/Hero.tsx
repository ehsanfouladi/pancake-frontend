import { Box, Button, Flex, Heading, ProposalIcon } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { LockIcon } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Container from 'components/Layout/Container'
import Link from 'next/link'
import DesktopImage from './DesktopImage'

const StyledHero = styled(Box)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding-bottom: 32px;
  padding-top: 32px;
`

const Hero = () => {
  const { t } = useTranslation()

  return (
    <StyledHero>
      <Container>
        <Flex alignItems="center" justifyContent="space-between">
          <Box pr="32px">
            <Heading as="h1" scale="xxl" color="secondary" mb="16px">
              {t('Cadinu Lock')}
            </Heading>
            <Heading as="h3" scale="lg" mb="16px">
              {t('Lock your LP and add an optional vesting period for your tokens')}
            </Heading>
            <Link href="/cadinu-lock/create" passHref prefetch={false}>
              <Button startIcon={<LockIcon color="currentColor" width="24px" />}>{t('Create Lock')}</Button>
            </Link>
          </Box>
          {/* <DesktopImage src="/images/voting/voting-presents.png" width={361} height={214} /> */}
        </Flex>
      </Container>
    </StyledHero>
  )
}

export default Hero
