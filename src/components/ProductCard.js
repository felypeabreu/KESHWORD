import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { brand } from '../theme';
import { sizes } from '../data/products';
import { formatPrice } from '../utils/validation';

export default function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState('M');

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onAdd({ ...product, tamanho: size });
  };

  const temBadge = typeof product.badge === 'string' && product.badge.length > 0;
  const temPrecoAntigo = typeof product.old === 'number' && product.old > product.preco;

  return (
    <View style={styles.card}>
      <View>
        <Image source={{ uri: product.imagem }} style={styles.image} resizeMode="cover" />
        {temBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.nome}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.preco)}</Text>
          {temPrecoAntigo && <Text style={styles.oldPrice}>{formatPrice(product.old)}</Text>}
        </View>

        <View style={styles.sizes}>
          {sizes.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSize(s)}
              style={[styles.sizeBtn, size === s && styles.sizeBtnActive]}
            >
              <Text style={[styles.sizeText, size === s && styles.sizeTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        >
          <Ionicons name="bag-add-outline" size={18} color={brand.ink} />
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
    backgroundColor: brand.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: brand.ink,
  },
  image: { width: '100%', aspectRatio: 4 / 5, backgroundColor: brand.cream },

  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: brand.pink,
    borderWidth: 1.5,
    borderColor: brand.ink,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: brand.ink, letterSpacing: 0.6 },

  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: '700', color: brand.ink, minHeight: 36 },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  price: { fontSize: 17, fontWeight: '800', color: brand.blue },
  oldPrice: { fontSize: 12, color: '#8a8a92', textDecorationLine: 'line-through' },

  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  sizeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: brand.ink,
    backgroundColor: brand.white,
  },
  sizeBtnActive: { backgroundColor: brand.blue, borderColor: brand.blue },
  sizeText: { fontSize: 12, fontWeight: '700', color: brand.ink },
  sizeTextActive: { color: brand.white },

  addBtn: {
    marginTop: 12,
    height: 42,
    borderRadius: 999,
    backgroundColor: brand.pink,
    borderWidth: 2,
    borderColor: brand.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnPressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  addText: { color: brand.ink, fontSize: 13, fontWeight: '800' },
});