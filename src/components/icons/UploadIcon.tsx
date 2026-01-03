/**
 * UploadIcon Component
 *
 * Upload icon - arrow pointing up with base line
 * Based on upload.svg from legacy app
 */

import Svg, { Path, Polyline, Line, G } from 'react-native-svg';

interface UploadIconProps {
  size?: number;
  color?: string;
}

export function UploadIcon({ size = 24, color = '#FFFFFF' }: UploadIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" fillRule="evenodd">
        {/* Upload arrow group (scaled and flipped) */}
        <G
          transform="translate(11.858628, 9.042782) scale(1, -1) translate(-11.858628, -9.042782) translate(7.858628, 2.042782)"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          {/* Vertical line */}
          <Path d="M3.91466798,0 C3.91466798,2.32281562 3.92699237,6.63676719 3.95164115,12.9418547" />
          {/* Arrow head */}
          <Polyline points="0 9.80500568 3.95164115 13.6827005 7.82933597 9.80500568" />
        </G>
        {/* Base line */}
        <Line
          x1="4"
          y1="20.5"
          x2="20"
          y2="20.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
