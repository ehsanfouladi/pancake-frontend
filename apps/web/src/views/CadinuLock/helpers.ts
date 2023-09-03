import { bscTokens } from '@pancakeswap/tokens'
import { ContractFunctionResult, isAddress, zeroAddress } from 'viem'
import { ChainId, pancakePairV2ABI } from '@pancakeswap/sdk'
import { bigIntToSerializedBigNumber } from '@pancakeswap/utils/bigNumber'
import { CadinuLockAbi } from 'config/abi/cadinuLock'
import { CadinuLockV3Abi } from 'config/abi/cadinuLockV3'
import { CadinuLockState, CadinuLockType, ComulativeLockResponse, LockRecord, LockResponse, LockV3Response } from 'state/types'
import { getCadinuLockContract, getCadinuLockV3Contract } from 'utils/contractHelpers'
import { publicClient } from "utils/wagmi"
import { Address, erc20ABI } from 'wagmi'


const cadinuLockContract = getCadinuLockContract()
const cadinuLockV3Contract = getCadinuLockV3Contract()


const LockContract = {
  address:cadinuLockContract.address,
  abi:CadinuLockAbi
} as const 

export const isMyLock = (record: LockRecord , account: Address) => {
  
  return account?.toLowerCase()===record.wallet.toLowerCase()
  
  // return false
}
// export const v3Contracts = [
//   '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364', // pancakeSwap
//   '0x0C26558A7Bf8be790774fc84De8e5229A4dB5BA1', // cadinuSwap
//   '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613', // uniSwap
//   '0x0927a5abbd02ed73ba83fc93bd9900b1c2e52348' // apeSwap
// ]
const v3Contract = []
const getv3Contracts = async():Promise<Address[]>=>{
  const count = await cadinuLockV3Contract.read.allSupportedNonFungiblePositionManagerCount()
  const promises = await cadinuLockV3Contract.read.getNonFungiblesPositionManager([0n,count])
  const data = await Promise.all(promises)
  const [,contracts,] = data
  contracts.map(a=>v3Contract.push(a))
  return v3Contract
}
getv3Contracts()

export const v3Contracts = v3Contract

export const isV3 = (lock) => {
  
  return v3Contracts.includes(lock.token)
}
export const isTokenLP = (lock) => {
  return ((lock.factory !== zeroAddress) && !isV3(lock))
}

export const filterLocksByType = (locks, account: Address, lockType: CadinuLockType) => {
  if (locks) {
    switch (lockType) {
      case CadinuLockType.MYLOCK:
        
        return locks.filter((lock) => (lock.records.filter(record => isMyLock(record, account))).length > 0)
      case CadinuLockType.ALL:
        default:
          return locks
    }
  } else {
    return []
  }
}

export const filterLocksByState = (locks, state: CadinuLockState) => {
    if (locks){
    switch(state){
      case CadinuLockState.LIQUIDITY_V2:
          return locks.filter((lock) => isTokenLP(lock))
      case CadinuLockState.LIQUIDITY_V3:
        return locks.filter((lock) => isV3(lock))
        case CadinuLockState.TOKENS:
          default:
          return locks.filter((lock) => !isTokenLP(lock))
    }
  }else{
    return []
  }
}

// CADINU LOCK DYNAMIC-DATA:

const processLockResponse = (
  response: ContractFunctionResult<typeof CadinuLockAbi, 'getLockById'>
): LockResponse => {
  const {
    amount,
    cycle,
    cycleBps,
    description,
    id,
    unlockedAmount,
    owner,
    token,
    lockDate,
    tgeBps,
    tgeDate
  } = response

  return {
    amount: bigIntToSerializedBigNumber(amount) ,
    cycle: bigIntToSerializedBigNumber(cycle) ,
    cycleBps:bigIntToSerializedBigNumber(cycleBps)  ,
    description: description?.toString() ,
    id: bigIntToSerializedBigNumber(id) ,
    unlockedAmount:bigIntToSerializedBigNumber(unlockedAmount) ,
    owner,
    token,
    lockDate: bigIntToSerializedBigNumber(lockDate) ,
    tgeBps: bigIntToSerializedBigNumber(tgeBps) ,
    tgeDate:bigIntToSerializedBigNumber(tgeDate) ,
    
  }
}

