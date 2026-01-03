import Svg, { Rect } from 'react-native-svg';

interface StopIconProps {
  size?: number;
  color?: string;
}

export function StopIcon({ size = 24, color = '#FFFFFF' }: StopIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
