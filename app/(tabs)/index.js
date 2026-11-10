import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../../src/components/ProductGrid';
import { useAuth } from '../../src/context/AuthContext';
import { colors, radius } from '../../src/theme';

function Header() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Nova coleção</Text>
        <Text style={styles.bannerSub}>
          {user ? `Olá, ${user.displayName ?? 'cliente'}!` : 'Estilo que fala por você.'}
        </Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.category} onPress={() => router.push('/masculino')}>
          <Ionicons name="man-outline" size={22} color="#fff" />
          <Text style={styles.categoryText}>Masculino</Text>
        </Pressable>
        <Pressable style={styles.category} onPress={() => router.push('/feminino')}>
          <Ionicons name="woman-outline" size={22} color="#fff" />
          <Text style={styles.categoryText}>Feminino</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Destaques</Text>
    </View>
  );
}

export default function Home() {
  return <ProductGrid onlyFeatured header={<Header />} />;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 6, paddingBottom: 4 },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 24,
    marginBottom: 12,
  },
  bannerTitle: { color: colors.accent, fontSize: 26, fontWeight: '800' },
  bannerSub: { color: '#fff', marginTop: 6, fontSize: 15 },
  row: { flexDirection: 'row', gap: 10 },
  category: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 18, marginBottom: 4 },
});
