import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PRODUCTS, products as localProducts } from '../data/products';

const COLECAO = 'produtos';

// Junta os dados que vieram do Firestore com a imagem local (pelo id).
// O Firestore guarda só texto/números; a foto continua vindo do arquivo local.
function comImagemLocal(id, dados) {
  const local = localProducts.find((p) => p.id === String(id));
  return { ...local, ...dados, id: String(id) };
}

// Lê os produtos da coleção "produtos".
// Se a coleção estiver vazia (ou houver erro), usa os produtos locais.
export async function fetchProducts(categoria) {
  try {
    const ref = collection(db, COLECAO);
    const q = categoria ? query(ref, where('categoria', '==', categoria)) : ref;
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => comImagemLocal(d.id, d.data()));
    }
  } catch (e) {
    console.warn('Firestore indisponível, usando dados locais:', e.message);
  }
  return categoria
    ? localProducts.filter((p) => p.categoria === categoria)
    : localProducts;
}

// Busca UM produto pelo id (usado na página de detalhe).
export async function fetchProductById(id) {
  try {
    const snap = await getDoc(doc(db, COLECAO, String(id)));
    if (snap.exists()) {
      return comImagemLocal(snap.id, snap.data());
    }
  } catch (e) {
    console.warn('Firestore indisponível, usando dado local:', e.message);
  }
  return localProducts.find((p) => p.id === String(id)) ?? null;
}

// Grava os produtos locais no Firestore (rodar UMA vez, para popular o banco).
// Não grava a imagem: ela é um endereço local do servidor de desenvolvimento.
export async function seedProducts() {
  const batch = writeBatch(db);

  localProducts.forEach((item) => {
    const { id, imagem, ...dados } = item;
    const bruto = PRODUCTS.find((p) => String(p.id) === id);

    batch.set(
      doc(db, COLECAO, id),
      { ...dados, tamanhos: bruto?.sizes ?? [] },
      { merge: true }
    );
  });

  await batch.commit();
  return localProducts.length;
}