import styled from "styled-components";
import {Balance, Box, Button, Flex, Modal, ModalBody, ModalHeader, Text} from "@pancakeswap/uikit";
import BigNumber from "bignumber.js";
import Link from "next/link";
import BuyTicketsButton from "./BuyTicketsButton";

const StyledModal = styled(Modal)`
  
  & > :nth-child(2) {
    padding: 0;
    align-items: center;
    text-align: center;
  }
  
 

  ${({ theme }) => theme.mediaQueries.md} {
    width: 380px;
  }
`


interface WinRateModalProps {
  onDismiss?: () => void
  reward:any
}
const handleRender = (onDissmiss, b) => {
  setTimeout(() => {
  onDissmiss(b)
  }, 1000);
}
const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradientGold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const StyledButton = styled(Button)<{ disabled: boolean }>`
  background: ${({ theme, disabled}) =>
    disabled ? theme.colors.disabled : 'linear-gradient(180deg, #7645d9 50%, #452a7a 100%)'};
  width: 200px;
  ${({ theme }) => theme.mediaQueries.xs} {
    width: 240px;
      }
  `

const WinRateModal: React.FC<React.PropsWithChildren<WinRateModalProps>> = ({
  onDismiss,
  reward
}) => {
    return (
    <StyledModal
      title='Congratulations!'
      onDismiss={onDismiss}
      headerBackground="gradientCardHeader"
    >
 <Flex flexDirection="column" mb="8px">
     <Box >
            <Text color="primary" bold fontSize="22px" textAlign='center' textTransform="uppercase" as="h2">
                YOU WON
            </Text>
                <PrizeTotalBalance fontSize="64px" bold textAlign='center' unit='' value={reward} mb="8px" decimals={0} />
            <Text color="primary" bold fontSize="22px" textAlign='center' textTransform="uppercase" as="h2">
                CADINU
            </Text>
            <Text color="textSubtle" ml="4px" bold fontSize="16px" textAlign='center' textTransform="uppercase" as="div">
              want to win even more?
            </Text>
            <Link href='/lottery' onClick={()=>handleRender(onDismiss, true)}>
                <StyledButton disabled = {false} themeMode="light"  >
                     Buy Lottery Ticket Now
                 </StyledButton>
            </Link>
          </Box>

    </Flex>
    </StyledModal>
    )
}
export default WinRateModal
