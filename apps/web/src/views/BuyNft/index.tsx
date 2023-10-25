import { useTranslation } from '@pancakeswap/localization'
import { bscTokens } from '@pancakeswap/tokens'
import { Box, Button, Card, CardBody, Checkbox, Flex, Heading, Input, OptionProps, Select, Text, WarningIcon, useToast } from '@pancakeswap/uikit'
import { InfoBox } from '@pancakeswap/uikit/src/components/LiquidityChartRangeInput/InfoBox'
import ApproveConfirmButtons from 'components/ApproveConfirmButtons'
import Page from 'components/Layout/Page'
import { CadinuLevelNftsAbi } from 'config/abi/cadinuLevelNfts'
import { cadinuProfileAbi } from 'config/abi/cadinuProfile'
import { FetchStatus } from 'config/constants/types'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useBunnyFactory } from 'hooks/useContract'
import { useSessionStorage } from 'hooks/useSessionStorage'
import { useBSCCbonBalance } from 'hooks/useTokenBalance'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { ApiSingleTokenData } from 'state/nftMarket/types'
import { getCadinuProfileAddress } from 'utils/addressHelpers'
import { getCadinuLevelNftContract } from 'utils/contractHelpers'
import { Address, formatUnits, isAddress, zeroAddress } from 'viem'
import ProfileCreationProvider from 'views/ProfileCreation/contexts/ProfileCreationProvider'
import { readContracts, useAccount, useContractRead } from 'wagmi'
import SelectionCard from '../ProfileCreation/SelectionCard'
import TabMenu from '../ProfileCreation/TabMenu'
import { MINT_COST } from '../ProfileCreation/config'
import { getNftImage } from '../ProfileCreation/helper'

export enum NftType {
  ALL = 'all',
  MYNFTS = 'myNFTs'
}
interface MintNftData extends ApiSingleTokenData {
  dogId?: string
}
interface State {
  nftType: NftType
}

