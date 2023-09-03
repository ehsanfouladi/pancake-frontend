import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, erc20ABI, readContracts, useAccount, useContractReads } from 'wagmi'
import { getCadinuLockv3Address } from 'utils/addressHelpers'
import { CadinuLockV3Abi } from 'config/abi/cadinuLockV3'
import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { useTranslation } from '@pancakeswap/localization'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { Box, Button, Card, CardBody, CardFooter, CardHeader, Container, Flex, Heading, LinkExternal, Loading, Skeleton, StyledTooltip, Text, TimerIcon,  useTooltip } from '@pancakeswap/uikit'
import { CardWrapper } from '@pancakeswap/uikit/src/widgets/Liquidity'
import Page from 'views/Page'
import { fetchLocksForNonFungiblePositionManager } from '../helpers'

interface EndTimeTooltipComponentProps {
    endTime: number;
  }
export const LockV3 = ({tokenId}) => {
    const PAGE_SIZE = 8
    const [count,setCount]=useState(0)
    const [currentPage, setCurrentPage]= useState(1)
    const [nfts, setNfts] = useState([])
    const [positionTokens, setPositionTokens] = useState({token0:"", token1:""})
    const [maxPage, setMaxPage] = useState(1)
    const {address:account} = useAccount()
    const getMaxNfts = useCallback(async()=>{
        const fetchedCount = await fetchLocksForNonFungiblePositionManager(tokenId)
        setCount( fetchedCount[0]?.amount)
        setMaxPage(Math.ceil(fetchedCount[0]?.amount/PAGE_SIZE))
    },[tokenId])
    
    const LockV3Contract = {
        address: getCadinuLockv3Address(),
        abi: CadinuLockV3Abi
    }    

    const nonfungiblePositionManagerContract = {
        address: tokenId,
        abi: nonfungiblePositionManagerABI
    }

    const {data:Nfts, isSuccess} = useContractReads({
        contracts:[{
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


    const [lpNameSymbols,setLpNameSymbols] = useState({})
    const getLpNames = async (tokens:Address[]) =>{
      
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
      `${nameAndSymbols.token0Symbol} ${nameAndSymbols.token1Symbol}`
      : "loading..."
      setLpNameSymbols({name : "", symbol: lpSymbol})
    }catch(e){
        console.log(e);
        
      }
      
    }

   


    useEffect(()=>{
        if (isSuccess){
            const fetchedNfts = []
            Nfts[0].result.map(res=>
                fetchedNfts.push(res)
            )
            setNfts(fetchedNfts)
        }
       
    },[isSuccess])

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

console.log(Nfts);
console.log("nfts", nfts)


    const {data:positions, isSuccess:isPositionSuccess} = useContractReads({
        enabled: isSuccess,
        contracts:[{
            ...nonfungiblePositionManagerContract,
            functionName: "positions",
            args:[nfts[0]?.nftId]
        },
        {
            ...nonfungiblePositionManagerContract,
            functionName: "positions",
            args:[nfts[1]?.nftId]
        }
    ]
    })
    console.log("positions", positions)
    const {
        targetRef: titleRef,
        tooltip: titleTooltip,
        tooltipVisible:titleTooltipVisible,
      } = useTooltip(<StyledTooltip>lock description</StyledTooltip>, {
        placement: "top",
      })

    const makeNftCards = ()=>{
        if (!isPositionSuccess) {
            return <Skeleton />
        }
        return(
            positions.map((position, index) =>{
                if(!position.error){
                    getLpNames([position.result[2],position.result[3]])
                    return(
                        <>
                        <CardWrapper margin='5px' style={{flexWrap:"wrap"}}>
                        <Card>
                            <CardHeader style={{textAlign:'center'}} >
                               <Heading>
                               {
                               Nfts[1].status==='success' 
                               ? `${Nfts[1].result} #${Nfts[0].result[index].nftId}` 
                               : tokenId}
                               </Heading>
                               {titleTooltipVisible && titleTooltip}
                            </CardHeader>
                        </Card>
                        <CardBody >
                            
                            <Heading
                            ref={titleRef}
                             style={
                                {
                                    textAlign:'center',
                                    textDecorationColor:"GrayText",
                                    textDecoration:"underline",
                                }} mb="5px"
                                
                             >
                                {Nfts[0].result[index].description.slice(0,30)}
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
                                    <span >{Nfts[0].result[index].lockId.toString()}</span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                                    <strong style={{flex:'1 1 160px'}}>Position Symbol:</strong>
                                    <span >{lpNameSymbols['symbol']}</span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                                    <strong style={{flex:'1 1 160px'}}>Position Fee:</strong>
                                    <span >{position.result[4]}</span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                                    <strong style={{flex:'1 1 160px'}}>Position Liquidity:</strong>
                                    <span >{position.result[7].toString()}</span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                                    <strong style={{flex:'1 1 160px'}}>Lock Date:</strong>
                                    <span style={{margin:"3px"}}>
                                        <TimeCountdownDisplay timestamp={Number(Nfts[0].result[index].lockDate)} />
                                    </span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                                    <strong style={{flex:'1 1 160px'}}>Unlock Date:</strong>
                                    <span style={{margin:"3px"}}>
                                        <TimeCountdownDisplay timestamp={Number(Nfts[0].result[index].unlockDate)} />
                                    </span>
                                </Box>
                                <Box mt="5px" style={{display:'flex' , flexWrap:'wrap', flexDirection:'row' }} width="90%">
                                    <strong style={{flex:'1 1 160px'}}>Owner:</strong>
                                    <LinkExternal href={`https://bscscan.com/address/${Nfts[0].result[index].owner}`}>
                                        <span >{`${Nfts[0].result[index].owner.slice(0,6)}...${Nfts[0].result[index].owner.slice(-4,Nfts[0].result[index].owner.length)}`}</span>
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
                                <Text>You can Unlcok Your Asset Simply By One Click</Text>
                                <Button width="50%" mt="5px" disabled={
                                    Nfts[0].result[index].isUnlocked 
                                    || !account 
                                    || account!==Nfts[0].result[index].owner
                                    }>
                                    Unlock
                                </Button>
                                </Flex>
                            </CardFooter>
                        </CardWrapper>
                        </>
                    )
                }
            return <Loading
             />
        }
    ))
        }

    useEffect(()=>{
        if(!isSuccess){
            getMaxNfts()
        }
        // if(isSuccess){
        //     makeNftCards()
        // }
    }, [isSuccess])

  return (
    <>
    <Page>
    <Container>
    <Flex flexWrap="wrap" flexDirection='row' justifyContent='space-between'>
        {isPositionSuccess && makeNftCards()}
    </Flex>
    </Container>
    </Page>
        
    </>
  )
}
