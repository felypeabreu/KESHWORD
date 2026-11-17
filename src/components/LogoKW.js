import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LogoKW({ size = 36, color = '#0d0d12', style }) {
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderWidth: Math.max(2, Math.round(size / 16)), borderColor: color },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.46, letterSpacing: -size * 0.02, color }]}>KW</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800', includeFontPadding: false },
});
