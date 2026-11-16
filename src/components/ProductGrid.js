import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import ProductCard from './ProductCard';
import Loading from './Loading';
import { colors } from '../theme';
import { fetchProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

function colunasPorLargura(largura) {
  if (largura >= 900) return 4;
  if (largura >= 600) return 3;
  return 2;
}

export default function ProductGrid({ categoria, onlyFeatured = false, header }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const colunas = colunasPorLargura(width);

  const load = useCallback(async () => {
    const list = await fetchProducts(categoria);
    setData(onlyFeatured ? list.filter((p) => p.destaque) : list);
  }, [categoria, onlyFeatured]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAdd = (item) => {
    if (!user) {
      router.push('/login');
      return;
    }
    addItem(item);
    toast.show(`${item.nome} (${item.tamanho}) adicionado ao carrinho`);
  };

  if (loading) return <Loading />;

  const resto = data.length % colunas;
  const lista =
    resto === 0
      ? data
      : [
          ...data,
          ...Array.from({ length: colunas - resto }, (_, i) => ({
            id: `vazio-${i}`,
            vazio: true,
          })),
        ];

  return (
    <FlatList
      key={colunas}
      data={lista}
      keyExtractor={(item) => item.id}
      numColumns={colunas}
      style={styles.fundo}
      contentContainerStyle={styles.list}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) =>
        item.vazio ? <View style={styles.vazio} /> : <ProductCard product={item} onAdd={handleAdd} />
      }
    />
  );
}

const styles = StyleSheet.create({
  fundo: { backgroundColor: colors.background },
  list: {
    padding: 10,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  vazio: { flex: 1, margin: 6 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});