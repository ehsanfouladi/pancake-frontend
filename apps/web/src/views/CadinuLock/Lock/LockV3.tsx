import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import { Box, Breadcrumbs, Button, Card, CardBody, CardFooter, CardHeader, Container, Flex, Heading, LinkExternal, PaginationButton, Skeleton, Text, TimerIcon, useTooltip } from '@pancakeswap/uikit'
import { CardWrapper } from '@pancakeswap/uikit/src/widgets/Liquidity'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { CadinuLockV3Abi } from 'config/abi/cadinuLockV3'
import isEmpty  from 'lodash/isEmpty'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { NftCardFetchStatus } from 'state/types'
import { getCadinuLockv3Address } from 'utils/addressHelpers'
import { publicClient } from 'utils/wagmi'
import { createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'
import Page from 'views/Page'
import { Address, erc20ABI, readContracts, useAccount, useWaitForTransaction, useWalletClient } from 'wagmi'
import { fetchLocksForNonFungiblePositionManager } from '../helpers'
import Link from 'next/link'



interface State {
  nftFetchStatus : NftCardFetchStatus
  myNftFetchStatus : NftCardFetchStatus
}

interface EndTimeTooltipComponentProps {
    endTime: number;
  }

interface  PositionType {
    token0: Address;
    token1: Address;
    fee: number;
    liquidity: bigint;
  }
const LockV3AbiMin = [
    {
      "inputs":[
        {"internalType":"address","name":"_user","type":"address"},
        {"internalType":"uint256","name":"_start","type":"uint256"},
        {"internalType":"uint256","name":"_end","type":"uint256"}
      ],
      "name":"getLocksForUser",
      "outputs":[
        {"internalType":"uint256","name":"","type":"uint256"},
        {"components":[
          {"internalType":"uint256","name":"lockId","type":"uint256"},
          {"internalType":"uint256","name":"nftId","type":"uint256"},
          {"internalType":"address","name":"nonFungiblePositionManagerAddress","type":"address"},
          {"internalType":"address","name":"owner","type":"address"},
          {"internalType":"uint256","name":"lockDate","type":"uint256"},
          {"internalType":"uint256","name":"unlockDate","type":"uint256"},
          {"internalType":"bool","name":"isUnlocked","type":"bool"},
          {"internalType":"string","name":"description","type":"string"}
        ],
        "internalType":"struct LiquidityLockV3.Lock[]",
        "name":"","type":"tuple[]"}
      ],
      "stateMutability":"view","type":"function"
    }
  ] as const

  const LockV3Contract = {
    address: getCadinuLockv3Address(),
    abi: CadinuLockV3Abi
}   
const LockV3ContractMin = {
  address: getCadinuLockv3Address(),
  abi: LockV3AbiMin
}    


export const LockV3 = ({tokenId, isMyLock, lockId} : {tokenId : Address, isMyLock: boolean, lockId:string}) => {

  const [state, setState] = useState<State>( {
    nftFetchStatus : NftCardFetchStatus.NOTFETCHED,
    myNftFetchStatus : NftCardFetchStatus.NOTFETCHED
    // positionStatus : NftPositionFetchStatus.NOTFETCHED
  })
  const { nftFetchStatus , myNftFetchStatus} = state

  const handleNftFetchStatusChange = (newNftFetchStatus: NftCardFetchStatus) =>{
    setState((prevState) =>({
      ...prevState,
      nftFetchStatus : newNftFetchStatus,
    }))
  }

  const handleMyNftFetchStatusChange = (newNftFetchStatus: NftCardFetchStatus) =>{
    setState((prevState) =>({
      ...prevState,
      myNftFetchStatus : newNftFetchStatus,
    }))
  }

  // const handlePositionFetchStatusChange = (newFetchStatus: NftPositionFetchStatus) =>{
  //   setState((prevState) =>({
  //     ...prevState,
  //     positionStatus : newFetchStatus,
  //   }))
  // }

  const PAGE_SIZE = 8
  const [currentPage, setCurrentPage]= useState(1)
  const [nfts, setNfts] = useState([])
  const [cardTitle,setCardTitle] = useState("")
  const [fetchedData, setFetchedData] = useState([])
  const [positionTokens, setPositionsTokens] = useState({token0:"" as Address, token1:"" as Address})
  const [maxPage, setMaxPage] = useState(1)
  const {address:account} = useAccount()
  const [positionData,setPositionsData] = useState({}as PositionType)
  const [positions, setPositions] = useState ([])
  const [lpNameSymbols,setLpNameSymbols] = useState([])
  const [maxNumberOfNfts, setMaxNumberOfNfts] = useState(0)
  
  const client = createPublicClient({ 
    chain: bsc,
    transport: http()
  })

  
  const {data : walletClient} =  useWalletClient()
  const [hash,setHash] = useState("")
  const handleUnlock = async (id)=>{
  
      const {request} = await client.simulateContract({
        account,
        address:getCadinuLockv3Address(),
        abi:CadinuLockV3Abi,
        functionName:"unlock",
        args:[BigInt(id)]
      })
      const transactionHash = await walletClient.writeContract(request)
      setHash(transactionHash)
      
  }

  const {
    isLoading: transactionLoading,
    isSuccess: transactionSuccess
  } = useWaitForTransaction({
    hash: hash as Address
  })
  
  const handleCollectFee = async (id)=>{
  
    const {request} = await client.simulateContract({
      account,
      address:getCadinuLockv3Address(),
      abi:CadinuLockV3Abi,
      functionName:"collectFee",
      args:[
        BigInt(id),
        account,
        BigInt('340282366920938463463374607431768211454'),
        BigInt('340282366920938463463374607431768211454')
      ]
    })

    const transactionHash = await walletClient.writeContract(request)
    setHash(transactionHash)
}

const {
  isLoading: collectFeeLoading,
  isSuccess: collectFeeSuccess
} = useWaitForTransaction({
  hash: hash as Address
})


  const getMaxNfts = useCallback(async()=>{
      const fetchedCount = await fetchLocksForNonFungiblePositionManager(tokenId)
      setMaxPage(Math.ceil(fetchedCount[0]?.amount/PAGE_SIZE))
      setMaxNumberOfNfts(fetchedCount[0]?.amount)
  },[tokenId])
  
 
  // const nonfungiblePositionManagerContract = {
  //       address: tokenId,
  //       abi: nonfungiblePositionManagerABI
  //   }
// console.log("nftFetchStatus", nftFetchStatus);


  const getNfts = useCallback(async()=>{
    handleNftFetchStatusChange(NftCardFetchStatus.PENDING)
    // console.log("data");
    try{
      const data = await readContracts({
        contracts:[
        {
          ...LockV3Contract,
          functionName:"getLocksForNonFungiblePositionManager",
          args:[BigInt(currentPage*PAGE_SIZE - PAGE_SIZE),BigInt(currentPage*PAGE_SIZE),tokenId]
        },
          {
            ...LockV3Contract,
            functionName:"nonFungiblePositionManagerName",
            args:[tokenId]
          }
        ]
      })
      // console.log("data", data);
      if(data && data.length>0){
        
        setFetchedData(data)
        const fetchedNfts = []
        data[0]?.result.map(res=>
          fetchedNfts.push(res)
          )
          setNfts(fetchedNfts)
          setCardTitle(data[1]?.result)
          const Ali = []
          fetchedNfts.map(async (nft)=>  {
            Ali.push(
              await getPositions(nft.nftId))
          })
          setPositions(Ali)
          handleNftFetchStatusChange(NftCardFetchStatus.FETCHED)
        }
    }catch(e){
        console.log("Get Locks Error",e);
        handleNftFetchStatusChange(NftCardFetchStatus.FAILED)
        
      }
    },[currentPage])

  const getmyNfts = useCallback(async()=>{
    handleMyNftFetchStatusChange(NftCardFetchStatus.PENDING)
    try{
      const data = await readContracts({
        contracts:[{
          ...LockV3ContractMin,
          functionName:'getLocksForUser',
          args:[account, BigInt(currentPage*PAGE_SIZE - PAGE_SIZE),BigInt(currentPage*PAGE_SIZE)]
        },
        {
          ...LockV3Contract,
          functionName:"nonFungiblePositionManagerName",
          args:[tokenId]
        }
      ],
    })
    // console.log("functionReads",data)
    if(data && data.length>0){
      setFetchedData(data)
      const fetchedNfts = []
      data[0]?.result[1].map(res=> fetchedNfts.push(res))

      setNfts(fetchedNfts.filter(nft=>nft.lockId === BigInt(lockId)))
      setCardTitle(data[1]?.result)

      const Ali = []
      fetchedNfts.map(async (nft)=>  {
        Ali.push(
          await getPositions(nft.nftId))
      })
      setPositions(Ali)
      handleMyNftFetchStatusChange(NftCardFetchStatus.FETCHED)
    }
  }catch(e){
    console.log("Get User Locks Error", e);
    handleMyNftFetchStatusChange(NftCardFetchStatus.FAILED)
    
  }
  },[currentPage])

  
  const getLpNames = async (tokens:Address[], id) =>{
      const tokenContracts = []
      tokens?.map((token)=>
        token && tokenContracts.push({address : token, abi:erc20ABI})
      )
      try{ const data2 = await readContracts({
        contracts:[
          {
            ...tokenContracts[0],
            functionName:"symbol"
            },
          {
            ...tokenContracts[1],
            functionName:"symbol"
            },
      ]
      })
    
      const nameAndSymbols = {
        token0Symbol :data2[0].result,
        token0SymbolStatus :data2[0].status,
        token1Symbol:data2[1].result,
        token1SymbolStatus:data2[1].status}
      const lpSymbol = nameAndSymbols.token0SymbolStatus === 'success' && nameAndSymbols.token1SymbolStatus === 'success' ?
      `${nameAndSymbols.token0Symbol}/${nameAndSymbols.token1Symbol}`
      : "loading..."

      const temp = {id,symbol: lpSymbol}
      if(isEmpty(lpNameSymbols.filter(lp=>lp.lockId === id))){
        const tempArray = lpNameSymbols

        tempArray.push(temp)
        console.log('tempArray',tempArray);
        
        setLpNameSymbols(tempArray)
      }
    }catch(e){
        console.log("get Position Token Name Error",e);
      }
      
    }

 

    const EndTimeTooltipComponent: React.FC<React.PropsWithChildren<EndTimeTooltipComponentProps>> = ({
        endTime,
      }) => {
        const {
          t,
          currentLanguage: { locale },
        } = useTranslation();
        return (
          <>
            <Text bold>{t("Unlock Time")}:</Text>
            <Text>
              {new Date(endTime * 1000).toLocaleString(locale, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </>
        );
      }
  
      function TimeCountdownDisplay({
        timestamp,
        getNow = () => Date.now(),
      }: {
        timestamp: number;
        getNow?: () => number;
      }) {
        const { t } = useTranslation();
      
        const currentDate = getNow() / 1000;
        const poolTimeRemaining = Math.abs(timestamp - currentDate);
        const endTimeObject = useMemo(() => getTimePeriods(poolTimeRemaining), [poolTimeRemaining]);
        const hasTimePassed = (timestamp - currentDate) < 0
      
        const {
          targetRef: endTimeTargetRef,
          tooltip: endTimeTooltip,
          tooltipVisible: endTimeTooltipVisible,
        } = useTooltip(<EndTimeTooltipComponent endTime={timestamp} />, {
          placement: "top",
        });
        return (
            <Flex alignItems="center">
              <Text color="textSubtle" small>
                {!hasTimePassed
                  ? endTimeObject?.totalDays
                    ? endTimeObject?.totalDays === 1
                      ? t("1 day")
                      : t("%days% days", { days: endTimeObject?.totalDays })
                    : t("< 1 day")
                  : t("%days% days ago", { days: endTimeObject?.totalDays })}
              </Text>
              <span ref={endTimeTargetRef}>
                <TimerIcon ml="4px" color="primary" />
                {endTimeTooltipVisible && endTimeTooltip}
              </span>
            </Flex>
          );
    }

    const getPositions= async(nftId:bigint)=>{
      try{
        // console.log("Hello");
        
        // handlePositionFetchStatusChange(NftPositionFetchStatus.PENDING)
          const position = await publicClient({chainId: ChainId.BSC}).readContract({
            address:tokenId,
            abi:nonfungiblePositionManagerABI,
            functionName:"positions",
            args:[nftId],
          })
          setPositionsTokens({token0:position[2], token1:position[3]})
          const positionItems = {} as PositionType
          positionItems['nftId'] = nftId
          positionItems['token0'] = position[2]
          positionItems['token1'] = position[3]
          positionItems['fee'] = position[4]
          positionItems['liquidity'] = position[7]
          // console.log("position", position);
          if (position.length === 12){
            // handlePositionFetchStatusChange(NftPositionFetchStatus.FETCHED)
          }
          return positionItems
      }catch(e){
        // handlePositionFetchStatusChange(NftPositionFetchStatus.FAILED)
        console.log(e);
        
      }
    }

    // console.log(nfts);
    const makeNftCards = ()=>{
      
        return(
            nfts.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE).map((nft) =>{
                if(!nft.error){
                    const thisPosition = positions.length > 0 ? positions.filter(position => position?.nftId === nft.nftId) : []
                    // eslint-disable-next-line no-unused-expressions
                    thisPosition.length > 0 && getLpNames([ thisPosition[0]?.token0, thisPosition[0]?.token1],nft.nftId)
                    return(
                        <>
                        
                        <CardWrapper margin='5px' style={{flexWrap:"wrap", minWidth:'360px', maxWidth:'28%'}} >
                        <Card>
                            <CardHeader style={{textAlign:'center'}} >
                              <Heading>
                              {
                              fetchedData[1].status==='success' 
                              ? `${cardTitle} #${nft.nftId}` 
                              : tokenId}
                              </Heading>
                            </CardHeader>
                          <CardBody style={{padding:'5px'}}>
                            
                            <Heading
                            style={
                              {
                                textAlign:'center',
                                textDecorationColor:"GrayText",
                                textDecoration:"underline",
                              }} mb="5px"
                              
                              >
                                {nft.description.slice(0,30)}
                            </Heading>
                            <Flex
                                width='100%'
                                flexDirection='row'
                                flexWrap="wrap"
                                alignItems='center'
                                justifyContent='center'
                                verticalAlign='center'
                                >
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="85%">
                                    <strong style={{flex:'1 1 160px'}}>Lock ID:</strong>
                                    <span >{nft.lockId.toString()}</span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="85%">
                                    <strong style={{flex:'1 1 160px'}}>Position Symbol:</strong>
                                    <span >{lpNameSymbols['symbol'] === "" ? <Skeleton/> : lpNameSymbols.filter(lp=> lp.id === nft.nftId)[0]?.symbol.toString() }</span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="85%">
                                    <strong style={{flex:'1 1 160px'}}>Position Fee:</strong>
                                    <span >{thisPosition.length > 0 ? Number(thisPosition[0]?.fee)/10000 : <Skeleton />}</span>
                                </Box>
                                
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="85%">
                                    <strong style={{flex:'1 1 160px'}}>Lock Date:</strong>
                                    <span style={{margin:"3px"}}>
                                        <TimeCountdownDisplay timestamp={Number(nft.lockDate)} />
                                    </span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="85%">
                                    <strong style={{flex:'1 1 160px'}}>Unlock Date:</strong>
                                    <span style={{margin:"3px"}}>
                                        <TimeCountdownDisplay timestamp={Number(nft.unlockDate)} />
                                    </span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="85%">
                                    <strong style={{flex:'1 1 160px'}}>Owner:</strong>
                                    <LinkExternal href={`https://bscscan.com/address/${nft.owner}`}>
                                        <span >{`${nft.owner.slice(0,6)}...${nft.owner.slice(-4,nft.owner.length)}`}</span>
                                    </LinkExternal>
                                </Box>
                            </Flex>
                        </CardBody>
                            <CardFooter>
                            <Flex
                                width='95%'
                                flexDirection='row'
                                flexWrap="wrap"
                                justifyContent='center'
                                verticalAlign='center'

                                >
                                <Text>Unlcok Your Asset or Collect Fee</Text>
                                <Button width="40%" mt="5px" mx='5px' disabled={
                                    nft.isUnlocked 
                                    || !account 
                                    || account!==nft.owner
                                    || transactionLoading
                                    || Date.now()/1e3 < nft.unlockDate 
                                    }
                                    onClick={()=>handleUnlock?.(nft.lockId)}
                                    >
                                    Unlock
                                </Button>
                                <Button width="40%" mx='5px' mt="5px" disabled={
                                    nft.isUnlocked 
                                    || !account 
                                    || account!==nft.owner
                                    || transactionLoading
                                  }
                                    onClick={()=>handleCollectFee?.(nft.lockId)}>
                                    Collect Fee
                                    </Button>
                                </Flex>
                            </CardFooter>
                            </Card>
                        </CardWrapper>
                        </>
                    )
                }
            
    
        }
    ))
        }

    const skeletonCard = ()=>{
      return (
        <>

        <CardWrapper  margin='5px' style={{flexWrap:"wrap", minWidth:'360px', maxWidth:'28%'}}>
        <Card>
          <CardHeader style={{textAlign:'center'}} >
            <Heading>
              <Skeleton />                  
            </Heading>
          </CardHeader>
          <CardBody >
          <Heading
          style={
            {
              textAlign:'center',
              textDecorationColor:"GrayText",
              textDecoration:"underline",
            }} mb="5px"
            
            >
              <Skeleton />
          </Heading>
          <Flex
              width='95%'
              flexDirection='row'
              flexWrap="wrap"
              justifyContent='center'
              verticalAlign='center'
              >
              <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                  <strong style={{flex:'1 1 160px'}}>Lock ID:</strong>
                  <Skeleton/>
              </Box>
              <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                  <strong style={{flex:'1 1 160px'}}>Position Symbol:</strong>
                  <span > <Skeleton/></span>
              </Box>
              <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                  <strong style={{flex:'1 1 160px'}}>Position Fee:</strong>
                  <span ><Skeleton /></span>
              </Box>
              <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                  <strong style={{flex:'1 1 160px'}}>Position Liquidity:</strong>
                  <span > <Skeleton/></span>
              </Box>
              <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                  <strong style={{flex:'1 1 160px'}}>Lock Date:</strong>
                  <span style={{margin:"3px"}}>
                      <Skeleton/>
                  </span>
              </Box>
              <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                  <strong style={{flex:'1 1 160px'}}>Unlock Date:</strong>
                  <span style={{margin:"3px"}}>
                      <Skeleton/>
                  </span>
              </Box>
              <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                  <strong style={{flex:'1 1 160px'}}>Owner:</strong>
                  <Skeleton/>
              </Box>
          </Flex>
          </CardBody>
          <CardFooter>
          <Flex
              width='95%'
              flexDirection='row'
              flexWrap="wrap"
              justifyContent='center'
              verticalAlign='center'
              >
              <Text>You can Unlcok Your Asset Simply By One Click</Text>
              <Skeleton/>
              </Flex>
          </CardFooter>
          </Card>
      </CardWrapper>
      </>
  )}

    useEffect(()=>{
        if(!isMyLock){
            getMaxNfts()
            if (nftFetchStatus !== NftCardFetchStatus.FETCHED){
              getNfts()
          }
        }else{
          if (myNftFetchStatus !== NftCardFetchStatus.FETCHED){
            getmyNfts()}
        if(fetchedData[0]?.status ==='success'){
          setMaxPage(Math.ceil(Number(fetchedData[0]?.result[0])/PAGE_SIZE))
        }
      }
    }, [isMyLock , nftFetchStatus, myNftFetchStatus, transactionSuccess])

  return (
    <>
    <Page>
    <Container>
    <Box mb='48px'>
    <Breadcrumbs>
      <Link href="/">Home</Link>
      <Link href="/cadinu-lock">Cadinu Lock</Link>
      <Text>Position Locks</Text>
    </Breadcrumbs>
    </Box>
    <Flex flexWrap="wrap" flexDirection='row' justifyContent='center'>
        {nftFetchStatus === NftCardFetchStatus.FETCHED || myNftFetchStatus === NftCardFetchStatus.FETCHED ? makeNftCards() : skeletonCard()}
    </Flex>
    {maxPage > 1 &&
      <PaginationButton showMaxPageText currentPage={currentPage} setCurrentPage={setCurrentPage} maxPage={maxPage} />
    }
    </Container>
    </Page>
        
    </>
  )
}
