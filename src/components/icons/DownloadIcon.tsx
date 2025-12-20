import Svg, { Path, Polyline, Line } from 'react-native-svg';

interface DownloadIconProps {
  size?: number;
  color?: string;
}

export function DownloadIcon({ size = 24, color = '#FFFFFF' }: DownloadIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M11.7732958,2.04278154 C11.7732958,4.36559716 11.7856202,8.67954873 11.8102689,14.9846363"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Polyline
        points="7.8586278 11.8477872 11.8102689 15.725482 15.6879638 11.8477872"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
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
    </Svg>
  );
}
