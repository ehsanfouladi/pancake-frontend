import { Svg, SvgProps } from '@pancakeswap/uikit';
import React from 'react';

interface ValueColorPair {
  id : number;
  value: number;
  color: string;
}

const data: ValueColorPair[] = [
  { value: 2.425, color: '#FFE362', id:1 },
  { value: 3.6375, color: '#85C54E', id:2 },
  { value: 6.0625, color: '#028E75', id:3 },
  { value: 12.125, color: '#36E8F5', id:4 },
  { value: 24.25, color: '#A881FC',  id:5 },
  { value: 48.5, color: '#D750B2', id:6 },
  { value: 3, color: '#BDC2C4'  , id:7},
];

const total = data.reduce((acc, curr) => acc + curr.value, 0);

const PoolAllocationChart: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 103 105" {...props}>
      <svg width="103" height="105" viewBox="0 0 403 405" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse
          cx="201.5"
          cy="202.5"
          rx="200.5"
          ry="199.5"
          transform="rotate(-90 201.5 202.5)"
          fill="#BDC2C4"
          stroke="#0E0E0E"
          strokeOpacity="0.05"
          strokeWidth="2"
        />
        {data.map((item, index) => {
          const startAngle = data.slice(0, index).reduce((acc, curr) => acc + (curr.value / total) * 360, 0);
          const endAngle = startAngle + (item.value / total) * 360;
          const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

          const startX = 201.5 + Math.cos((startAngle * Math.PI) / 180) * 200.5;
          const startY = 202.5 + Math.sin((startAngle * Math.PI) / 180) * 199.5;
          const endX = 201.5 + Math.cos((endAngle * Math.PI) / 180) * 200.5;
          const endY = 202.5 + Math.sin((endAngle * Math.PI) / 180) * 199.5;

          return (
            <path
              key={item.id}
              d={`M201.5 202.5 L${startX} ${startY} A200.5 199.5 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
              fill={item.color}
              stroke="#0E0E0E"
              strokeOpacity="0.05"
              strokeWidth="2"
            />
          );
        })}
        <ellipse
          opacity="0.2"
          cx="201.5"
          cy="202.5"
          rx="200.5"
          ry="199.5"
          transform="rotate(-90 201.5 202.5)"
          stroke="#280D5F"
          strokeWidth="3"
        />
      </svg>
    </Svg>
  );
};

export default PoolAllocationChart;
