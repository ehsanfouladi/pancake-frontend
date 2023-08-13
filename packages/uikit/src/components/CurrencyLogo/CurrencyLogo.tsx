import { ChainId, Currency } from "@pancakeswap/sdk";
import { useMemo } from "react";
import { WrappedTokenInfo } from "@pancakeswap/token-lists";
import styled from "styled-components";
import { useHttpLocations } from "@pancakeswap/hooks";

import { TokenLogo } from "../TokenLogo";
import { BinanceIcon, LogoRoundIcon } from "../Svg";

import { getCurrencyLogoUrls } from "./utils";

const StyledLogo = styled(TokenLogo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`;

export function CurrencyLogo({
  currency,
  size = "24px",
  style,
}: {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined);

  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) return [];
    if (currency?.symbol === 'CADINU') return[];
    if (currency?.symbol === 'CBON') return[];

    if (currency?.isToken) {
      const logoUrls = getCurrencyLogoUrls(currency);

      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, ...logoUrls];
      }
      return [...logoUrls];
    }
    return [];
  }, [currency, uriLocations]);

  if (currency?.isNative) {
    if (currency.chainId === ChainId.BSC) {
      return <BinanceIcon width={size} style={style} />;
    }
    return (
      <StyledLogo
        size={size}
        srcs={[`https://assets.pancakeswap.finance/web/native/${currency.chainId}.png`]}
        width={size}
        style={style}
      />
    );
  }

  if (currency?.symbol === 'CADINU'){
    return(
    <StyledLogo
    size={size}
    srcs={[`https://s2.coinmarketcap.com/static/img/coins/64x64/22984.png`]}
    width={size}
    style={style}
  />)
    // <LogoRoundIcon width={size} style={style} />;
  }
  if (currency?.symbol === 'CBON'){
    return(
    <StyledLogo
    size={size}
    srcs={[`/images/cbonLogo.PNG`]}
    width={size}
    style={style}
  />)
    // <LogoRoundIcon width={size} style={style} />;
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} style={style} />;
}
