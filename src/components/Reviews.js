import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import StarRating from './StarRating';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';
import { deleteReview, fetchReviews, saveReview, summarize } from '../services/reviewService';
import { brand } from '../theme';

const LARGURA_FOTO = 720;
const LIMITE_FOTO = 700000;

async function prepararFoto(asset) {
  try {
    const acoes = asset.width && asset.width > LARGURA_FOTO ? [{ resize: { width: LARGURA_FOTO } }] : [];
    const out = await ImageManipulator.manipulateAsync(asset.uri, acoes, {
      compress: 0.5,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return `data:image/jpeg;base64,${out.base64}`;
  } catch (e) {
    return asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null;
  }
}

const formatarData = (ms) => (ms ? new Date(ms).toLocaleDateString('pt-BR') : '');

export default function Reviews({ produtoId, onResumo }) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState(false);

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [foto, setFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [ampliada, setAmpliada] = useState(null);

  const minha = user ? lista.find((r) => r.uid === user.uid) : null;

  const carregar = useCallback(async () => {
    try {
      setErroLista(false);
      const dados = await fetchReviews(produtoId);
      setLista(dados);
      onResumo?.(summarize(dados));
    } catch (e) {
      setErroLista(true);
    } finally {
      setCarregando(false);
    }
  }, [produtoId]);

  useEffect(() => {
    setCarregando(true);
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (minha) {
      setNota(minha.nota || 0);
      setComentario(minha.comentario || '');
      setFoto(minha.foto || null);
    } else {
      setNota(0);
      setComentario('');
      setFoto(null);
    }
  }, [minha?.id, user?.uid]);

  const escolher = async (origem) => {
    try {
      let resultado;
      if (origem === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          toast.show('Permita o acesso à câmera nas configurações do celular.', 'error');
          return;
        }
        resultado = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: true,
          aspect: [1, 1],
          base64: true,
        });
      } else {
        resultado = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: true,
          aspect: [1, 1],
          base64: true,
        });
      }
      if (resultado.canceled || !resultado.assets?.length) return;
      const pronta = await prepararFoto(resultado.assets[0]);
      if (!pronta || pronta.length > LIMITE_FOTO) {
        toast.show('Não foi possível usar essa foto. Tente outra.', 'error');
        return;
      }
      setFoto(pronta);
    } catch (e) {
      toast.show('Não foi possível abrir a câmera/galeria.', 'error');
    }
  };

  const enviar = async () => {
    if (!nota) {
      toast.show('Escolha de 1 a 5 estrelas.', 'error');
      return;
    }
    try {
      setEnviando(true);
      await saveReview({ produtoId, user, nota, comentario, foto });
      toast.show(minha ? 'Avaliação atualizada!' : 'Avaliação enviada!');
      await carregar();
    } catch (e) {
      toast.show('Não foi possível enviar. Verifique as regras do Firestore.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const excluir = async () => {
    try {
      setEnviando(true);
      await deleteReview(produtoId, user.uid);
      toast.show('Avaliação removida.');
      await carregar();
    } catch (e) {
      toast.show('Não foi possível remover.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const resumo = summarize(lista);

  return (
    <View style={styles.wrap}>
      <Text style={styles.titulo}>AVALIAÇÕES</Text>

      {carregando ? (
        <ActivityIndicator color={brand.ink} style={{ marginVertical: 16 }} />
      ) : erroLista ? (
        <Text style={styles.vazio}>Não foi possível carregar as avaliações agora.</Text>
      ) : (
        <View style={styles.resumo}>
          <Text style={styles.media}>{resumo.total ? resumo.media.toFixed(1).replace('.', ',') : '–'}</Text>
          <View>
            <StarRating value={resumo.media} size={18} />
            <Text style={styles.total}>
              {resumo.total === 1 ? '1 avaliação' : `${resumo.total} avaliações`}
            </Text>
          </View>
        </View>
      )}

      {user ? (
        <View style={styles.form}>
          <Text style={styles.formTitulo}>{minha ? 'Sua avaliação' : 'Avalie esta peça'}</Text>
          <StarRating value={nota} size={30} onChange={setNota} />
          <TextInput
            style={styles.input}
            placeholder="Conte como ficou, o caimento, o tamanho..."
            placeholderTextColor="#8a8a92"
            multiline
            maxLength={500}
            value={comentario}
            onChangeText={setComentario}
          />

          {foto ? (
            <View style={styles.previaWrap}>
              <Image source={{ uri: foto }} style={styles.previa} />
              <Pressable style={styles.removerFoto} onPress={() => setFoto(null)}>
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.fotoBtns}>
            <Pressable style={styles.fotoBtn} onPress={() => escolher('camera')}>
              <Ionicons name="camera-outline" size={18} color={brand.ink} />
              <Text style={styles.fotoBtnTexto}>Tirar foto</Text>
            </Pressable>
            <Pressable style={styles.fotoBtn} onPress={() => escolher('galeria')}>
              <Ionicons name="images-outline" size={18} color={brand.ink} />
              <Text style={styles.fotoBtnTexto}>Galeria</Text>
            </Pressable>
          </View>

          <Pressable style={[styles.enviar, enviando && { opacity: 0.6 }]} onPress={enviar} disabled={enviando}>
            <Text style={styles.enviarTexto}>
              {enviando ? 'ENVIANDO...' : minha ? 'ATUALIZAR AVALIAÇÃO' : 'ENVIAR AVALIAÇÃO'}
            </Text>
          </Pressable>
          {minha ? (
            <Pressable onPress={excluir} disabled={enviando} style={{ marginTop: 10 }}>
              <Text style={styles.excluir}>Excluir minha avaliação</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Pressable style={styles.entrar} onPress={() => router.push('/login')}>
          <Text style={styles.entrarTexto}>ENTRE PARA AVALIAR</Text>
        </Pressable>
      )}

      {!carregando && !erroLista && lista.length === 0 ? (
        <Text style={styles.vazio}>Ainda não há avaliações. Seja o primeiro!</Text>
      ) : null}

      {lista.map((r) => (
        <View key={r.id} style={styles.item}>
          <View style={styles.itemTopo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{(r.autor || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.autor}>{r.autor}</Text>
              <Text style={styles.data}>{formatarData(r.criadoEm)}</Text>
            </View>
            <StarRating value={r.nota} size={14} />
          </View>
          {r.comentario ? <Text style={styles.comentario}>{r.comentario}</Text> : null}
          {r.foto ? (
            <Pressable onPress={() => setAmpliada(r.foto)}>
              <Image source={{ uri: r.foto }} style={styles.fotoItem} />
            </Pressable>
          ) : null}
        </View>
      ))}

      <Modal visible={!!ampliada} transparent animationType="fade" onRequestClose={() => setAmpliada(null)}>
        <Pressable style={styles.modal} onPress={() => setAmpliada(null)}>
          {ampliada ? <Image source={{ uri: ampliada }} style={styles.fotoGrande} resizeMode="contain" /> : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 36, paddingTop: 24, borderTopWidth: 2, borderTopColor: brand.ink },
  titulo: { color: brand.ink, fontWeight: '900', letterSpacing: 1.5, fontSize: 16 },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  media: { color: brand.ink, fontWeight: '900', fontSize: 36 },
  total: { color: '#555', marginTop: 2, fontSize: 13 },
  form: {
    marginTop: 18,
    padding: 14,
    backgroundColor: brand.white,
    borderWidth: 2,
    borderColor: brand.ink,
    gap: 10,
  },
  formTitulo: { color: brand.ink, fontWeight: '800' },
  input: {
    minHeight: 84,
    borderWidth: 2,
    borderColor: brand.ink,
    padding: 10,
    color: brand.ink,
    textAlignVertical: 'top',
    backgroundColor: brand.white,
  },
  previaWrap: { width: 110, height: 110 },
  previa: { width: 110, height: 110, borderWidth: 2, borderColor: brand.ink },
  removerFoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoBtns: { flexDirection: 'row', gap: 10 },
  fotoBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderWidth: 2,
    borderColor: brand.ink,
    backgroundColor: brand.cream,
  },
  fotoBtnTexto: { color: brand.ink, fontWeight: '800' },
  enviar: {
    backgroundColor: brand.pink,
    borderWidth: 2,
    borderColor: brand.ink,
    paddingVertical: 14,
    alignItems: 'center',
  },
  enviarTexto: { color: brand.white, fontWeight: '900', letterSpacing: 1.2 },
  excluir: { color: '#C0392B', textAlign: 'center', fontWeight: '700' },
  entrar: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: brand.ink,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: brand.white,
  },
  entrarTexto: { color: brand.ink, fontWeight: '900', letterSpacing: 1.2 },
  vazio: { color: '#555', marginTop: 16 },
  item: { marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#d9cfae', gap: 8 },
  itemTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: brand.cream, fontWeight: '800' },
  autor: { color: brand.ink, fontWeight: '800' },
  data: { color: '#777', fontSize: 12 },
  comentario: { color: brand.ink, lineHeight: 20 },
  fotoItem: { width: 120, height: 120, borderWidth: 2, borderColor: brand.ink },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  fotoGrande: { width: '94%', height: '80%' },
});