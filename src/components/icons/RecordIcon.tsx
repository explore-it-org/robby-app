import Svg, { Rect } from 'react-native-svg';

interface RecordIconProps {
  size?: number;
  color?: string;
}

export function RecordIcon({ size = 24, color = '#FFFFFF' }: RecordIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
