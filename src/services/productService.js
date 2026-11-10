import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { products as localProducts } from '../data/products';

// Lê os produtos da coleção "produtos" do Firestore.
// Se a coleção estiver vazia (ou houver erro), usa os produtos locais.
export async function fetchProducts(categoria) {
  try {
    const ref = collection(db, 'produtos');
    const q = categoria ? query(ref, where('categoria', '==', categoria)) : ref;
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (e) {
    console.warn('Firestore indisponível, usando dados locais:', e.message);
  }
  return categoria ? localProducts.filter((p) => p.categoria === categoria) : localProducts;
}
