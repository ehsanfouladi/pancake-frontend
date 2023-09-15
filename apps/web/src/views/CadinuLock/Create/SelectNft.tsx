import { useTranslation } from "@pancakeswap/localization"
import { Box, Breadcrumbs, Button, Card, CardBody, CardHeader, Checkbox, Flex, Heading, Input, LinkExternal, PageSection, PaginationButton, Svg, Text, useToast } from "@pancakeswap/uikit"
import truncateHash from "@pancakeswap/utils/truncateHash"
import { nonfungiblePositionManagerABI } from "@pancakeswap/v3-sdk"
import BigNumber from "bignumber.js"
import ApproveConfirmButtons, { ButtonArrangement } from "components/ApproveConfirmButtons"
import ConnectWalletButton from "components/ConnectWalletButton"
import { PageMeta } from "components/Layout/Page"
import { ToastDescriptionWithTx } from "components/Toast"
import { CadinuLockV3Abi } from "config/abi/cadinuLockV3"
import { useToken } from "hooks/Tokens"
import useApproveConfirmTransaction from "hooks/useApproveConfirmTransaction"
import { useCallWithGasPriceNative } from "hooks/useCallWithGasPriceNative"
import useCbonApprovalStatus from "hooks/useCbonApprovalStatus"
import useCbonApprove from "hooks/useCbonApprove"
import { useCadinuLockContract, useCadinuLockV3Contract } from "hooks/useContract"
import useNftApprovalStatus from "hooks/useNftApprovalStatus"
import useNftApprove from "hooks/useNftApprove"
import isEmpty from "lodash/isEmpty"
import Link from "next/link"
import { useRouter } from "next/router"
import NotFoundPage from "pages/create-profile"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import styled, { css } from "styled-components"
import { getBlockExploreLink } from "utils"
import { getCadinuLockv3Address } from "utils/addressHelpers"
import { Address, parseEther } from "viem"
import { AppBody } from "views/ShowCase"
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi"
import { DatePicker, TimePicker } from "../components/DatePicker"
import ObjectSVG, { ObjectWithProperties } from "../components/createSvg"
import { PaymentOptions } from "../components/paymentOptions"
import { combineDateAndTime, getv3FormErrors } from "./helpers"
import { FormErrors, SecondaryLabel } from "./styles"
import { Formv3State } from "./types"

