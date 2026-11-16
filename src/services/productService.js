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

function montar(id, dados = {}) {
  const bruto = PRODUCTS.find((p) => String(p.id) === String(id));
  if (!bruto && Object.keys(dados).length === 0) return null;

  const local = localProducts.find((p) => p.id === String(id));
  const p = { ...bruto, ...dados };

  return {
    ...p,
    id: String(id),
    name: p.name ?? p.nome,
    price: p.price ?? p.preco,
    sizes: p.sizes ?? p.tamanhos,
    nome: p.nome ?? p.name,
    preco: p.preco ?? p.price,
    tamanhos: p.tamanhos ?? p.sizes,
    categoria: p.categoria ?? p.gender ?? 'masculino',
    destaque: p.destaque ?? Boolean(p.badge),
    imagem: local?.imagem,
  };
}

const todosLocais = () => PRODUCTS.map((p) => montar(p.id));

export async function fetchProducts(categoria) {
  try {
    const ref = collection(db, COLECAO);
    const q = categoria ? query(ref, where('categoria', '==', categoria)) : ref;
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => montar(d.id, d.data()));
    }
  } catch (e) {
    console.warn('Firestore indisponível, usando dados locais:', e.message);
  }
  const lista = todosLocais();
  return categoria ? lista.filter((p) => p.categoria === categoria) : lista;
}

export async function fetchProductById(id) {
  try {
    const snap = await getDoc(doc(db, COLECAO, String(id)));
    if (snap.exists()) {
      return montar(snap.id, snap.data());
    }
  } catch (e) {
    console.warn('Firestore indisponível, usando dado local:', e.message);
  }
  return montar(id);
}

export async function seedProducts() {
  const batch = writeBatch(db);

  PRODUCTS.forEach((p) => {
    const { id, image, ...dados } = p;
    const limpo = Object.fromEntries(
      Object.entries(dados).filter(([, v]) => v !== undefined)
    );

    batch.set(doc(db, COLECAO, String(id)), {
      ...limpo,
      categoria: p.gender || 'masculino',
      destaque: Boolean(p.badge),
    });
  });

  await batch.commit();
  return PRODUCTS.length;
}