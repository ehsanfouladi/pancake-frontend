// Import React from 'react'
import { Box, Card, CardBody, CardHeader, Svg, Text } from '@pancakeswap/uikit';
import React from 'react';
import { height } from 'styled-system';
import { parseEther } from 'viem';

// Define an interface for the object type
export interface ObjectWithProperties {
  id: string;
  liquidity: string;
  pool: {
    token0: {
      name: string;
      symbol: string;
      decimals: string;
      id: string;
    };
    token1: {
      id: string;
      name: string;
      decimals: string;
      symbol: string;
    };
    feeTier: string;
    liquidity: string;
    id: string;
    sqrtPrice: string;
    tick: string;
    totalValueLockedToken0: string;
    totalValueLockedToken1: string;
  };
  tickLower: {
    id: string;
  };
  tickUpper: {
    id: string;
  };
  token0: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  token1: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
}

// Define a React component that takes an object as nft and returns an SVG image
const ObjectSVG = ({nft, selectedNft}) => {
  // Define some variables for the layout and spacing
  const padding =8 ; 
  // Return a JSX element that renders the SVG image
  return (<>
    <Card m='24px' style={{height:'200px', width:'200px', cursor:'pointer', border:selectedNft === nft.id ? 'solid': 'none', borderWidth:'2px', borderColor:'#AA4A44'}} borderBackground={selectedNft === nft.id ? '#AA4A44': ''}
    >
        <CardHeader style={{textAlign:'center', height:'36px', paddingTop:'12 px'}}>
        <strong style={{marginTop:'5px'}}>{nft.token0.symbol}/{nft.token1.symbol}</strong>
        </CardHeader>
        <CardBody style={{textAlign:'center' ,padding:'5px'}}>
        <Box mb='5px'>
        <Text >Position ID: {nft.id}</Text>
        </Box>
            <Box mb='5px'>
        <strong style={{marginBottom:'5px'}}> Liquidity:</strong>
        <Text>{nft.liquidity}</Text>
            </Box>
            
        <Box mb='5px'>
        <strong style={{marginBottom:'5px'}}> Fee Tier:</strong>

        <Text >{nft.pool.feeTier}</Text>
        </Box>
        </CardBody>
    </Card>
        </>)
    
};

// Export the component
export default ObjectSVG;
