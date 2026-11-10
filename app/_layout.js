import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { ToastProvider } from '../src/components/Toast';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerTintColor: colors.primary }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ title: 'Entrar', presentation: 'modal' }} />
            <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
          </Stack>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
