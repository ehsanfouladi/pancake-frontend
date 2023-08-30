import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { fetchLcokById, getValueLocked } from "../helpers"
import Page from "views/Page"
import { Box, Card, CardBody, CardHeader, Container, Flex, Heading, LinkExternal, Loading, Table, Th, useMatchBreakpoints } from "@pancakeswap/uikit"
import { Address } from "viem"
import { erc20ABI, useContractReads } from "wagmi"
import { getCadinuLockAddress } from "utils/addressHelpers"
import { CadinuLockAbi } from "config/abi/cadinuLock"
import { formatRawAmount } from "utils/formatCurrencyAmount"
import { useCadinuPrice, useCadinuPriceAsBN, useCbonPrice, useCbonPriceAsBN } from "@pancakeswap/utils/useCakePrice"
import { bscTokens } from "@pancakeswap/tokens"
import { TableWrapper } from "views/Info/components/InfoTables/shared"
import _ from "lodash"

const Detail = ()=>{
    const {query} = useRouter()
    const id = query.id
    const [detail, setDetail] = useState(null)
    const [currentPage, setCurrentPage]= useState(1)
    const [maxPage, setMaxPage] = useState(1)
    const[valueLocked, setValueLocked]  = useState(0)
    const PAGE_SIZE = 5
    const { isXs, isSm, isMd } = useMatchBreakpoints()
            
    const cadinuPrice = useCadinuPrice().data
    const cbonPrice = useCbonPrice().data
    const getTokenValue = useCallback(async()=>{
        
        if (detail?.token === bscTokens.cadinu.address){
            setValueLocked(Number(cadinuPrice))
        return
        }
        if (detail?.token === bscTokens.cbon.address){
            setValueLocked(Number(cbonPrice))
        return

        }
    const value = await getValueLocked(detail?.token as Address)
    setValueLocked(value)
  },[detail])
 
    const getLockDetails = useCallback(async()=>{
        const details = await fetchLcokById(id as string)
        setDetail(details)
    },[])
    if(!id){
        return <Loading />
      }
    
      const tokenContract = {
        address: detail?.token?.toString() as Address,
        abi: erc20ABI,
      }
      const lockContract = {
        address: getCadinuLockAddress(),
        abi: CadinuLockAbi,
      }
      
      const {data:tokenDetails,isSuccess} = useContractReads({
        enabled:(detail?.token),
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
            args:[detail?.token]
          }
        ]
      })
      
    useEffect(()=>{
        getLockDetails() 
        if(valueLocked===undefined){
            getTokenValue()       
        }
    },[])
    console.log("VALUE>>>>>>>", valueLocked,cbonPrice,cadinuPrice);
    
    const getFormattedTime=(unixTime:number):string =>{
        var t = new Date();
        t.setSeconds(unixTime)
        return t.toDateString() + " "+ t.toLocaleTimeString() 
      }
      _.throttle(getFormattedTime,10000)
    return (
    <Page>
    <Container>
      <Card>
        <CardHeader style={{textAlign:"center"}}>
          <Heading>Token Info</Heading>
        </CardHeader>
        <CardBody>
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
            <strong style={{flex:'1 1 160px'}}>Total Amount Locked:</strong>
            <span > ~{isSuccess && tokenDetails[3].status ==='success' ? formatRawAmount(Number(tokenDetails[3].result[2]).toString(), Number(tokenDetails[2].result), 12) +" " + tokenDetails[1].result : "..."}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Total lock Value:</strong>
            <span > {isSuccess && valueLocked!==0 ?'$' +(Number(formatRawAmount(Number(detail?.amount).toString(), Number(tokenDetails[2].result), 12))*valueLocked).toFixed(7) : "unknown"}</span>
            </Box>
          </Flex>
        </CardBody>
      </Card>
      <Card mt="20px">
        <CardHeader style={{textAlign:"center"}}>
          <Heading>Lock Details</Heading>
        </CardHeader>
        <CardBody>
          <Flex width='95%' flexDirection='row'  flexWrap="wrap" justifyContent='center'
          >
            <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
            <strong style={{flex:'1 1 160px'}}>Title:</strong>

            <span >{detail?.description}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Amount Locked:</strong>
            <span > {isSuccess && (formatRawAmount(Number(detail?.amount).toString(), Number(tokenDetails[2].result), 12)) +" " + tokenDetails[1].result}</span>

            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Value Locked:</strong>
            <span > {isSuccess && valueLocked!==0  ?'$' +(Number(formatRawAmount(Number(detail?.amount).toString(), Number(tokenDetails[2].result), 12))*valueLocked).toFixed(7) : "unknown"}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Owner:</strong>
            <LinkExternal href={`https://bscscan.com/address/${detail?.owner}`}>
            <span >{detail?.owner.slice(0,6) + "..." + detail?.owner.slice(-4,detail?.owner.length)}</span>
            </LinkExternal>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Lock Date:</strong>
            <span > { getFormattedTime(detail?.lockDate)}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>TGE Date:</strong>
            <span > { getFormattedTime(detail?.tgeDate)}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>TGE Percent:</strong>
            <span > {detail?.tgeBps}%</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Unlocked Amount:</strong>
            <span > {isSuccess && (formatRawAmount(Number(detail?.unlockedAmount).toString(), Number(tokenDetails[2].result), 12))}</span>

            </Box>
          </Flex>
        </CardBody>
      </Card>
      </Container>
    </Page>
    )
}

export default Detail