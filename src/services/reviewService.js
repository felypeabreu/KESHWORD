import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const idDaAvaliacao = (produtoId, uid) => `${produtoId}_${uid}`;

export async function fetchReviews(produtoId) {
  const snap = await getDocs(
    query(collection(db, 'avaliacoes'), where('produtoId', '==', String(produtoId)))
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        criadoEm: data.atualizadoEm?.toMillis?.() ?? data.criadoEm?.toMillis?.() ?? 0,
      };
    })
    .sort((a, b) => b.criadoEm - a.criadoEm);
}

export async function saveReview({ produtoId, user, nota, comentario, foto }) {
  const autor = user.displayName || user.email?.split('@')[0] || 'Cliente Kesh';
  await setDoc(doc(db, 'avaliacoes', idDaAvaliacao(produtoId, user.uid)), {
    produtoId: String(produtoId),
    uid: user.uid,
    autor,
    nota,
    comentario: (comentario || '').trim(),
    foto: foto || null,
    atualizadoEm: serverTimestamp(),
  });
}

export async function deleteReview(produtoId, uid) {
  await deleteDoc(doc(db, 'avaliacoes', idDaAvaliacao(produtoId, uid)));
}

export function summarize(reviews) {
  if (!reviews.length) return { media: 0, total: 0 };
  const soma = reviews.reduce((acc, r) => acc + (Number(r.nota) || 0), 0);
  return { media: soma / reviews.length, total: reviews.length };
}