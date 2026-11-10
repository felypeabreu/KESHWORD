import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Carrinho salvo em: carrinhos/{uid}  -> { itens: [...] }
export async function loadCart(uid) {
  const snap = await getDoc(doc(db, 'carrinhos', uid));
  return snap.exists() ? snap.data().itens ?? [] : [];
}

export async function saveCart(uid, itens) {
  await setDoc(doc(db, 'carrinhos', uid), { itens, atualizadoEm: serverTimestamp() });
}

// Pedido finalizado salvo em: pedidos/{id}
export async function createOrder(uid, itens, total) {
  return addDoc(collection(db, 'pedidos'), {
    uid,
    itens,
    total,
    status: 'recebido',
    criadoEm: serverTimestamp(),
  });
}
