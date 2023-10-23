import { useTranslation } from '@pancakeswap/localization'
import {
  AutoRenewIcon, Button,
  Card,
  CardBody,
  Flex,
  Heading, NextLinkFromReactRouter,
  OptionProps, Select,
  Skeleton,
  Text,
  useToast
} from '@pancakeswap/uikit'
import { CadinuLevelNftsAbi } from 'config/abi/cadinuLevelNfts'
import { cadinuProfileAbi } from 'config/abi/cadinuProfile'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { getCadinuProfileAddress } from 'utils/addressHelpers'
import { getErc721Contract } from 'utils/contractHelpers'
import { Address } from 'viem'
import { readContracts, useAccount, useContractRead, useWalletClient } from 'wagmi'
import NextStepButton from './NextStepButton'
import SelectionCard from './SelectionCard'
import { ProfileCreationContext } from './contexts/ProfileCreationProvider'
import { getNftImage } from './helper'

const Link = styled(NextLinkFromReactRouter)`
  color: ${({ theme }) => theme.colors.primary};
`

const NftWrapper = styled.div`
  margin-bottom: 24px;
  
`

const ProfilePicture: React.FC = () => {
  const { address: account } = useAccount()
  const [isApproved, setIsApproved] = useState(false)
  const { selectedNft, actions } = useContext(ProfileCreationContext)
  const [level, setLevel] = useState<number>(1)
  const [nftData, setNftData] = useState(null)
  const [myNfts, setMyNfts] = useState({})

 const handleLevelChange = useCallback((option: OptionProps): void => {
    setLevel(Number(option.value))
  }, [])

  
  const {data: CIAAddresses} = useContractRead({
    abi : cadinuProfileAbi,
    address: getCadinuProfileAddress(),
    functionName: 'getNftAddressesForLevel',
    args: [BigInt(level)], 
    watch: false
  })

  const getNftDatas = useCallback(async()=>{
    if (CIAAddresses.length !== 0){
      const nftDataTemp = {}
      const myNftAdresses = {}
      CIAAddresses.map( async (nftAddress)=>{
        const nftContract = {
          abi: CadinuLevelNftsAbi,
          address: nftAddress,
        }
        const data = await  readContracts({
          contracts :[
            {
            ...nftContract,
            functionName: 'tokenURI',
            args: [BigInt(1)]
          },
          {
            ...nftContract,
            functionName:'tokensOfOwner',
            args:[account]
          }

          ]
        })
        if(data[1].result && data[1].result.length > 0){
          myNftAdresses[`${nftAddress}`] ={}
          myNftAdresses[`${nftAddress}`].tokenId = data[1].result
        }
        console.log('myNftAdresses',myNftAdresses);
        nftDataTemp[`${nftAddress}`] = {}
        nftDataTemp[`${nftAddress}`].data = {}
        nftDataTemp[`${nftAddress}`].url = data[0].result
        if (data[0].status==='success'){
          nftDataTemp[`${nftAddress}`].data = await(await fetch(nftDataTemp[`${nftAddress}`].url)).json()
        }
        
      });
    setNftData(nftDataTemp)
    setMyNfts(myNftAdresses)
    }
  }, CIAAddresses)

  useEffect(() => {
    if(!nftData){
      getNftDatas()
    }
  },[nftData])

  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: isApproving } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const { data: walletClient } = useWalletClient()

  const handleApprove = async () => {
    const contract = getErc721Contract(selectedNft.collectionAddress, walletClient)
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(contract, 'approve', [getCadinuProfileAddress(), BigInt(selectedNft.tokenId)])
    })
    if (receipt?.status) {
      toastSuccess(t('Enabled'), t('Please progress to the next step.'))
      setIsApproved(true)
    }
  }
  // const getNftImage = (nft) =>{
  //   switch (nft){
  //     case '0xbe548336c849aa2B7415A62702c5F3D5f64D9F7e':
  //       return 'images/nfts/cadinu_nft_artist_250.png'
  //       break;
  //     case '0xcB6165e1fFA6426B5bB596ec806Cae3c356ad366':
  //       return 'images/nfts/cadinu_nft_business_250.png'
  //       break;
  //     case '0xC0Dda5d8706ccE72487438Ea4Af5dc03Ef6B12a2':
  //       return 'images/nfts/cadinu_nft_cowboy_250.png'
  //       break;
  //     case '0xc24397e0766CC7E52Ce0D281bef590e644226312':
  //       return 'images/nfts/cadinu_nft_loyalty_250.png'
  //       break;
  //       case '0xeFe7b3853e05C6f39f2c57fe4566cb0A6bc640Cd':
  //         return 'images/nfts/cadinu_nft_futuristic_250.png'
  //         break;
  //         case '0x933834fe626BDD84A4F7a4Db96132a1029a80fbd':
  //           return 'images/nfts/cadinu_nft_hunter_250.png'
  //       break;
  //   }  
  // }

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 2 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Set Profile Picture')}
      </Heading>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            {t('Choose collectible')}
          </Heading>
          <Text as="p" color="textSubtle">
            {t('Choose a profile picture from the eligible collectibles (NFT) in your wallet, shown below.')}
          </Text>
          <Text as="p" color="textSubtle" mb="24px">
            {t('Only approved Cadinu Identity Art NFTs can be used.')}
          </Text>
          <Select 
          mb='15px'
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
          <NftWrapper>
            {Object.keys(myNfts).length ? (
              Object.keys(myNfts)
                // .filter((walletNft) => walletNft.location === NftLocation.WALLET)
                .map((walletNft) => {
                 return (
                  myNfts[walletNft].tokenId.map(tokenId=>{
                    return(
                      <SelectionCard
                  name="profilePicture"
                  key={`${walletNft}#${tokenId}`}
                  value={walletNft}
                  image={getNftImage(walletNft)}
                  isChecked={walletNft === selectedNft.collectionAddress}
                  onChange={(value: string) => actions.setSelectedNft(tokenId.toString(), value as Address)}
                  >
                      <Flex flexDirection='row' verticalAlign='center' width='100%' flexWrap='wrap' maxHeight='80px' >
                        <>
                        <Text bold style={{position:'inherit'}}>{nftData[walletNft] 
                        ?`${nftData[walletNft].data.name} #${tokenId}`
                        : ''}
                        </Text>
                      </>
                        </Flex>
                    </SelectionCard>
                        )
                      })
                  )
                })
            ) : (
              <Skeleton width="100%" height="64px" />
            )}
          </NftWrapper>
          <Heading as="h4" scale="lg" mb="8px">
            {t('Allow collectible to be locked')}
          </Heading>
          <Text as="p" color="textSubtle" mb="16px">
            {t(
              "The collectible you've chosen will be locked in a smart contract while it’s being used as your profile picture. Don't worry - you'll be able to get it back at any time.",
            )}
          </Text>
          <Button
            isLoading={isApproving}
            disabled={isApproved || isApproving || selectedNft.tokenId === null}
            onClick={handleApprove}
            endIcon={isApproving ? <AutoRenewIcon spin color="currentColor" /> : undefined}
            id="approveStarterCollectible"
          >
            {t('Enable')}
          </Button>
        </CardBody>
      </Card>
      <NextStepButton onClick={actions.nextStep} disabled={selectedNft.tokenId === null || !isApproved || isApproving}>
        {t('Next Step')}
      </NextStepButton>
    </>
  )
}

export default ProfilePicture
