import { useTranslation } from "@pancakeswap/localization"
import { Box, Breadcrumbs, Button, Card, CardBody, CardHeader, Checkbox, Flex, Heading, Input, LinkExternal, PageSection, PaginationButton, Text, useToast } from "@pancakeswap/uikit"
import truncateHash from "@pancakeswap/utils/truncateHash"
import BigNumber from "bignumber.js"
import ApproveConfirmButtons, { ButtonArrangement } from "components/ApproveConfirmButtons"
import ConnectWalletButton from "components/ConnectWalletButton"
import { PageMeta } from "components/Layout/Page"
import { ToastDescriptionWithTx } from "components/Toast"
import { CadinuLockV3Abi } from "config/abi/cadinuLockV3"
import useCbonApprovalStatus from "hooks/useCbonApprovalStatus"
import useCbonApprove from "hooks/useCbonApprove"
import { useCadinuLockV3Contract } from "hooks/useContract"
import useNftApprovalStatus from "hooks/useNftApprovalStatus"
import useNftApprove from "hooks/useNftApprove"
import isEmpty from "lodash/isEmpty"
import Link from "next/link"
import { useRouter } from "next/router"
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { getBlockExploreLink } from "utils"
import { getCadinuLockv3Address } from "utils/addressHelpers"
import { Address, isAddress, parseEther } from "viem"
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi"
import { DatePicker, TimePicker } from "../components/DatePicker"
import { PaymentOptions } from "../components/paymentOptions"
import { combineDateAndTime, getv3FormErrors } from "./helpers"
import { FormErrors, SecondaryLabel } from "./styles"
import { Formv3State } from "./types"

export interface ObjectWithProperties {
  id: string;
  liquidity: string;
  pool: {
    token0: {
      name: string;
      symbol: string;
      decimals: string;
      id: string;
    };
    token1: {
      id: string;
      name: string;
      decimals: string;
      symbol: string;
    };
    feeTier: string;
    liquidity: string;
    id: string;
    sqrtPrice: string;
    tick: string;
    totalValueLockedToken0: string;
    totalValueLockedToken1: string;
  };
  tickLower: {
    id: string;
  };
  tickUpper: {
    id: string;
  };
  token0: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  token1: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
}
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

