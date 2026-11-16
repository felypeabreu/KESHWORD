import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { ToastProvider } from '../src/components/Toast';

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="cadastro" />
            <Stack.Screen name="produto/[id]" />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}