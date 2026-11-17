import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { brand } from '../theme';
import { firstAvailableSize, stockLabel, stockOf, totalStock } from '../data/products';
import { formatPrice } from '../utils/validation';

const TAMANHOS_PADRAO = ['P', 'M', 'G', 'GG'];

export default function ProductCard({ product, onAdd, onPress }) {
  const nome = product.nome ?? product.name;
  const preco = product.preco ?? product.price;
  const tamanhos = product.tamanhos || product.sizes || TAMANHOS_PADRAO;
  const [size, setSize] = useState(firstAvailableSize(product, tamanhos));
  const esgotado = totalStock(product) <= 0;
  const aviso = stockLabel(stockOf(product, size));

  const handleAdd = () => {
    if (esgotado || stockOf(product, size) <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onAdd({ ...product, tamanho: size });
  };

  const temBadge = typeof product.badge === 'string' && product.badge.length > 0;
  const temPrecoAntigo = typeof product.old === 'number' && product.old > preco;

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} disabled={!onPress}>
        {product.imagem ? (
          <Image source={{ uri: product.imagem }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.semFoto]}>
            <Text style={styles.semFotoText}>FOTO EM BREVE</Text>
          </View>
        )}
        {esgotado ? (
          <View style={[styles.badge, styles.badgeEsgotado]}>
            <Text style={styles.badgeText}>ESGOTADO</Text>
          </View>
        ) : temBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge.toUpperCase()}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2} onPress={onPress}>{nome}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(preco)}</Text>
          {temPrecoAntigo && <Text style={styles.oldPrice}>{formatPrice(product.old)}</Text>}
        </View>

        <View style={styles.sizes}>
          {tamanhos.map((s) => {
            const sem = stockOf(product, s) <= 0;
            return (
              <Pressable
                key={s}
                disabled={sem}
                onPress={() => setSize(s)}
                style={[styles.sizeBtn, size === s && styles.sizeBtnActive, sem && styles.sizeBtnSem]}
              >
                <Text
                  style={[
                    styles.sizeText,
                    size === s && styles.sizeTextActive,
                    sem && styles.sizeTextSem,
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {aviso && !esgotado ? <Text style={styles.aviso}>{aviso}</Text> : null}

        <Pressable
          onPress={handleAdd}
          disabled={esgotado}
          style={({ pressed }) => [
            styles.addBtn,
            pressed && styles.addBtnPressed,
            esgotado && styles.addBtnEsgotado,
          ]}
        >
          {!esgotado && <Ionicons name="bag-add-outline" size={18} color={brand.ink} />}
          <Text style={styles.addText}>{esgotado ? 'Esgotado' : 'Adicionar'}</Text>
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

  semFoto: { alignItems: 'center', justifyContent: 'center' },
  semFotoText: { color: brand.ink, fontWeight: '800', letterSpacing: 2, fontSize: 12 },

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
  badgeEsgotado: { backgroundColor: brand.white },
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
  sizeBtnSem: { borderColor: '#c9c9cf', backgroundColor: '#f1f1f3' },
  sizeTextSem: { color: '#a0a0a8', textDecorationLine: 'line-through' },
  aviso: { marginTop: 8, fontSize: 12, fontWeight: '700', color: brand.pink },
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
  addBtnEsgotado: { backgroundColor: '#e4e4e8', borderColor: '#b4b4bc' },
  addBtnPressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  addText: { color: brand.ink, fontSize: 13, fontWeight: '800' },
});