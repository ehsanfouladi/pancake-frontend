import { useTranslation } from '@pancakeswap/localization'
import { Box, Breadcrumbs, Card, Flex, Heading, Input, PaginationButton, Text } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import { useSessionStorage } from 'hooks/useSessionStorage'
import Link from 'next/link'
import { CadinuLockState, CadinuLockType, LockFetchStatus } from 'state/types'
import { Address, useAccount, useContractRead } from 'wagmi'


import { CadinuLockAbi } from 'config/abi/cadinuLock'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { isAddress, zeroAddress } from 'viem'

import { CadinuLockV3Abi } from 'config/abi/cadinuLockV3'
import { getCadinuLockContract, getCadinuLockV3Contract } from 'utils/contractHelpers'
import {
  fetchCumulativeLockInfo,
  fetchCumulativeLpTokenLockInfo,
  fetchCumulativeNormalTokenLockInfo,
  fetchCumulativeV3Locks,
  fetchLocksForNonFungiblePositionManager,
  fetchLpLocksByUser,
  fetchNormalLocksByUser,
  fetchV3LocksByUser, v3Contracts
} from '../../helpers'
import Filters from './Filters'
import LocksLoading from './LocksLoading'
import LokcsRow from './LokcsRow'
import TabMenu from './TabMenu'

interface State {
  lockType: CadinuLockType
  filterState: CadinuLockState
  fetchStatus : LockFetchStatus
}

