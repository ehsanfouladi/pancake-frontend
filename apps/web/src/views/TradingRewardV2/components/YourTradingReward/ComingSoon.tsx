import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Link, Text, TwitterIcon } from '@pancakeswap/uikit'
import Image from 'next/image'

const ComingSoon = () => {
  const { t } = useTranslation()

  return (
    <Flex flexDirection="column">
      <Box style={{justifyItems:'center', textAlign:'center'}}>
      <Image
        src='/images/nfts/no-profile-md.png'
        width={80}
        height={80}
        alt='cadinu placeholder image'
      />
      </Box>
      <Text mt="16px" bold textAlign="center">
        {t('Coming Soon!')}
      </Text>
      <Text textAlign="center" fontSize="14px" color="textSubtle" mt="8px">
        {t('Currently there is no active trading reward campaign. Check back later or follow our social channels.')}
      </Text>
      <Flex pt="20px" justifyContent="center">
        <Link href="https://twitter.com/CADINUTOKEN?s=08" external>
          <TwitterIcon color="primary" mr="5px" />
          <Text bold color="primary" textAlign="center">
            {t('+Follow For New Updates')}
          </Text>
        </Link>
      </Flex>
    </Flex>
  )
}

export default ComingSoon
