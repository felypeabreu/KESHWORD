import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../../src/components/ProductGrid';
import { useAuth } from '../../src/context/AuthContext';
import { fetchProducts } from '../../src/services/productService';
import { brand, breakpoints, layout } from '../../src/theme';

// ✏️ EDITE AQUI: textos da Home
const CONTEUDO = {
  etiqueta: 'COLEÇÃO 01',
  titulo: 'NOVA\nCOLEÇÃO',
  texto: 'Streetwear de corte largo, cor forte e atitude. Escolha o seu lado e monte o seu look.',
  botaoMasc: 'VER MASCULINO',
  botaoFem: 'VER FEMININO',
  selo: 'NOVO\nDROP',
  faixa: 'FRETE GRÁTIS ACIMA DE R$ 250 ✦ 6X SEM JUROS ✦ TROCA EM 30 DIAS ✦ COLEÇÃO 01 NO AR',
  secao: 'DESTAQUES',
  secaoTag: 'OS MAIS PEDIDOS',
};

function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const primeiroNome = user?.displayName?.split(' ')[0];
  const [foto, setFoto] = useState(null);

  // pega a foto de um produto em destaque para o banner
  useEffect(() => {
    let ativo = true;
    fetchProducts()
      .then((lista) => {
        const p = lista.find((x) => x.destaque && x.imagem) || lista.find((x) => x.imagem);
        if (ativo && p) setFoto(p.imagem);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  // folga entre a borda da tela e o conteúdo da lista (para o banner ir de ponta a ponta)
  const gap = (width - Math.min(width, layout.maxWidth)) / 2 + 10;

  return (
    <View>
      {/* BANNER AZUL DE PONTA A PONTA */}
      <View
        style={[
          styles.hero,
          { marginHorizontal: -gap, paddingHorizontal: gap + 6 },
          isDesktop && styles.heroDesktop,
        ]}
      >
        <View style={styles.heroText}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {primeiroNome ? `OLÁ, ${primeiroNome.toUpperCase()}` : CONTEUDO.etiqueta}
            </Text>
          </View>

          <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
            {CONTEUDO.titulo}
          </Text>
          <Text style={styles.heroLead}>{CONTEUDO.texto}</Text>

          <View style={styles.ctaRow}>
            <Pressable
              style={({ pressed }) => [styles.cta, styles.ctaCream, pressed && styles.pressed]}
              onPress={() => router.push('/masculino')}
            >
              <Ionicons name="man-outline" size={20} color={brand.ink} />
              <Text style={styles.ctaText}>{CONTEUDO.botaoMasc}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.cta, styles.ctaPink, pressed && styles.pressed]}
              onPress={() => router.push('/feminino')}
            >
              <Ionicons name="woman-outline" size={20} color={brand.ink} />
              <Text style={styles.ctaText}>{CONTEUDO.botaoFem}</Text>
            </Pressable>
          </View>
        </View>

        {isDesktop && foto && (
          <View style={styles.photoWrap} pointerEvents="none">
            <View style={styles.photoFrame}>
              <Image source={{ uri: foto }} style={styles.photo} resizeMode="cover" />
            </View>
            <View style={styles.sticker}>
              <Text style={styles.stickerText}>{CONTEUDO.selo}</Text>
            </View>
          </View>
        )}
      </View>

      {/* FAIXA PRETA DE PONTA A PONTA */}
      <View style={[styles.marquee, { marginHorizontal: -gap }]}>
        <Text style={styles.marqueeText}>{CONTEUDO.faixa}</Text>
      </View>

      {/* TÍTULO DA SEÇÃO */}
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
          {CONTEUDO.secao}
        </Text>
        <View style={styles.sectionTag}>
          <Text style={styles.sectionTagText}>{CONTEUDO.secaoTag}</Text>
        </View>
      </View>
    </View>
  );
}

export default function Home() {
  return <ProductGrid onlyFeatured header={<Header />} />;
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: brand.blue,
    borderBottomWidth: 3,
    borderBottomColor: brand.ink,
    paddingVertical: 34,
  },
  heroDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 440,
    paddingVertical: 44,
  },
  heroText: { flexShrink: 1, maxWidth: 600 },

  tag: {
    alignSelf: 'flex-start',
    backgroundColor: brand.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  tagText: { color: brand.cream, fontWeight: '800', fontSize: 13, letterSpacing: 1.5 },

  heroTitle: {
    fontSize: 48,
    lineHeight: 50,
    fontWeight: '900',
    color: brand.cream,
    textShadowColor: brand.ink,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  heroTitleDesktop: { fontSize: 88, lineHeight: 88 },
  heroLead: {
    marginTop: 16,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '600',
    color: brand.white,
    maxWidth: 460,
  },

  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 26 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderWidth: 3,
    borderColor: brand.ink,
    shadowColor: brand.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  ctaCream: { backgroundColor: brand.cream },
  ctaPink: { backgroundColor: brand.pink },
  ctaText: { color: brand.ink, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  pressed: { transform: [{ translateX: 2 }, { translateY: 2 }], opacity: 0.92 },

  photoWrap: { width: 300, marginRight: 24 },
  photoFrame: {
    width: 300,
    aspectRatio: 4 / 5,
    backgroundColor: brand.white,
    borderWidth: 3,
    borderColor: brand.ink,
    transform: [{ rotate: '3deg' }],
    shadowColor: brand.ink,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  sticker: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: brand.pink,
    borderWidth: 3,
    borderColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '12deg' }],
  },
  stickerText: {
    color: brand.ink,
    fontWeight: '900',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 17,
  },

  marquee: {
    backgroundColor: brand.ink,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  marqueeText: {
    color: brand.cream,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 6,
    marginTop: 30,
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 30, fontWeight: '900', color: brand.ink },
  sectionTitleDesktop: { fontSize: 44 },
  sectionTag: {
    backgroundColor: brand.pink,
    borderWidth: 3,
    borderColor: brand.ink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: brand.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  sectionTagText: { color: brand.ink, fontWeight: '900', fontSize: 12, letterSpacing: 1 },
});