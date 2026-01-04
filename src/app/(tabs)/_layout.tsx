import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HapticTab } from '@/components/haptic-tab';
import { GearIcon } from '@/components/icons/GearIcon';
import { ProgramIcon } from '@/components/icons/ProgramIcon';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShown: true,
        tabBarButton: HapticTab,
        headerTitle: t('app.name'),
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
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="robots"
        options={{
          title: t('tabs.robot'),
          tabBarIcon: ({ color }) => <GearIcon size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: t('tabs.programs'),
          tabBarIcon: ({ color }) => <ProgramIcon size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
