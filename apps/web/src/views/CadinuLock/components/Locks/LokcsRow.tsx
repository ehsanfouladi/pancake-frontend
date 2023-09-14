import { pancakePairV2ABI } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { ArrowForwardIcon, Box, IconButton, NextLinkFromReactRouter, Skeleton, SkeletonV2, Text } from '@pancakeswap/uikit'
import { useCadinuPriceAsBN, useCbonPriceAsBN } from '@pancakeswap/utils/useCakePrice'
import { useCallback, useEffect, useState } from 'react'
import { CadinuLockState, Lock } from 'state/types'
import styled from 'styled-components'
import { formatRawAmount } from 'utils/formatCurrencyAmount'
import { Address, isAddress, zeroAddress } from 'viem'
import { erc20ABI, readContracts, useContractRead } from 'wagmi'
import { getValueLocked } from "../../helpers"

interface LockRowProps {
  lock: any
  filterState : CadinuLockState
  isMyLock: boolean
  lockFilter : CadinuLockState
}

const StyledLockRow = styled(NextLinkFromReactRouter)`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex;
  padding: 16px 24px;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.dropdown};
  }
`

const LockRow: React.FC<React.PropsWithChildren<LockRowProps>> = ( {lock, filterState, isMyLock, lockFilter} ) => {
  const lockLink = `/cadinu-lock/locks/${lock.token}`
  const [numberOfNfts, setNumberOfNfts] = useState(0)
  const {data:TokenDecimal, isLoading:isDecimalLoading, isSuccess: isDecimalSuccess} = useContractRead({
    enabled:filterState!==CadinuLockState.LIQUIDITY_V3,
    abi:erc20ABI,
    address: `${lock.token}` as Address,
    functionName: "decimals"
  })
  const {data:TokenSymbol, isLoading:isSymbolLoading, isSuccess: isSymbolSuccess} = useContractRead({
      abi:erc20ABI,
      address: `${lock.token}` as Address,
      functionName: "symbol"
    })
  const {data:TokenName, isLoading:isNameLoading, isSuccess: isNameSuccess} = useContractRead({
      abi:erc20ABI,
      address: `${lock.token}` as Address,
      functionName: "name"
  })
  const [lpNameSymbols,setLpNameSymbols] = useState({})
  const getNames = async () =>{
    const  pairContract = {
      address : lock.token as Address,
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


  const [totalValue,setTotalValue] = useState(0)


  // const getNumberOfNfts = (amount) => {
   
  //   setNumberOfNfts(Number(amount))
  // }
  const cadinuPrice = Number(useCadinuPriceAsBN())
  const cbonPrice = Number(useCbonPriceAsBN())
  
  const getValue = useCallback(async() =>{ const value = await getValueLocked(lock.token)
    if (lock.token === bscTokens.cadinu.address){
      setTotalValue(cadinuPrice)
        return
      }
    if (lock.token === bscTokens.cbon.address){
        setTotalValue(cbonPrice)
        return
      }
    setTotalValue(value)
  },[lock.token, cbonPrice, cadinuPrice])
  useEffect(()=>{
    if(filterState === CadinuLockState.LIQUIDITY_V2){
      getValue()
      getNames()
    }
    if (filterState=== CadinuLockState.LIQUIDITY_V3){
      setNumberOfNfts(lock.amount)
    }
  },[lock, filterState])

  if(isNameLoading){
    return <SkeletonV2 />
  }
  return (
    <StyledLockRow to={isMyLock && filterState!==CadinuLockState.LIQUIDITY_V3 
    ? `${lockLink}/${lock.id}?filterState=${lockFilter}`
      : filterState===CadinuLockState.LIQUIDITY_V3 
      ? `${lockLink}?isMyLock=${isMyLock}&filterState=${lockFilter}&lockId=${lock.id}`
    :`${lockLink}?isMyLock=${isMyLock}&filterState=${lockFilter}`}>
      <Box as="span"   overflow='hidden' style={{ flex: 1 , "whiteSpace": "nowrap"}}>
        {filterState === CadinuLockState.TOKENS ?
        <>
        <Text bold  mb="5px" style={{textOverflow:"ellipsis", msTextOverflow:"ellipsis"}}>
          {isNameSuccess ? TokenName:"Loading" } 
        </Text>
        <Text mb="8px">
          {isSymbolSuccess ? TokenSymbol : "Loading"}
        </Text>
        {isMyLock &&
          <Text   mb="5px" >
            Lcok ID: {lock ? lock.id :"Loading" } 
          </Text>
        }
        </>
        :
        filterState === CadinuLockState.LIQUIDITY_V2 ?
        <>
        {lpNameSymbols['name'] ?
        <Text bold  mb="5px" style={{textOverflow:"ellipsis", msTextOverflow:"ellipsis"}}>
          { lpNameSymbols['name'] } 
        </Text>
        :
        <Skeleton />
        }
        {lpNameSymbols['symbol']
        ?
        <Text mb="8px">
          {lpNameSymbols['symbol']}
        </Text>
        : <SkeletonV2 />}
        {isMyLock &&
          <Text   mb="5px" >
            Lcok ID: {lock ? lock.id :"Loading" } 
          </Text>
        }
        </>
        :
        filterState === CadinuLockState.LIQUIDITY_V3 &&(
          <>
        <Text bold  mb="5px" style={{textOverflow:"ellipsis", msTextOverflow:"ellipsis"}}>
          {isNameSuccess ? TokenName:<Skeleton /> } 
        </Text>
        {isMyLock &&
          <Text   mb="5px" >
            Lcok ID: {lock ? lock.id.toString() :"Loading" } 
          </Text>
        }
        </>
        )
      }
    
      </Box>
      <Box as="span" style={{flex:1}} px="12px">
      {filterState === CadinuLockState.LIQUIDITY_V3 ?
        <Text mb="8px" ml="8px">
          Total Amount:  {numberOfNfts && numberOfNfts }
        </Text>
      :
      <>
      <Text mb="8px" ml="8px">
          Total Amount:  {isDecimalSuccess ? formatRawAmount(lock.amount, Number(TokenDecimal), 12) : "..."}
        </Text>
        <Text mb="8px" ml="8px">
          Total Value:  {Number(totalValue) !==0 ? Number(totalValue) : "unknown"}
        </Text>
        </>
        }
      </Box>
      <IconButton variant="text">
        <ArrowForwardIcon width="24px" />
      </IconButton>
    </StyledLockRow>

  )
}

export default LockRow
