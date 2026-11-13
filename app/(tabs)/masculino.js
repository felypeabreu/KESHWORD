import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { PRODUCTS } from '../../src/data/products';

const COLORS = {
  pink: '#FC3B7F',
  cream: '#FEF1CF',
  blue: '#0032A8',
  ink: '#0d0d12',
  white: '#ffffff',
};

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const CATS = ['Todos', 'Camisetas', 'Moletons', 'Jaquetas', 'Calças', 'Acessórios'];
const ROUPA = ['P', 'M', 'G', 'GG'];

const LOOKBOOK = [
  { id: 'l1', uri: 'https://images.unsplash.com/photo-1567894173760-22aff4400f21?auto=format&fit=crop&w=800&q=75' },
  { id: 'l2', uri: 'https://images.unsplash.com/photo-1692844399631-e7c6e3925662?auto=format&fit=crop&w=800&q=75' },
  { id: 'l3', uri: 'https://images.unsplash.com/photo-1762052508120-2607918d663f?auto=format&fit=crop&w=800&q=75' },
  { id: 'l4', uri: 'https://images.unsplash.com/photo-1760890720897-1692e70d21f1?auto=format&fit=crop&w=800&q=75' },
];

export default function MasculinoScreen() {
  const router = useRouter();
  const { addToCart, totalItems } = useCart();
  const { width } = useWindowDimensions();

  // Detecta se está no navegador do computador ou em tela pequena de celular
  const isDesktop = width >= 860;
  const isTablet = width >= 600 && width < 860;

  const [selectedCat, setSelectedCat] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rel');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [favorites, setFavorites] = useState({});
  const [toastMsg, setToastMsg] = useState('');

  const masculinoProducts = useMemo(() => {
    return PRODUCTS.filter((p) => !p.gender || p.gender.toLowerCase() === 'masculino');
  }, []);

  const filteredProducts = useMemo(() => {
    const norm = (t) =>
      String(t || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    let list = masculinoProducts.filter((p) => {
      const matchCat = selectedCat === 'Todos' || p.cat === selectedCat;
      const matchQuery = norm(`${p.name} ${p.cat}`).includes(norm(searchQuery));
      return matchCat && matchQuery;
    });

    if (sortBy === 'menor') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'maior') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return list;
  }, [masculinoProducts, selectedCat, searchQuery, sortBy]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (product) => {
    const sizes = product.sizes || ROUPA;
    const chosenSize = selectedSizes[product.id] || sizes[Math.min(1, sizes.length - 1)];
    addToCart({ ...product, size: chosenSize, qty: 1 });
    showToast(`${product.name} (${chosenSize}) na sacola!`);
  };

  // Largura responsiva dos cards (4 colunas no PC, 3 no tablet, 2 no celular)
  const cardWidth = isDesktop ? '23.5%' : isTablet ? '31.5%' : '48%';
  const lookCardWidth = isDesktop ? '23.5%' : '48%';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

      {/* HEADER (100% da largura) */}
      <View style={[styles.nav, isDesktop && styles.navDesktop]}>
        <View style={styles.logoWrap}>
          <View style={styles.logoSquare} />
          <Text style={styles.logoText}>KESH WORD</Text>
        </View>

        <TouchableOpacity
          style={styles.bagBtn}
          onPress={() => router.push('/(tabs)/carrinho')}
          activeOpacity={0.85}
        >
          <Text style={styles.bagBtnText}>SACOLA ({totalItems || 0})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO (100% rosa, lado a lado no PC) */}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <View style={[styles.heroLeft, isDesktop && styles.heroLeftDesktop]}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>COLEÇÃO 01</Text>
            </View>

            <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
              MASCULINO
            </Text>
            <Text style={[styles.heroLead, isDesktop && styles.heroLeadDesktop]}>
              Peças pra andar na rua do seu jeito: corte largo, cor forte e conforto o dia todo.
            </Text>

            <Text style={styles.heroNote}>✦ Frete grátis acima de R$ 250 • 6x sem juros</Text>
          </View>

          <View style={[styles.heroPhotoBox, isDesktop && styles.heroPhotoBoxDesktop]}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1632682582909-2b3a2581eef7?auto=format&fit=crop&w=1000&q=80',
              }}
              style={styles.heroPhoto}
            />
            <View style={styles.sticker}>
              <Text style={styles.stickerText}>NOVO{'\n'}DROP</Text>
            </View>
            <View style={styles.photoTag}>
              <Text style={styles.photoTagText}>KESH WORD</Text>
            </View>
          </View>
        </View>

        {/* MARQUEE */}
        <View style={styles.marquee}>
          <Text style={styles.marqueeText}>
            FRETE GRÁTIS ACIMA DE R$ 250  ✦  6X SEM JUROS  ✦  TROCA EM 30 DIAS  ✦  COLEÇÃO 01 NO AR
          </Text>
        </View>

        {/* CATÁLOGO */}
        <View style={[styles.catalog, isDesktop && styles.sectionDesktop]}>
          <View style={styles.catHead}>
            <Text style={[styles.catTitle, isDesktop && styles.catTitleDesktop]}>
              CATÁLOGO MASCULINO
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'peça' : 'peças'}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CATS.map((cat) => {
              const active = selectedCat === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedCat(cat)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.toolsRow, isDesktop && styles.toolsRowDesktop]}>
            <View style={[styles.searchBox, isDesktop && { flex: 1 }]}>
              <Text style={styles.fieldLabel}>BUSCAR PEÇA</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: moletom, cargo, boné..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.sortWrap}>
              <Text style={styles.fieldLabel}>ORDENAR POR</Text>
              <View style={styles.sortRow}>
                {[
                  { id: 'rel', label: 'Relevância' },
                  { id: 'menor', label: 'Menor preço' },
                  { id: 'maior', label: 'Maior preço' },
                  { id: 'az', label: 'A–Z' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.sortPill, sortBy === opt.id && styles.sortPillActive]}
                    onPress={() => setSortBy(opt.id)}
                  >
                    <Text style={[styles.sortPillText, sortBy === opt.id && styles.sortPillTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>NADA POR AQUI</Text>
              <Text style={styles.emptySub}>
                Nenhuma peça encontrada. Tente outra busca ou categoria.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredProducts.map((item) => {
                const sizes = item.sizes || ROUPA;
                const currentSize =
                  selectedSizes[item.id] || sizes[Math.min(1, sizes.length - 1)];
                const isFav = !!favorites[item.id];
                const discount = item.old ? Math.round((1 - item.price / item.old) * 100) : 0;

                return (
                  <View key={item.id} style={[styles.card, { width: cardWidth }]}>
                    <View
                      style={[
                        styles.thumb,
                        { backgroundColor: item.bg || COLORS.cream, height: isDesktop ? 280 : 190 },
                      ]}
                    >
                      <Image source={{ uri: item.image }} style={styles.productImg} />

                      {item.badge === 'NOVO' && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>NOVO</Text>
                        </View>
                      )}

                      {discount > 0 && (
                        <View style={styles.offBadge}>
                          <Text style={styles.offText}>{discount}%</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.favBtn, isFav && styles.favBtnActive]}
                        onPress={() => toggleFavorite(item.id)}
                      >
                        <Text style={styles.favIcon}>{isFav ? '♥' : '♡'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardCat}>{item.cat.toUpperCase()}</Text>
                      <Text style={styles.cardName}>{item.name}</Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceMain}>{BRL.format(item.price)}</Text>
                        {item.old && <Text style={styles.priceOld}>{BRL.format(item.old)}</Text>}
                      </View>
                      <Text style={styles.installment}>
                        ou 6x de {BRL.format(item.price / 6)} sem juros
                      </Text>

                      <View style={styles.sizesRow}>
                        {sizes.map((sz) => {
                          const pressed = sz === currentSize;
                          return (
                            <TouchableOpacity
                              key={sz}
                              style={[styles.sizeBtn, pressed && styles.sizeBtnActive]}
                              onPress={() => handleSelectSize(item.id, sz)}
                            >
                              <Text style={[styles.sizeText, pressed && styles.sizeTextActive]}>
                                {sz}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddToCart(item)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.addBtnText}>ADICIONAR À SACOLA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* LOOKBOOK */}
        <View style={[styles.lookSection, isDesktop && styles.sectionDesktop]}>
          <View style={styles.lookHead}>
            <Text style={[styles.lookTitle, isDesktop && styles.catTitleDesktop]}>LOOKBOOK</Text>
            <Text style={styles.lookSub}>
              Referências de estilo para a Coleção 01: moletom largo, cor e atitude.
            </Text>
          </View>

          <View style={styles.lookGrid}>
            {LOOKBOOK.map((look) => (
              <View
                key={look.id}
                style={[
                  styles.lookCard,
                  { width: lookCardWidth, height: isDesktop ? 380 : 240 },
                ]}
              >
                <Image source={{ uri: look.uri }} style={styles.lookImg} />
                <View style={styles.photoTag}>
                  <Text style={styles.photoTagText}>KESH WORD</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* BENEFÍCIOS */}
        <View
          style={[
            styles.perksSection,
            isDesktop && { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 56 },
          ]}
        >
          <View style={[styles.perkItem, isDesktop && { flex: 1 }]}>
            <Text style={styles.perkTitle}>FRETE GRÁTIS</Text>
            <Text style={styles.perkText}>Em compras acima de R$ 250 para todo o Brasil.</Text>
          </View>
          <View style={[styles.perkItem, isDesktop && { flex: 1 }]}>
            <Text style={styles.perkTitle}>6X SEM JUROS</Text>
            <Text style={styles.perkText}>Parcele no cartão em até 6 vezes, sem juros.</Text>
          </View>
          <View style={[styles.perkItem, isDesktop && { flex: 1 }]}>
            <Text style={styles.perkTitle}>TROCA EM 30 DIAS</Text>
            <Text style={styles.perkText}>Não serviu? Troque a primeira vez sem custo.</Text>
          </View>
        </View>
      </ScrollView>

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream, width: '100%' },
  scrollContent: { paddingBottom: 0, width: '100%' },

  /* NAV */
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 3,
    borderColor: COLORS.ink,
    width: '100%',
  },
  navDesktop: { paddingHorizontal: 56 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSquare: {
    width: 18,
    height: 18,
    backgroundColor: COLORS.pink,
    borderWidth: 3,
    borderColor: COLORS.ink,
  },
  logoText: { fontSize: 22, fontWeight: '900', color: COLORS.ink, letterSpacing: 1 },
  bagBtn: {
    backgroundColor: COLORS.ink,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: COLORS.pink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  bagBtnText: { color: COLORS.cream, fontWeight: '800', fontSize: 13, letterSpacing: 1 },

  /* HERO */
  hero: {
    backgroundColor: COLORS.pink,
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderBottomWidth: 3,
    borderColor: COLORS.ink,
    width: '100%',
  },
  heroDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 56,
    paddingVertical: 48,
    gap: 40,
  },
  heroLeft: { width: '100%' },
  heroLeftDesktop: { flex: 1.15 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  tagText: { color: COLORS.cream, fontWeight: '800', fontSize: 13, letterSpacing: 1.5 },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.cream,
    lineHeight: 50,
    textShadowColor: COLORS.ink,
    textShadowOffset: { width: 5, height: 5 },
    textShadowRadius: 0,
  },
  heroTitleDesktop: {
    fontSize: 82,
    lineHeight: 82,
  },
  heroLead: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
    lineHeight: 24,
  },
  heroLeadDesktop: {
    fontSize: 20,
    lineHeight: 28,
    maxWidth: 460,
  },
  heroPhotoBox: {
    marginTop: 24,
    width: '100%',
    height: 360,
    borderWidth: 3,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.cream,
    position: 'relative',
    shadowColor: COLORS.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  heroPhotoBoxDesktop: {
    marginTop: 0,
    width: 400,
    height: 480,
    transform: [{ rotate: '-2deg' }],
  },
  heroPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  sticker: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.blue,
    borderWidth: 3,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '12deg' }],
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  stickerText: {
    color: COLORS.cream,
    fontWeight: '900',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 17,
  },
  photoTag: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  photoTagText: { color: COLORS.cream, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  heroNote: { marginTop: 20, fontSize: 14, fontWeight: '800', color: COLORS.ink },

  /* MARQUEE */
  marquee: {
    backgroundColor: COLORS.ink,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
    borderColor: COLORS.ink,
    width: '100%',
  },
  marqueeText: {
    color: COLORS.cream,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  /* CATÁLOGO */
  catalog: { paddingHorizontal: 20, paddingVertical: 36, width: '100%' },
  sectionDesktop: { paddingHorizontal: 56, paddingVertical: 56 },
  catHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 22,
  },
  catTitle: { fontSize: 30, fontWeight: '900', color: COLORS.ink, lineHeight: 32 },
  catTitleDesktop: { fontSize: 48, lineHeight: 50 },
  countBadge: {
    backgroundColor: COLORS.pink,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  countText: { fontWeight: '800', fontSize: 13, color: COLORS.ink },

  chipsRow: { gap: 10, paddingBottom: 18 },
  chip: {
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  chipText: { fontWeight: '800', fontSize: 14, color: COLORS.ink },
  chipTextActive: { color: COLORS.white },

  toolsRow: { gap: 12, marginBottom: 24 },
  toolsRowDesktop: { flexDirection: 'row', alignItems: 'flex-end', gap: 20 },
  searchBox: { marginBottom: 4 },
  sortWrap: { marginBottom: 4 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    color: COLORS.ink,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.ink,
  },

  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sortPill: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  sortPillActive: { backgroundColor: COLORS.ink },
  sortPillText: { fontSize: 13, fontWeight: '700', color: COLORS.ink },
  sortPillTextActive: { color: COLORS.cream },

  /* GRID */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.ink,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  thumb: {
    borderBottomWidth: 3,
    borderColor: COLORS.ink,
    position: 'relative',
  },
  productImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: COLORS.ink,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: COLORS.cream, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  offBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: COLORS.pink,
    borderWidth: 2,
    borderColor: COLORS.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  offText: { fontWeight: '900', fontSize: 12, color: COLORS.ink },
  favBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 36,
    height: 36,
    backgroundColor: COLORS.cream,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: { backgroundColor: COLORS.pink },
  favIcon: { fontSize: 18, fontWeight: '900', color: COLORS.ink },

  cardInfo: { padding: 14, gap: 8 },
  cardCat: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#555' },
  cardName: { fontSize: 16, fontWeight: '800', color: COLORS.ink },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  priceMain: { fontSize: 20, fontWeight: '900', color: COLORS.ink },
  priceOld: { fontSize: 13, textDecorationLine: 'line-through', color: '#777' },
  installment: { fontSize: 12, color: '#444', marginTop: -4 },

  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  sizeBtn: {
    minWidth: 34,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: 'center',
  },
  sizeBtnActive: { backgroundColor: COLORS.ink },
  sizeText: { fontWeight: '800', fontSize: 12, color: COLORS.ink },
  sizeTextActive: { color: COLORS.cream },

  addBtn: {
    marginTop: 8,
    backgroundColor: COLORS.pink,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingVertical: 11,
    alignItems: 'center',
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  addBtnText: { fontWeight: '900', fontSize: 12, letterSpacing: 0.8, color: COLORS.ink },

  emptyBox: {
    padding: 40,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: COLORS.ink,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: { fontSize: 24, fontWeight: '900', color: COLORS.ink, marginBottom: 6 },
  emptySub: { textAlign: 'center', fontWeight: '600', color: COLORS.ink },

  /* LOOKBOOK */
  lookSection: {
    backgroundColor: COLORS.pink,
    paddingHorizontal: 20,
    paddingVertical: 36,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: COLORS.ink,
    width: '100%',
  },
  lookHead: { marginBottom: 22 },
  lookTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.cream,
    textShadowColor: COLORS.ink,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  lookSub: { fontWeight: '700', color: COLORS.ink, marginTop: 6, fontSize: 15 },
  lookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  lookCard: {
    borderWidth: 3,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.cream,
    position: 'relative',
    shadowColor: COLORS.ink,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  lookImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  /* BENEFÍCIOS */
  perksSection: {
    backgroundColor: COLORS.blue,
    padding: 24,
    gap: 24,
    borderBottomWidth: 3,
    borderColor: COLORS.ink,
    width: '100%',
  },
  perkItem: { gap: 6 },
  perkTitle: { fontSize: 22, fontWeight: '900', color: COLORS.cream },
  perkText: { color: COLORS.white, fontSize: 14, lineHeight: 20 },

  /* TOAST */
  toast: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: COLORS.ink,
    borderWidth: 3,
    borderColor: COLORS.cream,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toastText: { color: COLORS.cream, fontWeight: '800', fontSize: 14 },
});