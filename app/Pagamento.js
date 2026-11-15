import React from 'react';
import { useRouter } from 'expo-router';
import PagamentoScreen from '../src/components/PagamentoScreen';
import { useCart } from '../src/context/CartContext';

const FRETE = 19.9;

// Converte um item do seu carrinho para o formato que a tela de pagamento espera.
// Se os campos do seu CartContext tiverem outros nomes, ajuste só aqui.
const paraItemPagamento = (item, index) => ({
  id: String(item.id ?? index),
  nome: item.nome ?? item.name ?? item.title ?? 'Produto',
  tamanho: item.tamanho ?? item.size,
  cor: item.cor ?? item.color,
  quantidade: item.quantidade ?? item.quantity ?? item.qty ?? 1,
  preco: Number(item.preco ?? item.price ?? 0),
});

export default function Pagamento() {
  const router = useRouter();

  // Ajuste os nomes abaixo conforme o que o seu CartContext expõe.
  const carrinho = useCart();
  const lista = carrinho.items ?? carrinho.cart ?? carrinho.cartItems ?? [];
  const limparCarrinho = carrinho.clearCart ?? carrinho.limparCarrinho;

  const handleConcluir = (pedido) => {
    // TODO: salvar o pedido (ex.: um orderService.js no mesmo estilo do cartService.js)
    router.replace('/(tabs)');
    limparCarrinho?.();
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