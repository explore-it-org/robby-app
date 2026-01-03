// Icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import {
  Platform,
  OpaqueColorValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  wifi: 'wifi',
  'folder.fill': 'folder',
  plus: 'add', // SF Symbol "plus" maps to Material Icon "add"
  'antenna.radiowaves.left.and.right': 'bluetooth', // SF Symbol for Bluetooth maps to Material Icon "bluetooth"
  'ellipsis.circle': 'more-horiz', // SF Symbol "ellipsis.circle" maps to Material Icon "more-horiz"
  play: 'play-arrow', // SF Symbol "play" maps to Material Icon "play-arrow" (outline)
  stop: 'stop-circle-outline', // SF Symbol "stop" maps to Material Icon "stop-circle-outline" (outline square)
  'circle.circle': 'radio-button-unchecked', // SF Symbol "circle.circle" maps to Material Icon "radio-button-unchecked" (outline circle for record)
  'arrow.down.circle': 'get-app', // SF Symbol "arrow.down.circle" maps to Material Icon "get-app" (outline download)
  'bolt.fill': 'flash-on', // SF Symbol "bolt.fill" maps to Material Icon "flash-on" (for connect)
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        weight={weight}
        tintColor={color as any}
        resizeMode="scaleAspectFit"
        name={name}
        style={style as StyleProp<ViewStyle>}
        size={size}
      />
    );
  }

  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