const Mint: React.FC<React.PropsWithChildren> = () => {
  const {address: account} = useAccount()
  // const {query} = useRouter()
  // const ref = query.ref && isAddress(query.ref as Address) ? query.ref : zeroAddress
  const [state, setState] = useSessionStorage<State>('nft-filter', {
    nftType: NftType.ALL,
  })
  const { nftType } = state
  const handleNftTypeChange = (newNftType: NftType) => {
    setState((prevState) => ({
      ...prevState,
      nftType: newNftType,
  }))
}

  const [selectedDogId, setSelectedDogId] = useState<Address>(zeroAddress)
  // const [starterNfts, setStarterNfts] = useState<MintNftData[]>([])
  const [nftData, setNftData] = useState(null)
  const [myNfts, setMyNfts] = useState([])
  const [nftContract, setNftContract] = useState(null)
  const [level, setLevel] = useState<number>(1)
  const [priceInCbon, setPriceInCbon] = useState<bigint>(0n)

  const [targetAddress,setTargetAddress] = useState<Address>(account)
  const [buyForOthers,setBuyForOthers] = useState<boolean>(false)
  const [haveReferral,setHaveReferral] = useState<boolean>(false)

  const [numberToBuy, setNumberToBuy] = useState<string>('1')
  const [referralAddress,setReferralAddress] = useState<Address>( zeroAddress )

//   const { actions, allowance } = useProfileCreation()
  const { toastSuccess } = useToast()

  const bunnyFactoryContract = useBunnyFactory()
  const { t } = useTranslation()
  // const { balance: cakeBalance, fetchStatus } = useBSCCakeBalance()
  const {balance : cbonBalance, fetchStatus} = useBSCCbonBalance()
  const hasMinimumCbonRequired = fetchStatus === FetchStatus.Fetched && cbonBalance >= MINT_COST
  const { callWithGasPrice } = useCallWithGasPrice()
  
  const {data: CIAAddresses} = useContractRead({
    abi : cadinuProfileAbi,
    address: getCadinuProfileAddress(),
    functionName: 'getNftAddressesForLevel',
    args: [BigInt(level)],
    watch:false
  })

  const getNftDatas = useCallback(async()=>{
    if (CIAAddresses && CIAAddresses.length !== 0){
      const nftDataTemp = {}
      const myNftAdresses = []
      CIAAddresses.map( async (nftAddress)=>{
        const tempNftContract = {
          abi: CadinuLevelNftsAbi,
          address: nftAddress,
        }
        const data = await  readContracts({
          contracts :[
            {
            ...tempNftContract,
            functionName: 'tokenURI',
            args: [BigInt(1)]
          },
          {
            ...tempNftContract,
            functionName:'tokensOfOwner',
            args:[account]
          },
          {
            ...tempNftContract,
            functionName:'priceInCbon',
          }

          ]
        })
        if(data[2].status==='success'){
          setPriceInCbon(data[2].result)
        }
        if(data[1].result && data[1].result.length > 0){
          myNftAdresses.push(nftAddress)
          console.log("data1",data[1])
        }
        nftDataTemp[`${nftAddress}`] = {}
        nftDataTemp[`${nftAddress}`].data = {}
        nftDataTemp[`${nftAddress}`].url = data[0].result
        if (data[0].status==='success'){
          nftDataTemp[`${nftAddress}`].data = await(await fetch(nftDataTemp[`${nftAddress}`].url)).json()
        }
        // nftDataTemp[nftAddress.toString()]['data'] = {}

      });
    setNftData(nftDataTemp)
    setMyNfts(myNftAdresses)
    
    }
  }, CIAAddresses)

  

  const handleLevelChange = useCallback((option: OptionProps): void => {
    setLevel(Number(option.value))
  }, [])

  useEffect(()=>{
    const contract = getCadinuLevelNftContract(selectedDogId)
    setNftContract(contract)
    getNftDatas()
  },[selectedDogId])

  const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      token: bscTokens.cbon,
      spender: selectedDogId,
      minAmount: MINT_COST,
      targetAmount: MINT_COST,
      onConfirm: () => {
        return callWithGasPrice(
          nftContract,
          'buyNFTs',
          [
            buyForOthers ? targetAddress : account, 
            BigInt(numberToBuy),
            haveReferral ? referralAddress : zeroAddress
          ]
          )
      },
      
      onApproveSuccess: () => {
        toastSuccess(t('Enabled'), t("Press 'confirm' to mint this NFT"))
      },
      onSuccess: () => {
        toastSuccess(t('Success'), t('You have minted your starter NFT'))
        // actions.nextStep()
      },
    })

  return (
    <ProfileCreationProvider>
        <Page>
          {/* <Header /> */}
    <>
    
      {/* <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 1 })}
      </Text> */}
      <Heading as="h3" scale="xl" mb="24px">
        {t('Get Starter Collectible')}
      </Heading>
      {/* <Text as="p">{t("Every profile starts by minting a Cadinu Identity Arts' NFT.")}</Text>
      
      <Text as="p">{t('This NFT will also become your first profile picture.')}</Text> */}
      <Text as="p" mb="24px">
        {t("Your profile points will be increased after purchasing every Cadinu Identity Arts' Nfts")}
      </Text>
      <Text as="p" mb="24px">
        {t("Don't have a profile yet?")}
      <Link  href="/create-profile" style={{marginLeft:'10px'}}>
        <Button mb="24px" scale="sm" variant="secondary">
          {t('Create Profile')}
        </Button>
      </Link>
      </Text>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            {t('Choose your Character!')}
          </Heading>
          <Text as='p' mb="24px" color="textSubtle">{t('If you have a referral address, you can enjoy a 10% discount on your purchase.')}</Text>
          {nftType === NftType.ALL && (<>
          <Flex justifyContent='start' m='1.5%'>
        <Box width="100%" verticalAlign='center'>
        <Box mt='8px' ml='-5px'>
      <Checkbox
      id='haveRef'
      type='checkbox'
      defaultChecked={
        haveReferral
      }
      onChange={()=>setHaveReferral(!haveReferral)}
      scale='sm'
      />
        <label htmlFor='haveRef' style={{fontWeight:'bold', marginLeft:'5px'}}>
        {/* <Text my='5px' bold> */}
         Have Referral? 
        {/* </Text> */}
      </label>
    </Box>
    {haveReferral  &&
    <>
    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for */}
      <label htmlFor='refAddress' ><Text my='5px' bold>Referral Address:</Text></label>
      <Input
      id='refAddress'
      value={referralAddress}
      onChange={(e)=>setReferralAddress(e.target.value as Address)}
      />
    </>
    }
   <Box mt='8px' ml='-5px'>
      <Checkbox
      id='buyForOthers'
      type='checkbox'
      defaultChecked={false}
      onChange={()=>setBuyForOthers(!buyForOthers)}
      scale='sm'
      />
    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for */}
      <label htmlFor='buyForOthers' style={{fontWeight:'bold', marginLeft:'5px'}}>
          Buy NFT for someone else?
      </label>
    </Box>
      {buyForOthers &&
      <>
    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for */}
      <label >
        <Text my='5px' bold>Target Address:</Text>
      </label>
      <Input
        value={targetAddress}
        onChange={(e)=>setTargetAddress(e.target.value as Address)}
        />
      
      </>
      }
    
    </Box>
    </Flex>
    </>
    )}
    <Select 
    placeHolderText ='Select Level'
    options={[
      {
        label: t('Level 1'),
        value: '1',
      },
      // {
      //   label: t('Level 2'),
      //   value: '2',
      // },
      // {
      //   label: t('Level 3'),
      //   value: '3',
      // },
      // {
      //   label: t('Level 4'),
      //   value: '4',
      // },
      // {
      //   label: t('Level 5'),
      //   value: '5',
      // },
      // {
      //   label: t('Level 6'),
      //   value: '6',
      // },
      // {
      //   label: t('Level 7'),
      //   value: '7',
      // },
      // {
      //   label: t('Level 8'),
      //   value: '8',
      // },
      // {
      //   label: t('Level 9'),
      //   value: '9',
      // },
      // {
      //   label: t('Level 10'),
      //   value: '10',
      // },
    ]}
    onOptionChange={handleLevelChange}
    />
    
    
      <TabMenu nftType={nftType} onTypeChange={handleNftTypeChange} account={account}/>
          {nftType===NftType.ALL && nftData && CIAAddresses.map((nft) => {
            const handleChange = (value: Address) => setSelectedDogId(value)
            
              return (
                <SelectionCard
                key={nftData[nft]?.data.name}
                name="mintStarter"
                value={nft}
                image={getNftImage(nft)}
                isChecked={selectedDogId === nft}
                onChange={handleChange}
                disabled={isApproving || isConfirming || isConfirmed || !hasMinimumCbonRequired}
                >
                  {/* <Grid style={{ gap: '16px' }} maxWidth="360px" > */}
                <Flex flexDirection='row' width='100%' flexWrap='wrap'>
                <Text bold>{nftData[nft] ? nftData[nft].data.name: ''}</Text>
                {selectedDogId === nft && <>
                <Input
                value={numberToBuy}
                onChange={(e)=>setNumberToBuy(e.target.value)}
                type='number'
                placeholder='Number of NFTs to purchase'
                scale='sm'
                />
                </>}
                </Flex>
                {/* </Grid> */}
              </SelectionCard>
              )
            
          })}
        {nftType===NftType.MYNFTS && nftData &&( myNfts.length >0 ?(
          myNfts.map((nft) => {
            const handleChange = (value: Address) => setSelectedDogId(value)
            
              return (
                <SelectionCard
                key={nftData[nft]?.data.name}
                name="mintStarter"
                value={nft}
                image={getNftImage(nft)}
                isChecked={selectedDogId === nft}
                onChange={handleChange}
                disabled={isApproving || isConfirming || isConfirmed }
                >
                <Text bold>{nftData[nft] ? nftData[nft].data.name: ''}</Text>
              </SelectionCard>
              )
            
          }
        )
      ):
        (
          <InfoBox message="You Don't Have Any Nfts" icon={<WarningIcon />} />
        ))}
          {!hasMinimumCbonRequired && (
            <Text color="failure" mb="16px">
              {t('A minimum of %num% CBON is required', { num: formatUnits(priceInCbon, 18) })}
            </Text>
            
          )}
          {nftType===NftType.ALL && 
          <ApproveConfirmButtons
            isApproveDisabled={selectedDogId === null || isConfirmed || isConfirming || isApproved}
            isApproving={isApproving}
            isConfirmDisabled={!isApproved || isConfirmed || !hasMinimumCbonRequired}
            isConfirming={isConfirming}
            onApprove={handleApprove}
            onConfirm={handleConfirm}
          />}
        </CardBody>
      </Card>
      {/* <NextStepButton onClick={actions.nextStep} disabled={myNfts.length === 0 && !isConfirmed}>
        {t('Next Step')}
      </NextStepButton> */}
    </>
    </Page>
    </ProfileCreationProvider>
  )
}

export default Mint
