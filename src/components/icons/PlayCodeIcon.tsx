/**
 * PlayCodeIcon Component
 *
 * Upload and run icon - play triangle with "123" code text overlay
 * Based on playcode.svg from legacy app
 */

import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

interface PlayCodeIconProps {
  size?: number;
  color?: string;
}

export function PlayCodeIcon({ size = 24, color = '#FFFFFF' }: PlayCodeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Play triangle */}
      <Polygon
        points="3 3 16 12 3 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* "123" text */}
      <SvgText
        x="8"
        y="22"
        fontFamily="Courier"
        fontSize="10"
        fontWeight="normal"
        letterSpacing="-1"
        fill={color}
      >
        123
      </SvgText>
    </Svg>
  );
}
