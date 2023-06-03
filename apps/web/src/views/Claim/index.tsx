import styled from 'styled-components'
import {  useState} from "react";
import { Flex, PageSection } from '@pancakeswap/uikit'
import {CNY_TITLE_BG, GET_TICKETS_BG} from './pageSectionStyles'
import {PageMeta} from '../../components/Layout/Page'
import Hero from "./components/Hero";
import NextDrawCard from "./components/NextClaimCard";
import HowToClaim from "./components/HowToClaim";

const ClaimPage = styled.div`
  max-height: calc(1100vh - 64px);`
const Claim = () => {
    const [disabled, setDisabled] = useState (false)
    const [isSuccess, setIsSuccess] = useState(false)

    return (
        <>
          <PageMeta />
          <ClaimPage>
              <PageSection background={CNY_TITLE_BG} index={2}  clipFill={{ light: '#19A7CE' }}>
                  <Hero disabled={disabled} setDisabled={setDisabled} setIsSuccess={setIsSuccess} isSuccess={isSuccess} />
              </PageSection>
               <PageSection
              containerProps={{ style: { marginTop: '-30px' } }}
              background={GET_TICKETS_BG}
              concaveDivider
              // hasCurvedDivider
              clipFill={{ light: '#146C94' }}
              dividerPosition="bottom"
              index={1}
            >
              <Flex alignItems="center" justifyContent="center" flexDirection="column"  pt="24px">
                <NextDrawCard isSuccess={isSuccess} />
              </Flex>
            </PageSection>
              <PageSection index={3}>
                  <HowToClaim />
              </PageSection>
          </ClaimPage>
        </>
      )
    }
    export default Claim
