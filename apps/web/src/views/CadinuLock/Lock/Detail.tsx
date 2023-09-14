import { useTranslation } from "@pancakeswap/localization"
import { pancakePairV2ABI } from "@pancakeswap/sdk"
import { bscTokens } from "@pancakeswap/tokens"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  LinkExternal,
  Loading, PaginationButton,
  Row,
  Table,
  Td,
  Text,
  Th,
  TimerIcon,
  useMatchBreakpoints,
  useTooltip
} from "@pancakeswap/uikit"
import getTimePeriods from "@pancakeswap/utils/getTimePeriods"
import { useCadinuPrice, useCbonPrice } from "@pancakeswap/utils/useCakePrice"
import { CadinuLockAbi } from "config/abi/cadinuLock"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CadinuLockState } from "state/types"
import { getCadinuLockAddress } from "utils/addressHelpers"
import { getCadinuLockContract } from "utils/contractHelpers"
import { formatRawAmount } from "utils/formatCurrencyAmount"
import { Address } from "viem"
import { TableWrapper } from "views/Info/components/InfoTables/shared"
import Page from "views/Page"
import { erc20ABI, readContracts, useAccount, useContractReads, useContractWrite, usePrepareContractWrite } from "wagmi"
import { fetchLcokById, getValueLocked } from "../helpers"