const processLockV3Response = (
  response: ContractFunctionResult<typeof CadinuLockV3Abi, 'getLockAt'>
): LockV3Response => {
  const {
    lockId,
    nftId,
    nonFungiblePositionManagerAddress,
    owner,
    lockDate,
    isUnlocked,
    description
   
  } = response

  return {
    id: bigIntToSerializedBigNumber(lockId) ,
    nftId: bigIntToSerializedBigNumber(nftId) ,
    owner,
    token: nonFungiblePositionManagerAddress ,
    lockDate: bigIntToSerializedBigNumber(lockDate) ,
    isUnlocked,
    description: description?.toString() ,
    
  }
}

const processComulativeLockResponse = (
  response: ContractFunctionResult<typeof CadinuLockAbi, 'cumulativeLockInfo'>
): ComulativeLockResponse => {
 
  return {
    token: response[0],
    factory: response[1],
    amount: bigIntToSerializedBigNumber(response[2]) ,
    
  }
}

export const fetchAllNormalTokenLockedCount = async ()=>{
  const count = await cadinuLockContract.read.allNormalTokenLockedCount()
  return bigIntToSerializedBigNumber(count)
}

export const fetchAllLpTokenLockedCount = async ()=>{
  const count = await cadinuLockContract.read.allLpTokenLockedCount()
  return bigIntToSerializedBigNumber(count)
}

export const fetchAllV3LockCount = async()=>{
  const count = await cadinuLockV3Contract.read.getTotalLockCount()
  return bigIntToSerializedBigNumber(count)
}

export const fetchLcokById = async (lockId: string): Promise<LockResponse| Error> => {
  try {
    const lockData = await cadinuLockContract.read.getLockById([BigInt(lockId)])
    return processLockResponse(lockData)
  } catch (error) {
    console.log(error);
  }
}

export const fetchLcokV3ById = async (lockId: string) => {
  try {
    const lockData = await publicClient({chainId:ChainId.BSC}).multicall({
      contracts:[{
        ...cadinuLockV3Contract,
        functionName: "getLockAt",
        args :[BigInt(lockId)]
    }]
    })
    return ({result :processLockV3Response( lockData[0].result),status: lockData[0].status})
  } catch (error) {
    console.log(error);
  }
} 



export const fetchTotalLockCountForToken = async ( address:Address) =>{
  const count = await cadinuLockContract.read.totalLockCountForToken([address])
  return bigIntToSerializedBigNumber(count)
}

export const fetchCumulativeLockInfo =async (address:Address):Promise<ComulativeLockResponse>=>{
  try{
    const data = await cadinuLockContract.read.cumulativeLockInfo([address])
    return processComulativeLockResponse(data)
  }catch(e){
     console.log(e);
    
  }
}

export const fetchCumulativeNormalTokenLockInfo =async (start:bigint, end:bigint)=>{
  try{
    const data = await publicClient({chainId: ChainId.BSC}).multicall({
      contracts:[{
        ...LockContract,
        functionName : "getCumulativeNormalTokenLockInfo",
        args:[start,end]
      }]
    })
        return ({result : data[0].result,status: data[0].status})
  }catch(e){
     console.log(e);
  }
}


export const fetchCumulativeLpTokenLockInfo =async (start:bigint, end:bigint)=>{
  try{
    const data = await publicClient({chainId: ChainId.BSC}).multicall({
      contracts:[{
        ...LockContract,
        functionName : "getCumulativeLpTokenLockInfo",
        args:[start,end]
      }]
    })
    console.log("V2 Cadinu",data);
    
        return ({result : data[0].result,status: data[0].status})
  }catch(e){
     console.log(e);
  }
}

export const fetchLocksByTokenAddress = async (address:Address, start:bigint, end:bigint) : Promise<LockResponse[]> =>{
  try{
      const locks = await cadinuLockContract.read.getLocksForToken([address, start, end])
      return locks.map(lock => processLockResponse(lock))
  }catch(e){
     console.log(e);
  }
}

export const fetchTotalLockCountForUser = async (address:Address) => {
  const count = await cadinuLockContract.read.totalLockCountForUser([address])
  return bigIntToSerializedBigNumber(count)
}

export const fetchNormalLockCountForUser = async (address:Address) => {
  const count = await cadinuLockContract.read.normalLockCountForUser([address])
  return bigIntToSerializedBigNumber(count)
}

export const fetchLpLockCountForUser = async (address:Address) => {
  const count = await cadinuLockContract.read.lpLockCountForUser([address])
  return bigIntToSerializedBigNumber(count)
}

export const fetchNormalLocksByUser = async (address:Address):Promise<LockResponse[]> =>{
  try{
    const locks = await cadinuLockContract.read.normalLocksForUser([address])
    return locks.map(lock => processLockResponse(lock)) 
  }catch(e){
     console.log(e);
  }
}

