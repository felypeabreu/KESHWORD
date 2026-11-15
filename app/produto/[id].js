import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { findProductById, imageSource, toCartItem } from '../../src/data/products';

const COLORS = {
  pink: '#FC3B7F',
  cream: '#FEF1CF',
  blue: '#0032A8',
  ink: '#0d0d12',
  white: '#ffffff',
};

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProdutoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, count } = useCart();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const product = findProductById(Array.isArray(id) ? id[0] : id);
  const sizes = product?.sizes || ['P', 'M', 'G', 'GG'];
  const [size, setSize] = useState(sizes[Math.min(1, sizes.length - 1)]);
  const [added, setAdded] = useState(false);

  const catalogRoute = product?.gender === 'feminino' ? '/(tabs)/feminino' : '/(tabs)/masculino';
  const goBack = () => (router.canGoBack() ? router.back() : router.replace(catalogRoute));

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Produto não encontrado</Text>
          <TouchableOpacity style={styles.addBtn} onPress={goBack}>
            <Text style={styles.addBtnText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const discount = product.old ? Math.round((1 - product.price / product.old) * 100) : 0;

  const handleAdd = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    addItem(toCartItem(product, size));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={goBack} style={styles.navBtn}>
          <Text style={styles.navBtnText}>← VOLTAR</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/carrinho')} style={styles.bagBtn}>
          <Text style={styles.bagBtnText}>SACOLA ({count || 0})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, isDesktop && styles.contentDesktop]}>
          <View style={[styles.imageWrap, isDesktop && styles.imageWrapDesktop]}>
            {imageSource(product) ? (
              <Image source={imageSource(product)} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.noPhoto}>
                <Text style={styles.noPhotoText}>FOTO EM BREVE</Text>
              </View>
            )}
            {product.badge === 'NOVO' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NOVO</Text>
              </View>
            )}
          </View>

          <View style={[styles.info, isDesktop && styles.infoDesktop]}>
            <Text style={styles.cat}>{product.cat.toUpperCase()}</Text>
            <Text style={styles.name}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{BRL.format(product.price)}</Text>
              {product.old && <Text style={styles.priceOld}>{BRL.format(product.old)}</Text>}
              {discount > 0 && (
                <View style={styles.offBadge}>
                  <Text style={styles.offText}>-{discount}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.installment}>
              ou 6x de {BRL.format(product.price / 6)} sem juros
            </Text>

            <Text style={styles.label}>TAMANHO</Text>
            <View style={styles.sizesRow}>
              {sizes.map((sz) => {
                const active = sz === size;
                return (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.sizeBtn, active && styles.sizeBtnActive]}
                    onPress={() => setSize(sz)}
                  >
                    <Text style={[styles.sizeText, active && styles.sizeTextActive]}>{sz}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>
                {added ? 'ADICIONADO ✓' : 'ADICIONAR À SACOLA'}
              </Text>
            </TouchableOpacity>
            {!user && <Text style={styles.hint}>Entre na sua conta para adicionar à sacola.</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
  },
  navBtn: { paddingVertical: 6 },
  navBtnText: { color: COLORS.ink, fontWeight: '800', letterSpacing: 1 },
  bagBtn: { backgroundColor: COLORS.ink, paddingHorizontal: 14, paddingVertical: 8 },
  bagBtnText: { color: COLORS.cream, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  scroll: { flexGrow: 1 },
  content: { width: '100%', maxWidth: 1100, alignSelf: 'center' },
  contentDesktop: { flexDirection: 'row', padding: 32, gap: 32 },
  imageWrap: { width: '100%', aspectRatio: 3 / 4, position: 'relative' },
  imageWrapDesktop: { flex: 1, aspectRatio: undefined, height: 640 },
  image: { width: '100%', height: '100%' },
  noPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cream,
  },
  noPhotoText: { color: COLORS.ink, fontWeight: '800', letterSpacing: 2, fontSize: 14 },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: COLORS.cream, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  info: { padding: 20 },
  infoDesktop: { flex: 1, padding: 0 },
  cat: { color: COLORS.blue, fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
  name: { color: COLORS.ink, fontWeight: '900', fontSize: 28, marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  price: { color: COLORS.ink, fontWeight: '900', fontSize: 26 },
  priceOld: { color: '#777', textDecorationLine: 'line-through', fontSize: 16 },
  offBadge: { backgroundColor: COLORS.pink, paddingHorizontal: 8, paddingVertical: 3 },
  offText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },
  installment: { color: '#555', marginTop: 4 },
  label: { color: COLORS.ink, fontWeight: '800', letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeBtn: {
    minWidth: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  sizeBtnActive: { backgroundColor: COLORS.ink },
  sizeText: { color: COLORS.ink, fontWeight: '800' },
  sizeTextActive: { color: COLORS.cream },
  addBtn: {
    marginTop: 28,
    backgroundColor: COLORS.pink,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.ink,
  },
  addBtnText: { color: COLORS.white, fontWeight: '900', letterSpacing: 1.5 },
  hint: { color: '#555', marginTop: 10, fontSize: 13 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  notFoundTitle: { color: COLORS.ink, fontWeight: '900', fontSize: 22 },
});
