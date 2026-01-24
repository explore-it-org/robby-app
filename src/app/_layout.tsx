import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { RobotManagerProvider } from '@/services/robot-manager-factory';
import { ProgramStorageProvider } from '@/hooks/use-program-storage';
import { BleManagerProvider } from '@/hooks/use-robot-discovery';
import { NativeBleManager } from '@/ble/native';
import '@/i18n';

const bleManager = new NativeBleManager();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      card: Colors.light.primary,
    },
  };

  return (
    <BleManagerProvider value={bleManager}>
      <ProgramStorageProvider>
        <RobotManagerProvider>
          <ThemeProvider value={customTheme}>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: Colors.light.primary,
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
      </ProgramStorageProvider>
    </BleManagerProvider>
  );
}
