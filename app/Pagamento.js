import React, { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import PagamentoScreen from '../src/components/PagamentoScreen';
import Loading from '../src/components/Loading';
import { useToast } from '../src/components/Toast';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { createOrder } from '../src/services/cartService';

const FRETE = 19.9;

const paraItemPagamento = (item, index) => ({
  id: String(item.id ?? index),
  nome: item.nome ?? item.name ?? item.title ?? 'Produto',
  tamanho: item.tamanho ?? item.size,
  cor: item.cor ?? item.color,
  quantidade: item.qtd ?? item.quantidade ?? item.quantity ?? item.qty ?? 1,
  preco: Number(item.preco ?? item.price ?? 0),
});

export default function Pagamento() {
  const router = useRouter();

  const toast = useToast();
  const { user, initializing } = useAuth();
  const carrinho = useCart();
  const lista = carrinho.items ?? [];
  const concluido = useRef(false);

  useEffect(() => {
    if (initializing || concluido.current) return;
    if (!user || lista.length === 0) router.replace('/carrinho');
  }, [initializing, user, lista.length]);

  if (initializing || !user || lista.length === 0) return <Loading />;

  const handleConcluir = async (pedido) => {
    try {
      await createOrder(user.uid, lista, pedido.total, {
        metodo: pedido.metodo,
        parcelas: pedido.parcelas,
        subtotal: pedido.subtotal,
        frete: pedido.frete,
        desconto: pedido.desconto,
      });
      concluido.current = true;
      carrinho.clear();
      toast.show('Compra finalizada com sucesso!');
      router.replace('/(tabs)');
    } catch (e) {
      toast.show(
        e.code === 'estoque-insuficiente'
          ? e.message
          : 'Não foi possível registrar o pedido. Seu carrinho foi mantido.',
        'error'
      );
    }
  };

  return (
    <PagamentoScreen
      itens={lista.map(paraItemPagamento)}
      frete={FRETE}
      onVoltar={() => router.back()}
      onConcluir={handleConcluir}
    />
  );
}