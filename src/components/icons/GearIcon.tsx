import Svg, { Circle, Path, Rect, G } from 'react-native-svg';

interface GearIconProps {
  size?: number;
  color?: string;
}

export function GearIcon({ size = 24, color = '#FFFFFF' }: GearIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <G fillRule="nonzero">
          <Rect x="0" y="0" width="24" height="24" />
          <Circle
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            cx="12"
            cy="12"
            r="3"
          />
          <Path
            d="M14.634877,2.35077135 C15.4566198,2.57463679 16.2362397,2.90066818 16.9592462,3.31437501 L17.4534427,6.54655733 L20.685625,7.04075376 C21.0992075,7.76354297 21.4251672,8.54291157 21.6490268,9.36438213 L19.7123326,12 L21.6492286,14.634877 C21.4252593,15.4570011 21.0990293,16.2369632 20.6850491,16.9602526 L17.4534427,17.4534427 L16.9602526,20.6850491 C16.2369632,21.0990293 15.4570011,21.4252593 14.634877,21.6492286 L12,19.7123326 L9.36438213,21.6490268 C8.54291157,21.4251672 7.76354297,21.0992075 7.04075376,20.685625 L6.54655733,17.4534427 L3.31437501,16.9592462 C2.90066818,16.2362397 2.57463679,15.4566198 2.35077135,14.634877 L4.28766741,12 L2.35097322,9.36438213 C2.57483277,8.54291157 2.90079251,7.76354297 3.31437501,7.04075376 L6.54655733,6.54655733 L7.04075376,3.31437501 C7.76354297,2.90079251 8.54291157,2.57483277 9.36438213,2.35097322 L12,4.28766741 Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </G>
    </Svg>
  );
}
