import { useTranslation } from '@pancakeswap/localization'
import { pancakePairV2ABI } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { Box, Breadcrumbs, Card, CardBody, CardHeader, Container, Flex, Heading, LinkExternal, Loading, PaginationButton, Skeleton, Table, Td, Text, Th, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useCadinuPriceAsBN, useCbonPriceAsBN } from '@pancakeswap/utils/useCakePrice'
import { CadinuLockAbi } from 'config/abi/cadinuLock'
import throttle from 'lodash/throttle'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { CadinuLockState } from 'state/types'
import { getCadinuLockAddress } from 'utils/addressHelpers'
import { formatRawAmount } from 'utils/formatCurrencyAmount'
import { formatUnits, zeroAddress } from 'viem'
import { TableWrapper } from 'views/Info/components/InfoTables/shared'
import Page from 'views/Page'
import { Address, erc20ABI, readContracts, useAccount, useContractReads } from 'wagmi'
import { fetchLocksByTokenAddress, fetchLpLocksByUser, fetchNormalLocksByUser, fetchTotalLockCountForToken, getValueLocked } from '../helpers'
import { LockV3 } from './LockV3'

const Overview = () => {
  const { query } = useRouter()
  const {tokenId,isMyLock, filterState} = query
  
  const tokenContract = {
    address: tokenId?.toString() as Address,
    abi: erc20ABI,
  }
  const lockContract = {
    address: getCadinuLockAddress(),
    abi: CadinuLockAbi,
  }
  
  const {data:tokenDetails,isSuccess} = useContractReads({
    enabled:(tokenId!==undefined && filterState===CadinuLockState.TOKENS),
    watch:false,
    cacheTime:10000,
    contracts:[
      {
        ...tokenContract,
        functionName: 'name'
      },
      {
        ...tokenContract,
        functionName: 'symbol'
      },
      {
        ...tokenContract,
        functionName: 'decimals'
      },
      {
        ...lockContract,
        functionName : 'cumulativeLockInfo',
        args:[tokenId?.toString() as Address]
      }
    ]
  })

  

  const [lpNameSymbols,setLpNameSymbols] = useState({})
  const getLpNames = async () =>{
    const  pairContract = {
      address : tokenId as Address,
      abi : pancakePairV2ABI
    }
    const data = await  readContracts({
      contracts :[
        {
        ...pairContract,
        functionName : "token0"
        },
        {
          ...pairContract,
          functionName : "token1"
        }
      ]
      
    }
    )
    
    const tokenContracts = []
    data?.map((token)=>
      token.status === "success" && tokenContracts.push({address : token.result, abi:erc20ABI})
    )
    const data2 = await readContracts({
      contracts:[
        {
        ...tokenContracts[0],
        functionName:"name"
        },
        {
          ...tokenContracts[0],
          functionName:"symbol"
          },
        {
          ...tokenContracts[1],
          functionName:"name"
        },
        {
          ...tokenContracts[1],
          functionName:"symbol"
          },
    ]
    })
    const nameAndSymbols = {
      token0Name:data2[0].result,
      token0NameStatus:data2[0].status,
      token0Symbol :data2[1].result,
      token0SymbolStatus :data2[1].status,
      token1Name:data2[2].result,
      token1NameStatus:data2[2].status,
      token1Symbol:data2[3].result,
      token1SymbolStatus:data2[3].status}
    const lpName = nameAndSymbols.token0NameStatus === 'success' && nameAndSymbols.token1NameStatus === 'success' ?
    `${nameAndSymbols.token0Name}/${nameAndSymbols.token1Name}`
    : "loading..."
    const lpSymbol = nameAndSymbols.token0SymbolStatus === 'success' && nameAndSymbols.token1SymbolStatus === 'success' ?
    `${nameAndSymbols.token0Symbol}/${nameAndSymbols.token1Symbol}`
    : "loading..."
    setLpNameSymbols({name : lpName, symbol: lpSymbol})
    
  }
  
  const { t } = useTranslation()
  const { address: account } = useAccount()

  const [details, setDetails] =useState([])
  const [currentPage, setCurrentPage]= useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const PAGE_SIZE = 5

  const getTokenLockDetails = useCallback(
      async ()=>{
          const countOfLocksForToken = await fetchTotalLockCountForToken(tokenId as Address)
          setMaxPage(Math.ceil(Number(countOfLocksForToken)/PAGE_SIZE))
          const start = BigInt((currentPage-1)*PAGE_SIZE)
          const end = start + BigInt(PAGE_SIZE)
          const lockDetails = isMyLock === "false"
          ? await fetchLocksByTokenAddress(tokenId as Address, start, end)
          : filterState === CadinuLockState.TOKENS
          ? await fetchNormalLocksByUser(account)
          : await fetchLpLocksByUser(account)
          setDetails(lockDetails)
        },[query])
        
  
  
  const cadinuPrice = useCadinuPriceAsBN().toString()
  const cbonPrice = useCbonPriceAsBN().toString()
  const getTokenValue = useCallback(async()=>{
    if (tokenId === bscTokens.cadinu.address){
      setValueLocked(cadinuPrice)
      return
    }
    if (tokenId === bscTokens.cbon.address){
      setValueLocked(cbonPrice)
      return

    }
    const value = await getValueLocked(tokenId as Address)
    setValueLocked(value)
  },[tokenId, cbonPrice, cadinuPrice])

  useEffect(() => { 
    if(filterState===CadinuLockState.TOKENS|| filterState===CadinuLockState.LIQUIDITY_V2){
      getTokenLockDetails()
      if(filterState === CadinuLockState.LIQUIDITY_V2){
        getLpNames()
      }
      if(!valueLocked || valueLocked==='' ){
        getTokenValue()
      }
    }
  
  },[cadinuPrice,cbonPrice, isMyLock, filterState] )

  const getFormattedTime=(unixTime:number):string =>{
    const tt = new Date(unixTime * 1000);
        // t.setSeconds(unixTime/1000)
    // console.log(t);
    
    return `${tt.toDateString()} ${tt.toLocaleTimeString()}`
  }
  throttle(getFormattedTime,10000)
  
  const[valueLocked, setValueLocked]  = useState('')
  const { isXs, isSm, isMd } = useMatchBreakpoints()

  if(!tokenId){
    return <Loading />
  }
  const {lockId} = query
  if(filterState === CadinuLockState.LIQUIDITY_V3){
    if(isMyLock==='true'){
      
    return <LockV3 tokenId = {tokenId as Address} lockId={lockId as string} isMyLock />

    }
    return <LockV3 tokenId = {tokenId as Address}  isMyLock ={false} lockId={lockId ? lockId as string : null} />
  }
  return (
    <>
    <Page>
    <Container>
    <Box mb="24px" >
          <Breadcrumbs>
            <Link href="/">{t('Home')}</Link>
            <Link href="/cadinu-lock">{t('Cadinu Lock')}</Link>
            <Text>{t('Locks Overview')}</Text>
          </Breadcrumbs>
        </Box>
      <Card>
        <CardHeader style={{textAlign:"center"}}>
          <Heading>Lock Details</Heading>
        </CardHeader>
        <CardBody>
          {filterState === CadinuLockState.TOKENS ? (
          <Flex width='95%' flexDirection='row'  flexWrap="wrap" justifyContent='center'
          >
            <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
            <strong style={{flex:'1 1 160px'}}>Token Name:</strong>

            <span >{isSuccess && tokenDetails[0].status === 'success' && tokenDetails[0].result}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Token Symbol:</strong>

            <span >{isSuccess && tokenDetails[1].status === 'success' && tokenDetails[1].result}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Total lock Amount:</strong>
            <span >
               ~{isSuccess && tokenDetails[3].status ==='success' 
               ? `${formatUnits(tokenDetails[3].result[2], Number(tokenDetails[2].result))} ${tokenDetails[1].result}` : "..."}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Total lock Value:</strong>
            <span > {isSuccess && valueLocked!=='' && tokenDetails[3].status ==='success' 
            ?`$${(Number(formatUnits(tokenDetails[3].result[2], Number(tokenDetails[2].result)))*Number(valueLocked)).toFixed(7)}` : "unknown"}</span>
            </Box>
          </Flex>)
          : filterState === CadinuLockState.LIQUIDITY_V2 && (
            <Flex width='95%' flexDirection='row'  flexWrap="wrap" justifyContent='center'
          >
            <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
            <strong style={{flex:'1 1 160px'}}>Token Name:</strong>

            <span >{lpNameSymbols['name']}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Token Symbol:</strong>

            <span >{lpNameSymbols['symbol']}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Total lock Amount:</strong>
            <span > ~{isSuccess && tokenDetails[3].status ==='success' ? `${formatRawAmount(Number(tokenDetails[3].result[2]).toString(), Number(tokenDetails[2].result), 12)} ${tokenDetails[1].result}` : "..."}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Total lock Value:</strong>
            <span > { valueLocked!=='' && tokenDetails[3].status ==='success' ?`$${(Number(formatRawAmount(Number(tokenDetails[3].result[2]).toString(), Number(tokenDetails[2].result), 12))*Number(valueLocked)).toFixed(7)}` : "unknown"}</span>
            </Box>
          </Flex>
          )}
        </CardBody>
      </Card>
    <TableWrapper mt="2vw" overflowX='scroll'>
      <Table>
      <Th>
      #
      </Th>
      <Th>
        Title
      </Th>
      <Th style= {{display: (isXs ||isMd|| isSm) && 'none'}}>
        Owner
      </Th>
      <Th>
        Amount Locked
      </Th>
     
      <Th style= {{display: (isXs ||isMd|| isSm) && 'none'}}>
        Unlock Time
      </Th>
      {details && details.length > 0 ? details.map((lock)=>(
        <tr style={{textAlign:"center"}}> 
          <Td>
          <Link href={`${tokenId}/${lock.id}?filterState=${filterState}`} style={{textDecoration:'underline'} }>
            {lock.id  }
          </Link>
          </Td>
          <Td>
          <Link href={`${tokenId}/${lock.id}?filterState=${filterState}`} style={{textDecoration:'underline'} }>
            {lock.description}
          </Link>
          </Td>
          <Td style= {{display: (isXs || isMd || isSm) && 'none'}}>
            { lock.owner === zeroAddress 
            ?'Owner Renounced'
            : (
            <LinkExternal href={`https://bscscan.com/address/${lock.owner}`} >
              {`${lock.owner.slice(0,6)}...${lock.owner.slice(-4,lock.owner.length)}`}
            </LinkExternal>)}
          </Td>
          <Td>{
          isSuccess && tokenDetails[2].status ==='success'

            ? Number(formatUnits(
              BigInt(
                Number(lock.amount) - Number(lock.unlockedAmount)
              ),
               Number(tokenDetails[2].result))).toLocaleString(
                undefined,{maximumFractionDigits: 18}
              ) 
            : "..."} </Td>
          <Td style= {{display: (isXs ||isMd || isSm) && 'none'}}>{lock.tgeDate ? getFormattedTime(lock.tgeDate): "..."}</Td>
        </tr>
      )) : (
        <tr>
          <Td>
          <Skeleton/>
          </Td>
          <Td>
          <Skeleton/>
          </Td>
          <Td>
          <Skeleton/>
          </Td>
          <Td>
          <Skeleton/>
          </Td>
          <Td>
          <Skeleton/>
          </Td>
        </tr>
      )}
      </Table>
      {maxPage>1 &&
        <PaginationButton showMaxPageText currentPage={currentPage} maxPage={maxPage} setCurrentPage={setCurrentPage} />
      }
      </TableWrapper>
      </Container>
      </Page>
    </>
  
  )
}

export default Overview
