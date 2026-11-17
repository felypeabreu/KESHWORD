import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export async function loadCart(uid) {
  const snap = await getDoc(doc(db, 'carrinhos', uid));
  return snap.exists() ? snap.data().itens ?? [] : [];
}

export async function saveCart(uid, itens) {
  await setDoc(doc(db, 'carrinhos', uid), { itens, atualizadoEm: serverTimestamp() });
}

export class EstoqueError extends Error {
  constructor(message) {
    super(message);
    this.code = 'estoque-insuficiente';
  }
}

async function baixarEstoque(itens) {
  const porProduto = {};
  itens.forEach((i) => {
    porProduto[i.id] = porProduto[i.id] || {};
    porProduto[i.id][i.tamanho] = (porProduto[i.id][i.tamanho] || 0) + i.qtd;
  });

  await runTransaction(db, async (tx) => {
    const leituras = await Promise.all(
      Object.keys(porProduto).map(async (id) => {
        const ref = doc(db, 'produtos', String(id));
        return { id, ref, snap: await tx.get(ref) };
      })
    );

    const escritas = [];
    leituras.forEach(({ id, ref, snap }) => {
      const estoque = snap.exists() ? snap.data().stock : null;
      if (!estoque) return;
      const novo = { ...estoque };
      Object.entries(porProduto[id]).forEach(([tamanho, qtd]) => {
        const disponivel = Number(novo[tamanho]);
        if (Number.isNaN(disponivel)) return;
        if (disponivel < qtd) {
          const nome = itens.find((i) => String(i.id) === String(id))?.nome || 'Produto';
          throw new EstoqueError(
            disponivel <= 0
              ? `${nome} (${tamanho}) esgotou.`
              : `${nome} (${tamanho}): só restam ${disponivel} unidade(s).`
          );
        }
        novo[tamanho] = disponivel - qtd;
      });
      escritas.push({ ref, novo });
    });

    escritas.forEach(({ ref, novo }) => tx.update(ref, { stock: novo }));
  });
}

export async function createOrder(uid, itens, total, extras = {}) {
  try {
    await baixarEstoque(itens);
  } catch (e) {
    if (e instanceof EstoqueError) throw e;
    console.warn('Não foi possível atualizar o estoque:', e.message);
  }

  return addDoc(collection(db, 'pedidos'), {
    uid,
    itens,
    total,
    ...extras,
    status: 'recebido',
    criadoEm: serverTimestamp(),
  });
}
