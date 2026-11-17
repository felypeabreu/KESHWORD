import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';

/**
 * Tela do Pix de DEMONSTRAÇÃO.
 * O QR Code leva um texto de teste (não é um código Pix válido), então
 * nenhum banco consegue cobrar nada: é só para mostrar a integração
 * com recursos do celular.
 *
 * Recursos do aparelho usados:
 *  - Área de transferência (expo-clipboard)  -> "Copiar código"
 *  - Compartilhar do sistema (Share)         -> "Compartilhar"
 *  - Vibração / feedback tátil (expo-haptics)-> ao copiar e ao aprovar
 *  - Brilho da tela (expo-brightness)        -> sobe ao máximo para facilitar a leitura do QR
 *
 * Props:
 *  - visible: boolean
 *  - valor: número (R$)
 *  - onFechar: () => void
 *  - onPago: () => void   (chamado em "Simular pagamento aprovado")
 */

const DURACAO_SEGUNDOS = 10 * 60;

const moeda = (v) => {
  const [inteiro, centavos] = v.toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
};

const gerarPedido = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const tempo = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Em alguns ambientes (ex.: navegador) o recurso não existe; nunca deixa o app quebrar.
const seguro = (fn) => {
  try {
    const r = fn();
    if (r && typeof r.catch === 'function') r.catch(() => {});
  } catch (e) {
    // sem suporte: ignora
  }
};

export default function PixPagamento({ visible, valor, onFechar, onPago }) {
  const [pedido, setPedido] = useState(gerarPedido);
  const [restante, setRestante] = useState(DURACAO_SEGUNDOS);
  const [copiado, setCopiado] = useState(false);

  const expirado = restante <= 0;
  const payload = `KESHWORD-DEMO|PIX|PEDIDO:${pedido}|VALOR:${valor.toFixed(2)}`;

  // Ao abrir: novo código e a contagem recomeça
  useEffect(() => {
    if (!visible) return;
    setPedido(gerarPedido());
    setRestante(DURACAO_SEGUNDOS);
    setCopiado(false);
  }, [visible]);

  // Contagem regressiva
  useEffect(() => {
    if (!visible || restante <= 0) return;
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, restante]);

  // Brilho no máximo enquanto o QR está na tela; volta ao normal ao fechar
  useEffect(() => {
    if (!visible) return;
    let cancelado = false;
    let anterior = null;
    (async () => {
      try {
        anterior = await Brightness.getBrightnessAsync();
        if (cancelado) return;
        await Brightness.setBrightnessAsync(1);
      } catch (e) {
        // sem suporte: ignora
      }
    })();
    return () => {
      cancelado = true;
      if (anterior !== null) seguro(() => Brightness.setBrightnessAsync(anterior));
    };
  }, [visible]);

  const copiar = async () => {
    try {
      await Clipboard.setStringAsync(payload);
      seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {
      // sem suporte: ignora
    }
  };

  const compartilhar = async () => {
    try {
      await Share.share({
        message: `Pagamento Pix (demonstração) - ${moeda(valor)}\n${payload}`,
      });
    } catch (e) {
      // usuário cancelou ou sem suporte
    }
  };

  const simularPagamento = () => {
    seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    onPago?.();
  };

  const gerarNovo = () => {
    setPedido(gerarPedido());
    setRestante(DURACAO_SEGUNDOS);
    setCopiado(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onFechar}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.lado} />
          <Text style={styles.headerTitulo}>Pagar com Pix</Text>
          <Pressable onPress={onFechar} hitSlop={12} style={[styles.lado, styles.ladoDireito]}>
            <Ionicons name="close" size={24} color="#111827" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          <View style={styles.aviso}>
            <Ionicons name="information-circle-outline" size={18} color="#92400E" />
            <Text style={styles.avisoTexto}>
              Modo demonstração: nenhum pagamento real é feito.
            </Text>
          </View>

          <Text style={styles.valorRotulo}>Valor a pagar</Text>
          <Text style={styles.valor}>{moeda(valor)}</Text>

          <View style={styles.qrCaixa}>
            <View style={expirado ? styles.qrExpirado : null}>
              <QRCode value={payload} size={210} backgroundColor="#FFFFFF" color="#111827" />
            </View>
            {expirado && (
              <View style={styles.qrCobertura}>
                <Text style={styles.qrCoberturaTexto}>QR Code expirado</Text>
              </View>
            )}
          </View>

          {expirado ? (
            <Pressable onPress={gerarNovo} style={styles.botaoSecundario}>
              <Ionicons name="refresh" size={18} color="#111827" />
              <Text style={styles.botaoSecundarioTexto}>Gerar novo código</Text>
            </Pressable>
          ) : (
            <Text style={styles.tempo}>Expira em {tempo(restante)}</Text>
          )}

          <Text style={styles.codigoRotulo}>Código de demonstração</Text>
          <View style={styles.codigoCaixa}>
            <Text style={styles.codigoTexto} numberOfLines={2}>
              {payload}
            </Text>
          </View>

          <View style={styles.acoes}>
            <Pressable onPress={copiar} style={[styles.botaoSecundario, styles.flex]}>
              <Ionicons
                name={copiado ? 'checkmark' : 'copy-outline'}
                size={18}
                color={copiado ? '#16A34A' : '#111827'}
              />
              <Text style={[styles.botaoSecundarioTexto, copiado && styles.textoCopiado]}>
                {copiado ? 'Copiado!' : 'Copiar código'}
              </Text>
            </Pressable>
            <Pressable onPress={compartilhar} style={[styles.botaoSecundario, styles.flex]}>
              <Ionicons name="share-social-outline" size={18} color="#111827" />
              <Text style={styles.botaoSecundarioTexto}>Compartilhar</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.rodape}>
          <Pressable
            onPress={simularPagamento}
            disabled={expirado}
            style={({ pressed }) => [
              styles.botaoPrimario,
              (pressed || expirado) && styles.botaoPrimarioDesativado,
            ]}
          >
            <Text style={styles.botaoPrimarioTexto}>Simular pagamento aprovado</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#F7F7F8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  lado: { width: 32, height: 32, justifyContent: 'center' },
  ladoDireito: { alignItems: 'flex-end' },
  headerTitulo: { fontSize: 18, fontWeight: '700', color: '#111827' },

  conteudo: { padding: 16, paddingBottom: 24, alignItems: 'center' },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: '#92400E' },

  valorRotulo: { fontSize: 13, color: '#6B7280' },
  valor: { fontSize: 32, fontWeight: '800', color: '#111827', marginTop: 2, marginBottom: 16 },

  qrCaixa: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrExpirado: { opacity: 0.15 },
  qrCobertura: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCoberturaTexto: { fontSize: 16, fontWeight: '700', color: '#DC2626' },

  tempo: { fontSize: 14, color: '#4B5563', marginTop: 12, marginBottom: 4 },

  codigoRotulo: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 18,
    marginBottom: 6,
  },
  codigoCaixa: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
  },
  codigoTexto: { fontSize: 12, color: '#374151' },

  acoes: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 12 },
  botaoSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 8,
  },
  botaoSecundarioTexto: { fontSize: 14, fontWeight: '600', color: '#111827' },
  textoCopiado: { color: '#16A34A' },

  rodape: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  botaoPrimario: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrimarioDesativado: { opacity: 0.5 },
  botaoPrimarioTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});