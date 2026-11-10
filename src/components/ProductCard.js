import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme';
import { sizes } from '../data/products';
import { formatPrice } from '../utils/validation';

export default function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState('M');

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onAdd({ ...product, tamanho: size });
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.imagem }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.nome}</Text>
        <Text style={styles.price}>{formatPrice(product.preco)}</Text>

        <View style={styles.sizes}>
          {sizes.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSize(s)}
              style={[styles.sizeBtn, size === s && styles.sizeBtnActive]}
            >
              <Text style={[styles.sizeText, size === s && { color: '#fff' }]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={handleAdd} style={styles.addBtn}>
          <Ionicons name="bag-add-outline" size={18} color="#fff" />
          <Text style={styles.addText}>Adicionar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', aspectRatio: 4 / 5, backgroundColor: colors.border },
  info: { padding: 10 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, minHeight: 36 },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 4 },
  sizes: { flexDirection: 'row', gap: 6, marginTop: 8 },
  sizeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeText: { fontSize: 12, fontWeight: '600', color: colors.text },
  addBtn: {
    marginTop: 10,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
