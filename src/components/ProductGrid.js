import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import ProductCard from './ProductCard';
import Loading from './Loading';
import { colors } from '../theme';
import { fetchProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

// Lista de produtos reutilizada na Home e nos catálogos masculino/feminino.
// Adicionar ao carrinho exige login: se não estiver logado, vai para a tela de login.
export default function ProductGrid({ categoria, onlyFeatured = false, header }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const toast = useToast();

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

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.list}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => <ProductCard product={item} onAdd={handleAdd} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 10, backgroundColor: colors.background },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