const SelectNft = ()=>{

  const {query} = useRouter()
  const {nfp} = query
  const PAGE_SIZE = 12;
  const [currentPage, setCurrentPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const [userAllNfts, setUserAllNfts] = useState([])
  const [selectedNft, setSelectedNft] = useState('')
  const [maxNumberOfNfts,setMaxNumberOfNfts] = useState(1)
  const [state, setState] = useState<Formv3State>(() => ({
      nftId: '',
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
  const { setLastUpdated, allowance } = useCbonApprovalStatus(cadinuLockContract.address)
  const { setLastUpdated:setNftLastUpdated, isApproved:isNftApproved } = useNftApprovalStatus(
    cadinuLockContract.address,nfp,nftId
    )
  const {handleApprove:approveCbon} = useCbonApprove(
    setLastUpdated, cadinuLockContract.address, 'Cbon approved successfully!'
    )
  const {handleApprove:approveNft, pendingTx:isApproving} = useNftApprove(
    setNftLastUpdated, cadinuLockContract.address, 'Position approved successfully!',nftId, nfp
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

  const fetchUserNfts = useCallback(async ()=>{
      try{
          const userNfts = await (
              await fetch(`https://cadinu-locks.cadinu.io/v3/getNfts/${account}/${nfp}`)
              ).json()
          console.log('nfts', userNfts);
          setUserAllNfts(userNfts?.nfts?.positions)
          setMaxNumberOfNfts(userNfts?.balanceOf)
          
      }catch(e){
          console.log(e);
      }
      
  },[account,nfp])

  const {data:nfpName, isSuccess:isNfpNameSuccess} = useContractRead({
    enabled: isAddress(nfp as Address),
    address: getCadinuLockv3Address(),
    abi: CadinuLockV3Abi,
    functionName: 'nonFungiblePositionManagerName',
    args:[nfp as Address]
  })
  useEffect(()=>{
      if(isEmpty(userAllNfts) && nfp && account){
          fetchUserNfts()
      }
      setMaxPage(Math.ceil(maxNumberOfNfts/PAGE_SIZE))
          console.log('maxPAge',maxPage);
          
  },[account,nfp])



  const showUserNfts = 
    // console.log('show nft refreshe');
    userAllNfts.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE).map((nft)=>(
      <>
        <Card
        key={nft.id}
        mx='24px'
        mt='20px'
        style={{
          height:'170px',
          width:'200px',
          cursor:'pointer',
          border:nftId === nft.id ? 'solid': 'none',
          borderWidth:'2px', borderColor:'#AA4A44'
          }}
        borderBackground={nftId === nft.id ? '#AA4A44': ''}
        onClick={()=>updateValue('nftId',nft.id)}
        >
            <CardHeader style={{textAlign:'center', height:'36px', padding:'12px'}}
            >
            
            <strong style={{padding:'5px'}}>{nfpName ? nfpName : 'Position Details'} # {nft.id}</strong>
            </CardHeader>
            <CardBody style={{textAlign:'center' ,padding:'5px'}}>
            <Box my='10px'>
              <strong style={{marginBottom:'5px'}}> Symbols:</strong>
      
              <Text mt='5px' > {nft.token0.symbol}/{nft.token1.symbol}</Text>
            </Box>
           
           
                {/* <Box mb='5px'>
            <strong style={{marginBottom:'5px'}}> Liquidity:</strong>
            <Text>{nft.liquidity}</Text>
                </Box> */}
                
            <Box mb='5px'>
            <strong style={{marginBottom:'5px'}}> Fee Tier:</strong>
    
            <Text >{(nft.pool.feeTier)/10000}</Text>
            </Box>
            </CardBody>
        </Card>
      </>
    )
    )
  console.log('refreshed', fieldsState);
  

  const {config, isSuccess, isLoading, isError} = usePrepareContractWrite({
    enabled: isEmpty(formErrors)  && isNftApproved,
    address : getCadinuLockv3Address(),
    abi: CadinuLockV3Abi,
    functionName: isPayWithCbon ? 'lockByCbon': 'lockByNative',
    args: [
      ownerIsMe? account as Address: owner as Address,
      BigInt(nftId),
      nfp as Address,
      combineDateAndTime(lockUntilDate,lockUntilTime),
      title
    ],
    value: isPayWithCbon ? 0n : parseEther(priceInNative),
    onError: (error)=>{
      console.log(error);
      
    }
  })

  const {data,isLoading:isLockLoading,isSuccess:isLockSuccess,error,write:handleLock} = useContractWrite(
    config
    )

  console.log(userAllNfts);
  

  useEffect(()=>{
    if(isLockSuccess && data.hash){
      toastSuccess(
        t('Lock Created Successfully!'),
        <ToastDescriptionWithTx txHash={data.hash} />,
        )
      }
  },[isLockSuccess])
  
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
              flexWrap='wrap'
              maxWidth="100%"
              // height="100%"
              // justifyContent="space-between"

              
              // alignItems="center"
              // position="relative"
            >
              {showUserNfts}
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
                <> 

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
                key='title'
                name="title" 
                placeholder='Your Lock Title'
                value={title} 
                scale="sm" 
                onChange={handleChange} 
                // autoFocus
                required 
                />
                {formErrors.title && fieldsState.title && <FormErrors errors={formErrors.title} />}
              </Box>
                <Box mb="24px">
                  <SecondaryLabel  htmlFor="lockUntilDate">{t('Lock Until Date')}</SecondaryLabel>
                  <DatePicker
                    name="lockUntilDate"
                    key='lockUntilDate'
                    onChange={handleDateChange('lockUntilDate')}
                    selected={lockUntilDate}
                    placeholderText="YYYY/MM/DD"
                  />
                  {formErrors.lockUntilDate && fieldsState.lockUntilDate && <FormErrors errors={formErrors.lockUntilDate} />}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel htmlFor="lockUntilTime">{t('Lock Until Time')}</SecondaryLabel>
                  <TimePicker
                    name="lockUntilTime"
                    key='lockUntilTime'
                    onChange={handleDateChange('lockUntilTime')}
                    selected={lockUntilTime}
                    placeholderText="00:00"
                  />
                  {formErrors.lockUntilTime && fieldsState.lockUntilTime && <FormErrors errors={formErrors.lockUntilTime} />}
                </Box>
                <Box mb="24px">
                  <SecondaryLabel htmlFor="nftId">{t('Nonfungible Position Manager Token ID:')}</SecondaryLabel>
                  <Input 
                  id="nftId" 
                  key='nftId'
                  name="nftId"
                  placeholder='0'
                  value={nftId} 
                  scale="sm" 
                  onChange={handleChange} 
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
                  {fieldsState.nftId ?
                  <ApproveConfirmButtons
                    isApproveDisabled={isNftApproved}
                    isApproving={isApproving}
                    isConfirmDisabled={!isEmpty(formErrors) && !isSuccess}
                    isConfirming={isLockLoading}
                    onApprove={approveNft}
                    onConfirm={handleLock}
                    buttonArrangement={ButtonArrangement.SEQUENTIAL}
                    confirmLabel={t('Lock')}
                    confirmId="LockV3Instant"
          /> :
                <Text textTransform='uppercase' textAlign='center'> Select or Input Your Token ID </Text> 
              
          }
                
                  </>
                ) : (
                  <ConnectWalletButton width="100%" type="button" />
                )}
              </CardBody>
            </Card>
        </>
          </Layout>
        </form>
        </PageSection>
      </CreateLockPage>
  </>
        )
}
export default SelectNft