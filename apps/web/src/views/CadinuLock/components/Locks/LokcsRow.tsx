import { ArrowForwardIcon, Box, IconButton, Flex, Text, NextLinkFromReactRouter, Spinner, Skeleton, SkeletonV2 } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { CadinuLockState, Lock } from 'state/types'
// import { isCoreProposal } from '../../helpers'
import TimeFrame from './TimeFrame'
import { ProposalStateTag, ProposalTypeTag } from './tags'
import {getTokenName, getLpSymbol, getTokenSymbol, getValueLocked} from "../../helpers"
import { useCallback, useEffect, useState } from 'react'
import { Address, isAddress, zeroAddress } from 'viem'
import { bscTokens } from '@pancakeswap/tokens'
import { erc20ABI, readContracts, useContractRead } from 'wagmi'
import { lpTokenABI } from 'config/abi/lpTokenAbi'
import { bigIntToSerializedBigNumber } from '@pancakeswap/utils/bigNumber'
import { formatRawAmount } from 'utils/formatCurrencyAmount'
import { pancakePairV2ABI } from '@pancakeswap/sdk'
import { Contract, Signer } from 'ethers'
import { publicClient } from 'utils/wagmi'
import { getCadinuLockv3Address } from 'utils/addressHelpers'
import { getCadinuLockV3Contract } from 'utils/contractHelpers'

interface LockRowProps {
  lock: any
  filterState : CadinuLockState
  isMyLock: Boolean
  isV3: Boolean
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

const LockRow: React.FC<React.PropsWithChildren<LockRowProps>> = ( {lock, filterState, isMyLock, isV3} ) => {
  const lockLink = `/cadinu-lock/locks/${lock.token}`
  const [numberOfNfts, setNumberOfNfts] = useState(0)
  const {data:TokenDecimal, isLoading:isDecimalLoading, isSuccess: isDecimalSuccess} = useContractRead({
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
    data?.map((token)=>{
      token.status === "success" && tokenContracts.push({address : token.result, abi:erc20ABI})
    })
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
    nameAndSymbols.token0Name + "/" + nameAndSymbols.token1Name
    : "loading..."
    const lpSymbol = nameAndSymbols.token0SymbolStatus === 'success' && nameAndSymbols.token1SymbolStatus === 'success' ?
    nameAndSymbols.token0Symbol + "/" + nameAndSymbols.token1Symbol
    : "loading..."
    setLpNameSymbols({name : lpName, symbol: lpSymbol})
    
  }


  const [totalValue,setTotalValue] = useState(0)


  // const getNumberOfNfts = (amount) => {
   
  //   setNumberOfNfts(Number(amount))
  // }

  const getValue = useCallback(async() =>{ const value = await getValueLocked(lock.token)
    setTotalValue(value)
  },[])
  useEffect(()=>{
    if(filterState === CadinuLockState.LIQUIDITY_V2){
      getValue()
      getNames()
    }
    if (filterState=== CadinuLockState.LIQUIDITY_V3){
      setNumberOfNfts(lock.amount)
    }
  },[lock])

  if(isNameLoading){
    return <SkeletonV2 />
  }
  return (
    <StyledLockRow to={`${lockLink}?isMyLock=${isMyLock}&isV3=${isV3}`}>
      <Box as="span"   overflow='hidden' style={{ flex: 1 , "whiteSpace": "nowrap"}}>
        {filterState === CadinuLockState.TOKENS ?
        <>
        <Text bold  mb="5px" style={{textOverflow:"ellipsis", msTextOverflow:"ellipsis"}}>
          {isNameSuccess ? TokenName:"Loading" } 
        </Text>
        
        <Text mb="8px">
          {isSymbolSuccess ? TokenSymbol : "Loading"}
        </Text>
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
        </>
        :
        filterState === CadinuLockState.LIQUIDITY_V3 &&(
        <Text bold  mb="5px" style={{textOverflow:"ellipsis", msTextOverflow:"ellipsis"}}>
          {isNameSuccess ? TokenName:<Skeleton /> } 
        </Text>
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
