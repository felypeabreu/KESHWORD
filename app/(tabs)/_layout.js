import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';
import LogoKW from '../../src/components/LogoKW';
import { useCart } from '../../src/context/CartContext';

const rotulo = (texto) =>
  function TabLabel({ focused }) {
    return (
      <View style={[styles.item, focused && styles.itemAtivo]}>
        <Text style={[styles.texto, focused && styles.textoAtivo]}>{texto}</Text>
      </View>
    );
  };

export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', letterSpacing: 2 },
        headerStyle: { backgroundColor: colors.background },
        tabBarShowLabel: true,
        tabBarIconStyle: { display: 'none' },
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: colors.primary,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 0,
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'KESH WORD',
          tabBarLabel: rotulo('NEW'),
          headerTitle: () => (
            <View style={styles.titulo}>
              <LogoKW size={28} />
              <Text style={styles.tituloTexto}>KESH WORD</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="masculino"
        options={{ title: 'Masculino', tabBarLabel: rotulo('MASCULINO') }}
      />
      <Tabs.Screen
        name="feminino"
        options={{ title: 'Feminino', tabBarLabel: rotulo('FEMININO') }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarLabel: rotulo(count > 0 ? `CARRINHO (${count})` : 'CARRINHO'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarLabel: rotulo('PERFIL') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  titulo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tituloTexto: { fontSize: 17, fontWeight: '800', letterSpacing: 2, color: colors.primary },
  item: {
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  itemAtivo: { borderBottomColor: colors.primary },
  texto: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.muted,
  },
  textoAtivo: { color: colors.primary, fontWeight: '800' },
});
