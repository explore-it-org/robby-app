import Svg, { Polyline, Rect, G } from 'react-native-svg';

interface BluetoothIconProps {
  size?: number;
  color?: string;
}

export function BluetoothIcon({ size = 24, color = '#FFFFFF' }: BluetoothIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <G fillRule="nonzero">
          <Rect x="0" y="0" width="24" height="24" />
          <Polyline
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="6 18.3012089 17.8788804 6.42232851 12.4565519 2 12.4565519 22 17.8788804 17.5776715 6.72353744 6.42232851"
          />
        </G>
      </G>
    </Svg>
  );
}
