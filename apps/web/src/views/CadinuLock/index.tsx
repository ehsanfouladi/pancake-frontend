import { Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'
import Footer from './components/Footer'
import Hero from './components/Hero'
import { Locks } from './components/Locks'

const Chrome = styled.div`
  flex: none;
`

const Content = styled.div`
  flex: 1;
  height: 100%;
`

const CadinuLock = () => {
  return (
    <>
      <Flex flexDirection="column" minHeight="calc(100vh - 64px)">
        <Chrome>
          <Hero />
        </Chrome>
        <Content>
          <Locks />
        </Content>
        <Chrome>
          <Footer />
        </Chrome>
      </Flex>
    </>
  )
}

export default CadinuLock