const SelectNft = ()=>{

  const Layout = styled.div`
  align-items: start;
  display: grid;
  grid-gap: 32px;
  grid-template-columns: minmax(0, 1fr);

  ${({ theme }) => theme.mediaQueries.lg} {
    grid-template-columns: 1fr 350px;
  }
  `
  const CreateLockPage = styled.div`
  min-height: calc(100vh - 50px);
  background: linear-gradient(135deg, #4c57a3 0%, #899dcf 100%);
  `

  const StyledHeading = styled(Heading)`
    font-family: Arial, Helvetica, sans-serif;
    font-size: 36px;
    font-weight: bold;
    color: #f7f7f7;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-stroke: 6px transparent;
    text-shadow: 0px 4px 4px rgba(7, 43, 76);
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 8px;
    
  `

  const StyledCard = styled(AppBody)`
  ${({ theme }) => theme.mediaQueries.lg} {
    ${
        css`
            &:hover {
              cursor: pointer;
              opacity: 0.6;
              transform : scale(1.05);
            }`
        }
    }
  `
  const {query} = useRouter()
  const {nfp} = query
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const [userAllNfts, setUserAllNfts] = useState([])
  const [selectedNft, setSelectedNft] = useState('')
  const [maxNumberOfNfts,setMaxNumberOfNfts] = useState(1)
  const [fetchSuccess, setFetchSuccess]=useState(false)
  const [state, setState] = useState<Formv3State>(() => ({
      nftId: 0,
      title: '',
      owner: '',
      lockUntilDate: null,
      lockUntilTime: null,
  }))

  const [ownerIsMe, setOwnerIsMe] = useState(true)
  const [isPayWithCbon, setIsPayWithCbon] = useState(false)
  const [priceInNative,setPriceInNative] = useState('')
  const [fieldsState, setFieldsState] = useState<{ [key: string]: boolean }>({})
  const [priceInCbon,setPriceInCbon] = useState('')
  // const [onPresentVoteDetailsModal] = useModal(<VoteDetailsModal/>)
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { push } = useRouter()
  const { toastSuccess, toastError } = useToast()
  
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const {
      nftId,
      title,
      owner,
      lockUntilDate,
      lockUntilTime
      } = state    
  
  const cadinuLockContract = useCadinuLockV3Contract()
  const {callWithGasPriceNative} = useCallWithGasPriceNative()
  
  const { setLastUpdated, allowance } = useCbonApprovalStatus(cadinuLockContract.address)
  const { setLastUpdated:setNftLastUpdated, isApproved:isNftApproved } = useNftApprovalStatus(
    cadinuLockContract.address,nfp,selectedNft
    )
  const {handleApprove:approveCbon} = useCbonApprove(
    setLastUpdated, cadinuLockContract.address, 'Cbon approved successfully!'
    )
  const {handleApprove:approveNft, pendingTx:isApproving} = useNftApprove(
    setLastUpdated, cadinuLockContract.address, 'Cbon approved successfully!',selectedNft, nfp
    )
  
  const formErrors = getv3FormErrors(state, t,ownerIsMe)

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
      evt.preventDefault()
  }


  const updateValue = (key: string, value: string | Date) => {
      setState((prevState) => ({
      ...prevState,
      [key]: value,
    }))

    // Keep track of what fields the user has attempted to edit
    setFieldsState((prevFieldsState) => ({
      ...prevFieldsState,
      [key]: true,
    }))
  }

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = evt.currentTarget
    updateValue(inputName, value)
  }

  const handleDateChange = (key: string) => (value: Date) => {
    updateValue(key, value)
  }

  const fetchUserNfts = async ()=>{
      try{
          setFetchSuccess(false)
          const userNfts = await (
              await fetch(`https://cadinu-locks.cadinu.io/v3/getNfts/${account}/${nfp}`)
              ).json()
          console.log('nfts', userNfts);
          setUserAllNfts(userNfts?.nfts?.positions)
          setMaxNumberOfNfts(userNfts?.balanceOf)
          
          setFetchSuccess(true)
      }catch(e){
          console.log(e);
          setFetchSuccess(false)
      }
      
  }
  useEffect(()=>{
    console.log('userAllNfts',userAllNfts);
    
      if(isEmpty(userAllNfts) && nfp && account){
          fetchUserNfts()
      }
      setMaxPage(Math.ceil(maxNumberOfNfts/PAGE_SIZE))
          console.log('maxPAge',maxPage);
          
  },[account,nfp])

  const {config, isSuccess, isLoading} = usePrepareContractWrite({
    address : getCadinuLockv3Address(),
    abi: CadinuLockV3Abi,
    functionName: isPayWithCbon ? 'lockByCbon': 'lockByNative',
    args: [
      ownerIsMe? account as Address: owner as Address,
      BigInt(selectedNft),
      nfp as Address,
      combineDateAndTime(lockUntilDate,lockUntilTime),
      title
    ],
    value: isPayWithCbon ? 0n : parseEther(priceInNative)
  })

  const {data,isLoading:isLockLoading,isSuccess:isLockSuccess,write:handleLock} = useContractWrite(
    config
    )

  useEffect(()=>{
    if(isLockSuccess && data.hash){
      toastSuccess(
        t('Lock Created Successfully!'),
        <ToastDescriptionWithTx txHash={data.hash} />,
        )
      }
  },[isLockSuccess])

  console.log('formErrors', formErrors);

