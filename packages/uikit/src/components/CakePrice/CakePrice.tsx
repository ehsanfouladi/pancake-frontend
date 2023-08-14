import React from "react";
import styled from "styled-components";
// import LogoRound from "../Svg/Icons/LogoRound";
import Logo from "../Svg/Icons/Logo";
import Text from "../Text/Text";
import Skeleton from "../Skeleton/Skeleton";
import { Colors } from "../../theme";

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
`;

const CakePrice: React.FC<React.PropsWithChildren<Props>> = ({
  cakePriceUsd,
  color = "textSubtle",
  showSkeleton = true,
  chainId,
}) => {
  return cakePriceUsd ? (
    <PriceLink
      href={`https://apps.cadinu.io/swap?outputCurrency=0x76e112203eF59D445452ef7556386dD2DF3Ed914&chainId=${chainId}`}
      target="_blank"
    >
      <Logo width="24px" mr="8px" />
      <Text color={color} bold>{`$${cakePriceUsd.toFixed(8)}`}</Text>
    </PriceLink>
  ) : showSkeleton ? (
    <Skeleton width={80} height={24} />
  ) : null;
};

export default React.memo(CakePrice);