export const StyledInput = styled(Input)`
  z-index: 9999;
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
`
export const StyledContainer = styled.div`
  position: relative;
  display:flex;
  flex-direction:column;
  z-index: 30;
  width: 50%;
  align-items:center;
  text-align:center;
  justify-content:center;
  margin:auto;
  margin-bottom: 10px;
  align-content:center;
`
const Locks = () => {
  const { t } = useTranslation()
  const {address:account} = useAccount()
  const [state, setState] = useSessionStorage<State>('lock-filter', {
    lockType: CadinuLockType.ALL,
    filterState: CadinuLockState.TOKENS,
    fetchStatus : LockFetchStatus.NOTFETCHED
  })

  const { lockType, filterState, fetchStatus } = state
  const handleLockTypeChange = (newLockType: CadinuLockType) => {
    setCurrentPage(1)
    setState((prevState) => ({
      ...prevState,
      lockType: newLockType,
    }))
  }

  const handleLockFetchStatusChange = (newFetchStatus: LockFetchStatus) =>{
    setState((prevState) =>({
      ...prevState,
      fetchStatus : newFetchStatus,
    }))
  }

  // const status = FetchStatus.Fetched
  const handleFilterChange = (newFilterState: CadinuLockState) => {
    setCurrentPage(1)
    setState((prevState: any) => ({
      ...prevState,
      filterState: newFilterState,
    }))
  }
  
  const PAGE_SIZE = 5

  const [value, setValue] = useState("")
  const [currentPage,setCurrentPage] = useState(1)
  const [maxPage,setMaxPage] = useState(1)
  const [fetchedData, setFetchedData] = useState([])
  const [isMyLock, setIsMyLock] = useState(false)
  // const [fetchedStatus, setFetchedStatus] = useState(false)
  const {data:maxLock} = useContractRead({
    abi:CadinuLockAbi,
    address:getCadinuLockContract().address,
    functionName:"allNormalTokenLockedCount"
  })
  const {data:maxLpLock} = useContractRead({
    abi:CadinuLockAbi,
    address:getCadinuLockContract().address,
    functionName:"allLpTokenLockedCount"
  })
  const {data:maxNftLock} = useContractRead({
    abi:CadinuLockV3Abi,
    address:getCadinuLockV3Contract().address,
    functionName:"allSupportedNonFungiblePositionManagerCount"
  })
  
  const getLocksByStateForCurrentPage = useCallback (async (start: bigint, end:bigint)=>{
    switch(filterState){
      case CadinuLockState.LIQUIDITY_V2:{
        try{
          handleLockFetchStatusChange(LockFetchStatus.PENDING)
          const {result:fetched, status:lpStatus} = await fetchCumulativeLpTokenLockInfo(start, end)
          handleLockFetchStatusChange(lpStatus === "success" ? LockFetchStatus.FETCHED : LockFetchStatus.FAILED)
          setMaxPage(Math.ceil(Number(maxLpLock)&& Number(maxLpLock)/PAGE_SIZE))
          if (fetchStatus===LockFetchStatus.FETCHED){
            setFetchedData(fetched as [])
          }else{
            handleLockFetchStatusChange(LockFetchStatus.FAILED)
            setFetchedData([])
          }
          break;
        }catch(e){
          setMaxPage(1)
          setCurrentPage(1)
          break;
        }
      }
      default:
      case CadinuLockState.TOKENS:{
        try{
          handleLockFetchStatusChange(LockFetchStatus.PENDING)
          const {result:fetched, status:tokenStatus} = await fetchCumulativeNormalTokenLockInfo(start, end)
          if(tokenStatus === "success"){
            setMaxPage(Math.ceil(Number(maxLock)&& Number(maxLock)/PAGE_SIZE))
            handleLockFetchStatusChange(LockFetchStatus.FETCHED)
            setFetchedData(fetched as [])
          }else{
            handleLockFetchStatusChange(LockFetchStatus.FAILED)
            setFetchedData([])
          }
          break
        }catch(e){
          setFetchedData([])
          setMaxPage(1)
          setCurrentPage(1)
          console.log(e);
          break
        }
      }
     
      case CadinuLockState.LIQUIDITY_V3:
        try{
          handleLockFetchStatusChange(LockFetchStatus.PENDING)
          const fetched = await fetchCumulativeV3Locks(start, end)
          if(fetched.length > 0){
            setMaxPage(Math.ceil(Number(maxNftLock)&& Number(maxNftLock)/PAGE_SIZE))
            handleLockFetchStatusChange(LockFetchStatus.FETCHED)
            console.log("liqV3Data>>>>>>",fetched);
            setFetchedData(fetched as [])
          }else{
            handleLockFetchStatusChange(LockFetchStatus.FAILED)
            setFetchedData([])
          }
        }catch(e){
          setFetchedData([])
          setMaxPage(1)
          setCurrentPage(1)
          console.log(e);
          break
        }
    }
  }, [filterState, maxLock, maxLpLock, maxNftLock])

  useEffect(() => {
    if(!isAddress(value)&&lockType === CadinuLockType.ALL){
      getLocksByStateForCurrentPage(  BigInt(currentPage*PAGE_SIZE-PAGE_SIZE), BigInt(currentPage*PAGE_SIZE-1))
    }
    
  }, [filterState, currentPage, getLocksByStateForCurrentPage, value, lockType])
   
  const searchAddress = useCallback(async (address:Address) =>{
    if(v3Contracts.includes(address)){
      handleFilterChange(CadinuLockState.LIQUIDITY_V3)
      handleLockFetchStatusChange(LockFetchStatus.PENDING)
      const fetched = await fetchLocksForNonFungiblePositionManager(address)
      if(fetched){
        handleLockFetchStatusChange(LockFetchStatus.FETCHED)
        setFetchedData(fetched)
      }else{
        handleLockFetchStatusChange(LockFetchStatus.FAILED)
        setFetchedData([])
      }
    }else{
    const data =  await fetchCumulativeLockInfo(address)
    if(data.token === zeroAddress){
      handleLockFetchStatusChange(LockFetchStatus.FAILED)
      setFetchedData([])
    }
    if (data.factory === zeroAddress){
      handleFilterChange(CadinuLockState.TOKENS)
      }else{
        handleFilterChange(CadinuLockState.LIQUIDITY_V2)
      }
    
    setFetchedData([data])
    }
    },[])

  const getMyLocks = useCallback(async(myAccount:Address) =>{
    if(lockType === CadinuLockType.MYLOCK){
      // if(value){
      //   setValue("")
      // }
      setIsMyLock(true)
      switch (filterState) {
        case CadinuLockState.TOKENS:{
          handleLockFetchStatusChange(LockFetchStatus.PENDING)
          setFetchedData([])
          const tokenData = await fetchNormalLocksByUser(myAccount as Address)
          if (tokenData){
            setFetchedData(tokenData)
            handleLockFetchStatusChange(LockFetchStatus.FETCHED)
            if (isAddress(value)){
              const newData = fetchedData.filter((lock)=> lock.token === value)
              setFetchedData(newData)
            }
          }else{
            handleLockFetchStatusChange(LockFetchStatus.FAILED)
          }
          break;}
        case CadinuLockState.LIQUIDITY_V2:{
          handleLockFetchStatusChange(LockFetchStatus.PENDING)
          setFetchedData([])
          const liqV2Data = await fetchLpLocksByUser(account as Address)
          if (liqV2Data){
            setFetchedData(liqV2Data)
            handleLockFetchStatusChange(LockFetchStatus.FETCHED)
            if (isAddress(value)){
              const newData = fetchedData.filter((lock)=> lock.token === value)
              setFetchedData(newData)
            }

          }else{
            handleLockFetchStatusChange(LockFetchStatus.FAILED)
          }
          break;}
        case CadinuLockState.LIQUIDITY_V3:{
          handleLockFetchStatusChange(LockFetchStatus.PENDING)
          setFetchedData([])
          const liqV3Data = await fetchV3LocksByUser(account as Address)
          handleLockFetchStatusChange(LockFetchStatus.FETCHED)

          if (liqV3Data){
            setFetchedData(liqV3Data)
            console.log("liqV3Data>>>>>>",liqV3Data);
            
            handleLockFetchStatusChange(LockFetchStatus.FETCHED)
            if (isAddress(value)){
              const newData = fetchedData.filter((lock)=> lock.token === value)
              setFetchedData(newData)
            }
          }else{
            setFetchedData([])
            handleLockFetchStatusChange(LockFetchStatus.FAILED)
          }
          break;}
        default:
          break;
      }
     
      
    }
  },[account, filterState, lockType])

  useEffect(() => {
    if (isAddress(value) &&lockType === CadinuLockType.ALL){
      searchAddress(value as Address)
    }
    if (lockType === CadinuLockType.MYLOCK){
      setFetchedData([])
      if(account){
        getMyLocks(account)
      }
    }else{
      setIsMyLock(false)
    }
    console.log(filterState);
  }, [value, filterState, lockType, account])
  

  return (
    <Container py="40px">
      <Box mb="48px">
        <Breadcrumbs>
          <Link href="/">{t('Home')}</Link>
          <Text>{t('Cadinu Lock')}</Text>
        </Breadcrumbs>
      </Box>
      <Heading as="h2" scale="xl" mb="32px" id="voting-proposals">
        {t('Locks')}
      </Heading>
    <StyledContainer>
      <StyledInput
       type="text"
       value={value}
       onChange={(e) => {
         setValue(e.target.value)
       }}
       placeholder={t('Search liquidity pairs or tokens')}
      
     />
  
     </StyledContainer> 
      <Card>
        <TabMenu lockType={lockType} onTypeChange={handleLockTypeChange} account={account}/>
        <Filters
          filterState={filterState}
          onFilterChange={handleFilterChange}
          isLoading={fetchStatus === LockFetchStatus.PENDING}
        />
        {fetchStatus === LockFetchStatus.PENDING && <LocksLoading />}
        {fetchStatus === LockFetchStatus.FETCHED &&
          fetchedData && fetchedData.length > 0 &&
          fetchedData.map((lock, index) => {
            return <LokcsRow
              lock={lock} 
              filterState={filterState} 
              isMyLock={isMyLock}
              lockFilter={filterState}/>
          })}
        {((fetchStatus === LockFetchStatus.FETCHED && fetchedData && fetchedData.length === 0) || fetchStatus === LockFetchStatus.FAILED) &&(
          <Flex alignItems="center" justifyContent="center" p="32px">
            <Heading as="h5">{t('No Lock found')} </Heading>
          </Flex>
        )}
      </Card>
      {maxPage > 1 &&
      <PaginationButton showMaxPageText currentPage={currentPage} maxPage={maxPage} setCurrentPage={setCurrentPage} />
      }
    </Container>
  )
}

export default Locks
