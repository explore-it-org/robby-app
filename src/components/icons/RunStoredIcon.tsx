/**
 * RunStoredIcon Component
 *
 * Run stored instructions icon - play triangle with "101" code text overlay
 */

import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

interface RunStoredIconProps {
  size?: number;
  color?: string;
}

export function RunStoredIcon({ size = 24, color = '#FFFFFF' }: RunStoredIconProps) {
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
      {/* "101" text */}
      <SvgText
        x="8"
        y="22"
        fontFamily="Courier"
        fontSize="10"
        fontWeight="normal"
        letterSpacing="-1"
        fill={color}
      >
        101
      </SvgText>
    </Svg>
  );
}
