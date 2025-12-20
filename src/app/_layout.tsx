import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { RobotManagerProvider } from '@/services/robot-manager-factory';
import '@/i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <RobotManagerProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors[colorScheme ?? 'light'].primary,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              color: '#FFFFFF',
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </RobotManagerProvider>
  );
}