export const fetchLpLocksByUser = async (address:Address):Promise<LockResponse[]> =>{
  try{
    const locks = await cadinuLockContract.read.lpLocksForUser([address])
    return locks.map(lock => processLockResponse(lock)) 
  }catch(e){
     console.log(e);
  }
}
export const fetchCumulativeV3Locks = async (start:bigint,end:bigint)=>{
  try{
  const [totalNumberOfNfpms, addresses] = await cadinuLockV3Contract.read.getNonFungiblesPositionManager([start,end])
  const nfpmsLockCount =  []
  let newEnd = end
  if (end > totalNumberOfNfpms){
    newEnd = totalNumberOfNfpms
  }
  for(let i = Number(start);i<Number(newEnd);i++){
    const lockCount = cadinuLockV3Contract.read.getLockCountForNonFungiblePositionManager([addresses[i]])
    const nfpmsLockCountObject = {}
    nfpmsLockCountObject['token'] = addresses[i]
    nfpmsLockCountObject["factory"] = zeroAddress
    nfpmsLockCountObject["amount"] =  Number(lockCount)
    nfpmsLockCount.push(nfpmsLockCountObject)
  }
  return nfpmsLockCount
}catch(e){
  console.log(e);
}
}
export const fetchLocksForNonFungiblePositionManager = async (address:Address) =>{
    try{
      const count = await cadinuLockV3Contract.read.getLockCountForNonFungiblePositionManager([address])
      const nfpmLockObject = {}
      const nfpmLock =[]
      nfpmLockObject['token'] = address
      nfpmLockObject["factory"] = zeroAddress
      nfpmLockObject["amount"] =  Number(count)
      // Number(locks.length)
      console.log("helperCount", count);
      
      nfpmLock.push(nfpmLockObject)
      return nfpmLock
    }catch(e){
      return ([])
    }
  }
export const fetchV3LocksByUser = async (address:Address) =>{
  console.log("HAVIJ");
  try{
   const data = await cadinuLockV3Contract.read.getLocksForUser([address])
    console.log(">>>",data);
    const alluserLocks = []
    data.map((lock)=>{
      const locks = {}
      locks['token'] = lock.nonFungiblePositionManagerAddress
      locks["factory"] = zeroAddress
      locks["amount"] =  Number(1)
      alluserLocks.push(locks)
    })
    return (alluserLocks)
  }catch(e){
     console.log(e);
  }
}

export const getTokenSymbol = async (tokenAddress:Address) =>{
  if (bscTokens.bnb.address === tokenAddress){
    return ('WBNB')
  }
  if (isAddress(tokenAddress)){
    const data = await publicClient({chainId: ChainId.BSC}).readContract({
      address: tokenAddress,
      abi : erc20ABI,
      functionName : "symbol"
    })
    console.log("symbol",data);
    
    return data
  }
  return ""
}

export const getTokenName = async (tokenAddress:Address) =>{
  if (bscTokens.bnb.address === tokenAddress){
    return ('WBNB')
  }
  // console.log(await fetchCumulativeNormalTokenLockInfo(50n,55n))
  if (isAddress(tokenAddress)){
    const data = await publicClient({chainId: ChainId.BSC}).readContract({
      address: tokenAddress,
      abi : erc20ABI,
      functionName : "name"
    })
    console.log("name",data);
    
    return data
  }
}

export const getLpSymbol = async (pairAddress:Address) =>{
  if (isAddress(pairAddress)){
    const token0 = await publicClient({chainId: ChainId.BSC}).readContract({
      address: pairAddress,
      abi : pancakePairV2ABI,
      functionName : "token0",
    })
    const token1 = await publicClient({chainId: ChainId.BSC}).readContract({
      address: pairAddress,
      abi : pancakePairV2ABI,
      functionName : "token1"
    })
    console.log("symbol lp",token0);
    const token0Symbol = await (getTokenSymbol(token0))
    const token0Name = await (getTokenName(token0))
    const token1Symbol = await(getTokenSymbol(token1))
    const token1Name = await(getTokenName(token1))
    return {symbol :`${token0Symbol}/${token1Symbol}`, name: `${token0Name}/${token1Name}` }
    
  }
}

export const getValueLocked = async ( tokenAddress:string)=>{
  try{
  const data = await ( await fetch(`https://cadinu-locks.cadinu.io/price/${tokenAddress}`)).json()
  return data?.price
  }catch(e){
     console.log(e);
  }
}
