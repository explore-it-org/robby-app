import Svg, { Polygon } from 'react-native-svg';

interface PlayIconProps {
  size?: number;
  color?: string;
}

export function PlayIcon({ size = 24, color = '#FFFFFF' }: PlayIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="7 3 20 12 7 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
