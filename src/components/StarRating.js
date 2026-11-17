import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brand } from '../theme';

export default function StarRating({ value = 0, size = 16, onChange }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const nome = value >= n ? 'star' : value >= n - 0.5 ? 'star-half' : 'star-outline';
        const icone = <Ionicons name={nome} size={size} color={brand.pink} />;
        if (!onChange) return <View key={n}>{icone}</View>;
        return (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6} style={styles.touch}>
            {icone}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  touch: { padding: 2 },
});