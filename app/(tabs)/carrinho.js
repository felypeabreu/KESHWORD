import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Loading from '../../src/components/Loading';
import { useToast } from '../../src/components/Toast';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { createOrder } from '../../src/services/cartService';
import { formatPrice } from '../../src/utils/validation';
import { colors, radius } from '../../src/theme';

export default function Carrinho() {
  const router = useRouter();
  const toast = useToast();
  const { user, initializing, logout } = useAuth();
  const { items, total, keyOf, increment, decrement, removeItem, clear } = useCart();
  const [finishing, setFinishing] = useState(false);

  if (initializing) return <Loading />;

  // Login só é exigido para usar o carrinho
  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={56} color={colors.muted} />
        <Text style={styles.title}>Entre para ver seu carrinho</Text>
        <Text style={styles.sub}>Faça login ou crie uma conta para comprar na Kesh.</Text>
        <Button title="Entrar" onPress={() => router.push('/login')} style={{ width: '100%', marginTop: 20 }} />
        <Button title="Criar conta" variant="outline" onPress={() => router.push('/cadastro')} style={{ width: '100%', marginTop: 10 }} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="bag-outline" size={56} color={colors.muted} />
        <Text style={styles.title}>Seu carrinho está vazio</Text>
        <Text style={styles.sub}>Adicione peças dos catálogos masculino e feminino.</Text>
        <Button title="Ver produtos" onPress={() => router.push('/')} style={{ width: '100%', marginTop: 20 }} />
        <Pressable onPress={logout} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Sair da conta</Text>
        </Pressable>
      </View>
    );
  }

  const finalizar = async () => {
    try {
      setFinishing(true);
      await createOrder(user.uid, items, total);
      clear();
      toast.show('Compra finalizada com sucesso!');
    } catch (e) {
      toast.show('Não foi possível finalizar a compra.', 'error');
    } finally {
      setFinishing(false);
    }
  };

  const confirmRemove = (item) =>
    Alert.alert('Remover item', `Remover ${item.nome} do carrinho?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeItem(keyOf(item)) },
    ]);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => keyOf(item)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.imagem }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName} numberOfLines={2}>{item.nome}</Text>
              <Text style={styles.itemMeta}>Tamanho {item.tamanho}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.preco * item.qtd)}</Text>

              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyBtn} onPress={() => decrement(keyOf(item))}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={styles.qty}>{item.qtd}</Text>
                <Pressable style={styles.qtyBtn} onPress={() => increment(keyOf(item))}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>
            <Pressable onPress={() => confirmRemove(item)} hitSlop={10}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <Button title="Finalizar compra" onPress={finalizar} loading={finishing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', marginTop: 6 },
  link: { color: colors.muted, textDecorationLine: 'underline' },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 10,
  },
  thumb: { width: 72, height: 90, borderRadius: radius.sm, backgroundColor: colors.border },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '700', marginTop: 4, color: colors.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontSize: 15, fontWeight: '600' },
  footer: { padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, color: colors.muted },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.text },
});
