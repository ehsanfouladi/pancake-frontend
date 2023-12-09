import React from "react";
import styled from "styled-components";
// import LogoRound from "../Svg/Icons/LogoRound";

import Image from "next/image";
import { Colors } from "../../theme";
import Skeleton from "../Skeleton/Skeleton";
import Text from "../Text/Text";

export interface Props {
  color?: keyof Colors;
  cakePriceUsd?: number;
  showSkeleton?: boolean;
  chainId: number;
}

const PriceLink = styled.a`
  display: flex;
  align-items: center;
  svg {
    transition: transform 0.3s;
  }
  :hover {
    svg {
      transform: scale(1.2);
    }
  }
  img {
    transition: transform 0.3s;
  }
  :hover {
    img {
      transform: scale(1.2);
    }
  }
`;

const CakePrice: React.FC<React.PropsWithChildren<Props>> = ({
  cakePriceUsd,
  color = "textSubtle",
  showSkeleton = true,
  chainId,
}) => {
  return cakePriceUsd ? (
    <PriceLink
      href={`https://apps.cadinu.io/swap?outputCurrency=0x6e64fCF15Be3eB71C3d42AcF44D85bB119b2D98b&chainId=56&chain=${chainId}`}
      target="_blank"
    >
      {/* <Logo width="24px" mr="8px" /> */}
      <Image style={{marginRight:'8px'}} width={30} height={30} src='/images/cbonLogo.PNG' alt="cadinu bounos logo"/>
      <Text color={color} bold>{`$${cakePriceUsd.toFixed(8)}`}</Text>
    </PriceLink>
  ) : showSkeleton ? (
    <Skeleton width={80} height={24} />
  ) : null;
};

export default React.memo(CakePrice);
