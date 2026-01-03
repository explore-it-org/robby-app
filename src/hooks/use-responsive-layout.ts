/**
 * useResponsiveLayout Hook
 *
 * Detects screen size and determines the appropriate layout mode.
 * Returns true for tablet/wide screen layout (≥ 768px).
 */

import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;

export function useResponsiveLayout() {
  const [isTablet, setIsTablet] = useState(() => {
    const { width } = Dimensions.get('window');
    return width >= TABLET_BREAKPOINT;
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsTablet(window.width >= TABLET_BREAKPOINT);
    });

    return () => subscription?.remove();
  }, []);

  return { isTablet, breakpoint: TABLET_BREAKPOINT };
}