interface EndTimeTooltipComponentProps {
  endTime: number;
}
const Detail = ()=>{
    const {query} = useRouter()
    const id = query.id
    const filterState = query.filterState
    const {address:account}=useAccount()
    
  

    const [detail, setDetail] = useState(null)
    const [currentPage, setCurrentPage]= useState(1)
    const [maxPage, setMaxPage] = useState(1)
    const[valueLocked, setValueLocked]  = useState(0)
    const PAGE_SIZE = 5
    const { isXs, isSm, isMd } = useMatchBreakpoints()
            
    const cadinuPrice = useCadinuPrice().data
    const cbonPrice = useCbonPrice().data

    const getLockDetails = useCallback(async()=>{
      const details = await fetchLcokById(id as string)
      
      setDetail(details)
    },[id])


    
    
    const getTokenValue = useCallback(async()=>{
      if (detail?.token === bscTokens.cadinu.address){
            setValueLocked(Number(cadinuPrice))
        if (detail?.token === bscTokens.cbon.address){
            setValueLocked(Number(cbonPrice))
        }
      }else{
          const value = await getValueLocked(detail?.token as Address)
          setValueLocked(value)
        }
      
    },[id, cbonPrice,cadinuPrice])

    const {config} = usePrepareContractWrite({
      address : getCadinuLockContract().address,
      abi:CadinuLockAbi,
      functionName: "unlock",
      args:[ Number(id) ? BigInt(Number(id)) : 0n]
    })

    const { isSuccess:unlockSuccess, write:unlock} = useContractWrite(config)
    
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


    const DisplayVesting = ()=>{

      const vestingTable = []

      const bpsToAmount = (bps:number) =>{
        const totalAmount = isSuccess && (formatRawAmount(Number(detail?.amount).toString(), Number(tokenDetails[2].result), 18))
        const tgeAmount = bps/100 * Number(totalAmount) / 100
        return tgeAmount.toLocaleString(undefined,{maximumFractionDigits: 18})
      }
      if(detail){
        const {tgeBps, tgeDate, cycle, cycleBps:CRP} = detail
        if (currentPage === 1){
          const firstRow = {
            id: 0,
            unlockTime: getFormattedTime(tgeDate),
            unlockedAmount: `${bpsToAmount(tgeBps)} (${tgeBps/100}%)`,
          }
          vestingTable.push(firstRow)
        }

        const maxRows = Math.ceil((100 - (tgeBps/100))/(CRP/100))
        setMaxPage(Math.ceil(maxRows/PAGE_SIZE))

        for (let i = (currentPage * PAGE_SIZE) - PAGE_SIZE +1; i < (currentPage * PAGE_SIZE) + 1 && i< maxRows +1; i++) {
          
          if(i !== maxRows){
            const rowData = {
              id :i,
              unlockTime : getFormattedTime((Number(tgeDate)) + (i * Number(cycle))),
              unlockedAmount : `${bpsToAmount(CRP)}  (${CRP/100}%)`
            }
            vestingTable.push(rowData)
           
          }else{
          const rowData = {
            id :i,
            unlockTime : getFormattedTime((Number(tgeDate)) + (i * Number(cycle))),
            unlockedAmount : `${bpsToAmount((100-(tgeBps/100 + (maxRows-1)*CRP/100))*100)} (${100-(tgeBps/100 + (maxRows-1)*CRP/100)}%)`
          }
          vestingTable.push(rowData)
        }
         
          
          
        
        }
        

        return (
          <TableWrapper mt="1.5vw">
                <Heading style={{textAlign:"center"}} verticalAlign='center' m="15px">
                Vesting Details
                </Heading>
            <Table align="center">
              <Th>
                Unlock Id
              </Th>
              <Th>
                Time
              </Th>
              <Th>
                Unlock Amount
              </Th>
              {vestingTable.map((row)=>(
                
                
                <tr style={{textAlign:"center"}} key={row.id}>
                  <Td>
                    {row.id + 1}
                  </Td>
                  <Td>
                    <Flex justifyContent="center">
                    {/* <span>
                    {row.unlockTime}
                    </span> */}
                    <span style={{margin:"3px"}}>
                      <TimeCountdownDisplay timestamp={Number(tgeDate) + (row.id)* Number(cycle)} />
                    </span>
                    </Flex>
                  </Td>
                  <Td>
                    {row.unlockedAmount}
                  </Td>
                </tr>
              ))}
            </Table>
            </TableWrapper>
            
        )
      }

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
      
  const [lpNameSymbols,setLpNameSymbols] = useState({})
  const getLpNames = async () =>{
    const  pairContract = {
      address : detail?.token as Address,
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

    const {data:tokenDetails,isSuccess} = useContractReads({
        enabled:(detail?.token && detail.id),
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
          },
          {
            ...lockContract,
            functionName : 'withdrawableTokens',
            args:[Number(id) ? BigInt(Number(id)) : 0n]
          }
        ]
      })
      
    useEffect(()=>{
      if(!detail || !detail.id){
        getLockDetails() 
      }
        
      if(detail && filterState===CadinuLockState.LIQUIDITY_V2){
        getLpNames()
      }
        if(valueLocked===undefined||valueLocked===0){
          getTokenValue()       
          
        }
    },[
      cadinuPrice,
      cbonPrice,
      id,
      valueLocked,
      filterState,
      detail,
      unlockSuccess,
    ])
    
    const getFormattedTime=(unixTime:number):string =>{
      
        const t = new Date(unixTime * 1000);
        
        // t.setSeconds(unixTime/1000)
    
        
        return `${t.toDateString()} ${t.toLocaleTimeString()}` 
      }
      // _.throttle(getFormattedTime,10000)
      if(!id ){ return (<Loading />)}
      return (

      
    <Page >
    <Container>
      <Card>
        <CardHeader style={{textAlign:"center"}}>
          <Heading>Token Info</Heading>
        </CardHeader>
        <CardBody>
          {detail && filterState===CadinuLockState.TOKENS ?(

          
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
            <span > {isSuccess && tokenDetails[3].status ==='success' ? `~${formatRawAmount(Number(tokenDetails[3].result[2]).toString(), Number(tokenDetails[2].result), 12)}  ${tokenDetails[1].result}` : "..."}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Total lock Value:</strong>
            <span > {isSuccess && valueLocked!==0 ?`$${(Number(formatRawAmount(Number(tokenDetails[3].result[2]).toString(), Number(tokenDetails[2].result), 12))*valueLocked).toFixed(7)}` : "unknown"}</span>
            </Box>
          </Flex>
          ):(
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
              <strong style={{flex:'1 1 160px'}}>Total Amount Locked:</strong>
              <span > ~{isSuccess && tokenDetails[3].status ==='success' ? `${formatRawAmount(Number(tokenDetails[3].result[2]).toString(), Number(tokenDetails[2].result), 12)} ${tokenDetails[1].result}` : "..."}</span>
              </Box>
              <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
              <strong style={{flex:'1 1 160px'}}>Total lock Value:</strong>
              <span > {isSuccess && valueLocked!==0 ?`$${(Number(formatRawAmount(Number(tokenDetails[3].result[2]).toString(), Number(tokenDetails[2].result), 12))*valueLocked).toFixed(7)}` : "unknown"}</span>
              </Box>
            </Flex>
          )}
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
            <span > {isSuccess && (`${formatRawAmount(Number(detail?.amount).toString(), Number(tokenDetails[2].result), 12)} ${tokenDetails[1].result}`)} </span>

            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Value Locked:</strong>
            <span > {isSuccess && valueLocked!==0  ?`$${(Number(formatRawAmount(Number(detail?.amount).toString(), Number(tokenDetails[2].result), 12))*valueLocked).toFixed(7)}` : "unknown"}</span>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Owner:</strong>
            <LinkExternal href={`https://bscscan.com/address/${detail?.owner}`}>
            <span >{`${detail?.owner.slice(0,6)}...${detail?.owner.slice(-4,detail?.owner.length)}`}</span>
            </LinkExternal>
            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Lock Date:</strong>
            <span > { getFormattedTime(detail?.lockDate)}</span>
            </Box>
           
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}> {detail?.cycle!== "0" ? 'TGE Date': "Unlock Date"}:</strong>
            <span > { getFormattedTime(detail?.tgeDate)}</span>
            </Box>
            {detail?.cycle !== "0" && (

              <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>TGE Percent:</strong>
            <span > {detail?.tgeBps/100}%</span>
            </Box>
              )}
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}>Unlocked Amount:</strong>
            <span > {isSuccess && (formatRawAmount(Number(detail?.unlockedAmount).toString(), Number(tokenDetails[2].result), 12))}</span>

            </Box>
            <Box mt="25px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row'}} width="90%">
            <strong style={{flex:'1 1 160px'}}> Withdrawable Amount:</strong>
            <span > {isSuccess && (`${formatRawAmount(Number(tokenDetails[4].result).toString(), Number(tokenDetails[2].result), 12)} ${tokenDetails[1].result}`)}</span>
            </Box>
              {isSuccess && tokenDetails[4].status === "success" && Number(tokenDetails[4].result) !== 0 &&
               detail.owner === account && (
            <Row justifyContent='center' mt='16px'>
                <Button p="0"  verticalAlign='center' width='50%' onClick={()=>unlock?.()}>
                    Unlock Now
                </Button>
            </Row>
            )}
          </Flex>
        </CardBody>
      </Card>
      {detail && (Number(detail?.cycle)!==0) &&(
        <>
          <DisplayVesting />
          <PaginationButton showMaxPageText maxPage={maxPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </>)}
      </Container>
    </Page>
    )
      }


export default Detail