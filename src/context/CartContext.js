import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useAuth } from './AuthContext';
import { loadCart, saveCart } from '../services/cartService';

const CartContext = createContext(null);

const keyOf = (item) => `${item.id}-${item.tamanho}`;

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return action.itens;
    case 'ADD': {
      const exists = state.find((i) => keyOf(i) === keyOf(action.item));
      if (exists) {
        return state.map((i) =>
          keyOf(i) === keyOf(action.item) ? { ...i, qtd: i.qtd + 1 } : i
        );
      }
      return [...state, { ...action.item, qtd: 1 }];
    }
    case 'INC':
      return state.map((i) => (keyOf(i) === action.key ? { ...i, qtd: i.qtd + 1 } : i));
    case 'DEC':
      return state
        .map((i) => (keyOf(i) === action.key ? { ...i, qtd: i.qtd - 1 } : i))
        .filter((i) => i.qtd > 0);
    case 'REMOVE':
      return state.filter((i) => keyOf(i) !== action.key);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, dispatch] = useReducer(reducer, []);
  const loaded = useRef(false);

  // Ao logar: carrega o carrinho salvo no Firestore. Ao sair: limpa.
  useEffect(() => {
    loaded.current = false;
    if (!user) {
      dispatch({ type: 'CLEAR' });
      return;
    }
    loadCart(user.uid)
      .then((saved) => dispatch({ type: 'SET', itens: saved }))
      .catch((e) => console.warn('Erro ao carregar carrinho:', e.message))
      .finally(() => {
        loaded.current = true;
      });
  }, [user?.uid]);

  // Sempre que o carrinho muda (e já foi carregado), salva no Firestore.
  useEffect(() => {
    if (user && loaded.current) {
      saveCart(user.uid, items).catch((e) => console.warn('Erro ao salvar carrinho:', e.message));
    }
  }, [items]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.preco * i.qtd, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qtd, 0), [items]);

  const value = {
    items,
    total,
    count,
    keyOf,
    addItem: (item) => dispatch({ type: 'ADD', item }),
    increment: (key) => dispatch({ type: 'INC', key }),
    decrement: (key) => dispatch({ type: 'DEC', key }),
    removeItem: (key) => dispatch({ type: 'REMOVE', key }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
};
