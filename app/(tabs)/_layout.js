import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../src/theme';
import { useCart } from '../../src/context/CartContext';

// Ícone da aba: cheio quando a aba está ativa, só contorno quando não está.
const icone = (nome) =>
  function TabIcon({ color, size, focused }) {
    return <Ionicons name={focused ? nome : `${nome}-outline`} size={size} color={color} />;
  };

export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', letterSpacing: 2 },
        headerStyle: { backgroundColor: colors.background },
        tabBarLabelStyle: {
          fontSize: typography.caption.fontSize,
          fontWeight: typography.caption.fontWeight,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarBadgeStyle: { backgroundColor: colors.accent, color: '#fff' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'KESH', tabBarLabel: 'Início', tabBarIcon: icone('home') }}
      />
      <Tabs.Screen
        name="masculino"
        options={{ title: 'Masculino', tabBarIcon: icone('man') }}
      />
      <Tabs.Screen
        name="feminino"
        options={{ title: 'Feminino', tabBarIcon: icone('woman') }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarBadge: count > 0 ? count : undefined,
          tabBarIcon: icone('bag'),
        }}
      />
    </Tabs>
  );
}