return (
  <>
    <PageMeta />
      <CreateLockPage>
        <PageSection index={1} hasCurvedDivider={false}>
        <Box mb="24px" mt='-48px'>
          <Breadcrumbs>
            <Link href="/">{t('Home')}</Link>
            <Link href="/cadinu-lock">{t('Cadinu Lock')}</Link>
            <Link href="/cadinu-lock/create">{t('Create Cadinu Lock')}</Link>
            <Link href="/cadinu-lock/create/v3">{t('Select Position Manager')}</Link>
            <Text>{t('Create a Lock V3')}</Text>
          </Breadcrumbs>
        </Box>
          <StyledHeading>Select Your Position</StyledHeading>
        <form onSubmit={handleSubmit}>
          <Layout>
            {account ?
            <Flex
              width={['328px', '100%']}
              flexWrap="wrap"
              maxWidth="100%"
              height="100%"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              {userAllNfts.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE).map((nft)=>(
                <>
                <Box onClick={()=>setSelectedNft(nft.id)} >
                <ObjectSVG 
                nft={nft as ObjectWithProperties}
                selectedNft={selectedNft}
                />
                </Box>
                
                </>))
                }
                {maxPage > 1 &&
                <PaginationButton showMaxPageText currentPage={currentPage} setCurrentPage={setCurrentPage} maxPage={maxPage} /> 
                }
              </Flex>
             : (
                  <Card mt='20px'>
                    <CardBody>
                      <Box style={{textAlign:'center'}}>
                        <strong>Coonect Your Wallet To View Your Positions</strong>
                        <div>
                        <ConnectWalletButton mt='24px' />
                        </div>
                      </Box>
                    </CardBody>
                  </Card>

                )
                }
            <Card mt='20px'>
              <CardHeader>
                <Heading as="h3" scale="md">
                  {t('Lock Times')}
                </Heading>
              </CardHeader>
              <CardBody>
                  <>
                  <Box mb="24px">
              <SecondaryLabel htmlFor="title">{t('Title')}</SecondaryLabel>
              <Input 
              id="title" 
              name="title" 
              placeholder='Your Lock Title'
              value={title} 
              scale="sm" 
              onChange={handleChange} 
              required 
              />
              {formErrors.title && fieldsState.title && <FormErrors errors={formErrors.title} />}
            </Box>
                <Box mb="24px">
                  <SecondaryLabel>{t('Lock Until Date')}</SecondaryLabel>
                  <DatePicker
                    name="lockUntilDate"
                    onChange={handleDateChange('lockUntilDate')}
                    selected={lockUntilDate}
                    placeholderText="YYYY/MM/DD"
                  />
                  {formErrors.lockUntilDate && fieldsState.lockUntilDate && <FormErrors errors={formErrors.lockUntilDate} />}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel>{t('Lock Until Time')}</SecondaryLabel>
                  <TimePicker
                    name="lockUntilTime"
                    onChange={handleDateChange('lockUntilTime')}
                    selected={lockUntilTime}
                    placeholderText="00:00"
                  />
                  {formErrors.lockUntilTime && fieldsState.lockUntilTime && <FormErrors errors={formErrors.lockUntilTime} />}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel>{t('Nonfungible Position Manager Token ID:')}</SecondaryLabel>
                  <Input 
                  id="nftId" 
                  name="nftId" 
                  placeholder='0'
                  value={selectedNft} 
                  scale="sm" 
                  onChange={(e)=>setSelectedNft(e.target.value)} 
                  required />
                  {formErrors.nftId && fieldsState.nftId && <FormErrors errors={formErrors.nftId} />}
                </Box>
                </>
                
                <Box mb="24px">
              <span>
                <SecondaryLabel  htmlFor='ownerIsMe'>{t('Who Can Unlock The Tokens?')}</SecondaryLabel>
                </span>
                <span>
              <Checkbox
              id='ownerIsMe'
              name='ownerIsMe'
              defaultChecked
              onChange={()=>setOwnerIsMe(!ownerIsMe)}
              scale='sm'
              /> Me
              </span>
          </Box>
                {ownerIsMe ?
                account && (
                  <Flex alignItems="center" mb="24px">
                    <Text color="textSubtle" mr="16px">
                      {t('Owner:')}
                    </Text>
                    <LinkExternal isBscScan href={getBlockExploreLink(account, 'address')}>
                      {truncateHash(account)}
                    </LinkExternal>
                  </Flex>
                )
                :
                <Box mb="12px">
                  <SecondaryLabel>{t('someone else')}</SecondaryLabel>
                  <Input 
                  id="owner" 
                  name="owner" 
                  placeholder='0x000...'
                  value={owner} 
                  scale="sm" 
                  onChange={handleChange} 
                  required />
                  {formErrors.owner && fieldsState.owner && <FormErrors errors={formErrors.owner} />}
                </Box>
              }
              <hr />
              <SecondaryLabel style={{textAlign:'center'}}>Payment Method</SecondaryLabel>
              { PaymentOptions({
                isPayWithCbon,
                setIsPayWithCbon,
                cadinuLockContract,
                priceInCbon,
                setPriceInCbon,
                priceInNative,
                setPriceInNative
                })}
              {isPayWithCbon && allowance < BigNumber(Number(priceInCbon)) &&

                <>
                <Button 
                  onClick={()=>approveCbon()}
                  width='100%'
                  my='12px'
                  disabled={!isEmpty(formErrors)}
                >
                  Enable CBON
                </Button>

                </>

              }
              <hr />

                {account ? (
                  <>
                  
                  <ApproveConfirmButtons
                    isApproveDisabled={isNftApproved}
                    isApproving={isApproving}
                    isConfirmDisabled={!isEmpty(formErrors) && !isSuccess}
                    isConfirming={isLockLoading}
                    onApprove={approveNft}
                    onConfirm={handleLock}
                    buttonArrangement={ButtonArrangement.SEQUENTIAL}
                    confirmLabel={t('Lock')}
                    confirmId="LockInstant"
          />
                
                  </>
                ) : (
                  <ConnectWalletButton width="100%" type="button" />
                )}
              </CardBody>
            </Card>
          </Layout>
        </form>
        </PageSection>
      </CreateLockPage>
  </>
        )
}
export default SelectNft