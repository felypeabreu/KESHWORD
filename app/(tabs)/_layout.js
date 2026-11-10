import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { useCart } from '../../src/context/CartContext';

export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerTitleStyle: { fontWeight: '800', letterSpacing: 2 },
        headerStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.card },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'KESH',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="masculino"
        options={{
          title: 'Masculino',
          tabBarIcon: ({ color, size }) => <Ionicons name="man-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feminino"
        options={{
          title: 'Feminino',
          tabBarIcon: ({ color, size }) => <Ionicons name="woman-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarBadge: count > 0 ? count : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
