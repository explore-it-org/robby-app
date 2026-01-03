import Svg, { Path, Rect, G } from 'react-native-svg';

interface ProgramIconProps {
  size?: number;
  color?: string;
}

export function ProgramIcon({ size = 24, color = '#000000' }: ProgramIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <G fillRule="nonzero">
          <Rect x="0" y="0" width="24" height="24" />
          <Path
            d="M17.5555556,4 L17.555,9.714 L19.7142857,9.71428571 C20.9766509,9.71428571 22,10.7376349 22,12 C22,13.2623651 20.9766509,14.2857143 19.7142857,14.2857143 L17.555,14.285 L17.5555556,20 L2,20 L2,14.285 L4.15873016,14.2857143 C5.36849675,14.2857143 6.35875039,13.3458676 6.43917124,12.156494 L6.44444444,12 C6.44444444,10.7902334 5.50459775,9.79997977 4.31522419,9.71955892 L4.15873016,9.71428571 L2,9.714 L2,4 L17.5555556,4 Z"
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
