import Svg, { Circle, Defs, G, Mask, Use } from 'react-native-svg';

interface WheelIconProps {
  size?: number;
  color?: string;
}

export function WheelIcon({ size = 24, color = '#533F07' }: WheelIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <Circle id="path-1" cx="11.842623" cy="11.842623" r="11.842623" />
        <Mask
          id="mask-2"
          maskContentUnits="userSpaceOnUse"
          maskUnits="objectBoundingBox"
          x="0"
          y="0"
          width="23.6852459"
          height="23.6852459"
          fill="white"
        >
          <Use href="#path-1" />
        </Mask>
      </Defs>
      <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <G fillRule="nonzero" stroke={color}>
          <Use
            href="#path-1"
            mask="url(#mask-2)"
            strokeWidth="2.70688525"
            fill="#FFC523"
            strokeDasharray="1.082754135131836,2.03016387439165"
          />
          <Circle
            strokeWidth="0.676721311"
            fill="#FFFFFF"
            cx="11.842623"
            cy="6.90819672"
            r="2.19934426"
          />
          <Circle
            strokeWidth="0.676721311"
            fill="#FFFFFF"
            cx="11.842623"
            cy="16.7770492"
            r="2.19934426"
          />
          <Circle
            strokeWidth="0.676721311"
            fill="#FFFFFF"
            cx="6.90819672"
            cy="11.842623"
            r="2.19934426"
            transform="translate(6.908197, 11.842623) rotate(-90.000000) translate(-6.908197, -11.842623)"
          />
          <Circle
            strokeWidth="0.676721311"
            fill="#FFFFFF"
            cx="16.7770492"
            cy="11.842623"
            r="2.19934426"
            transform="translate(16.777049, 11.842623) rotate(-90.000000) translate(-16.777049, -11.842623)"
          />
        </G>
      </G>
    </Svg>
  );
}
