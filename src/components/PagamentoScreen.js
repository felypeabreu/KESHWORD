import React, { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
/* -------------------------------------------------------------------------- */
/* Constantes                                                                 */
/* -------------------------------------------------------------------------- */
const DESCONTO_PIX = 0.05; // 5%
const MAX_PARCELAS = 6;
/* -------------------------------------------------------------------------- */
/* Funções auxiliares                                                         */
/* -------------------------------------------------------------------------- */
const arredondar = (v) => Math.round(v * 100) / 100;
const formatarMoeda = (valor) => {
    const [inteiro, centavos] = valor.toFixed(2).split('.');
    return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`;
};
const somenteNumeros = (t) => t.replace(/\D/g, '');
const mascaraCartao = (t) => somenteNumeros(t)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
const mascaraValidade = (t) => {
    const n = somenteNumeros(t).slice(0, 4);
    return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n;
};
// Algoritmo de Luhn: detecta número de cartão digitado errado
const cartaoValido = (numero) => {
    const digitos = somenteNumeros(numero);
    if (digitos.length < 13)
        return false;
    let soma = 0;
    let dobrar = false;
    for (let i = digitos.length - 1; i >= 0; i--) {
        let d = Number(digitos[i]);
        if (dobrar) {
            d *= 2;
            if (d > 9)
                d -= 9;
        }
        soma += d;
        dobrar = !dobrar;
    }
    return soma % 10 === 0;
};
const validadeValida = (v) => {
    const [mm, aa] = v.split('/');
    if (!mm || !aa || aa.length !== 2)
        return false;
    const mes = Number(mm);
    const ano = 2000 + Number(aa);
    if (mes < 1 || mes > 12)
        return false;
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    return ano > anoAtual || (ano === anoAtual && mes >= mesAtual);
};
function Campo({ rotulo, erro, inputRef, style, ...rest }) {
    return (<View style={styles.campoWrapper}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput ref={inputRef} placeholderTextColor="#9CA3AF" style={[styles.input, erro ? styles.inputErro : null, style]} {...rest}/>
      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
    </View>);
}
/* -------------------------------------------------------------------------- */
/* Tela                                                                       */
/* -------------------------------------------------------------------------- */
/**
 * Props:
 *  - itens: [{ id, nome, tamanho?, cor?, quantidade, preco }]
 *  - frete: número (R$)
 *  - onVoltar: () => void
 *  - onConcluir: ({ metodo, parcelas, subtotal, frete, desconto, total }) => void
 */
export default function PagamentoScreen({ itens = [], frete = 19.9, onVoltar, onConcluir, }) {
    const [metodo, setMetodo] = useState('cartao');
    const [parcelas, setParcelas] = useState(1);
    const [numero, setNumero] = useState('');
    const [nome, setNome] = useState('');
    const [validade, setValidade] = useState('');
    const [cvv, setCvv] = useState('');
    const [erros, setErros] = useState({});
    const [carregando, setCarregando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const nomeRef = useRef(null);
    const validadeRef = useRef(null);
    const cvvRef = useRef(null);
    // Totais
    const subtotal = arredondar(itens.reduce((s, i) => s + i.preco * i.quantidade, 0));
    const desconto = metodo === 'pix' ? arredondar(subtotal * DESCONTO_PIX) : 0;
    const total = arredondar(subtotal - desconto + frete);
    const limparErro = (campo) => {
        if (erros[campo])
            setErros((e) => ({ ...e, [campo]: undefined }));
    };
    const validarCartao = () => {
        const e = {};
        if (!cartaoValido(numero))
            e.numero = 'Número de cartão inválido';
        if (nome.trim().split(/\s+/).length < 2)
            e.nome = 'Digite o nome como está no cartão';
        if (!validadeValida(validade))
            e.validade = 'Validade inválida';
        if (cvv.length < 3)
            e.cvv = 'CVV inválido';
        return e;
    };
    const finalizar = () => {
        if (carregando)
            return;
        if (metodo === 'cartao') {
            const novosErros = validarCartao();
            setErros(novosErros);
            if (Object.keys(novosErros).length > 0)
                return;
        }
        setCarregando(true);
        // TODO: aqui entra a chamada ao seu backend / gateway de pagamento
        // (Mercado Pago, Stripe, Pagar.me...). Nunca envie dados do cartão
        // para um servidor seu sem usar o SDK/tokenização do gateway.
        setTimeout(() => {
            setCarregando(false);
            setSucesso(true);
        }, 1500);
    };
    const concluir = () => {
        setSucesso(false);
        onConcluir?.({
            metodo,
            parcelas: metodo === 'cartao' ? parcelas : 1,
            subtotal,
            frete,
            desconto,
            total,
        });
    };
    const metodos = [
        { id: 'cartao', titulo: 'Cartão', icone: 'card-outline' },
        { id: 'pix', titulo: 'Pix', icone: 'qr-code-outline' },
        { id: 'boleto', titulo: 'Boleto', icone: 'barcode-outline' },
    ];
    return (<SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable onPress={onVoltar} hitSlop={12} style={styles.botaoVoltar}>
          <Ionicons name="chevron-back" size={24} color="#111827"/>
        </Pressable>
        <Text style={styles.headerTitulo}>Pagamento</Text>
        <View style={styles.botaoVoltar}/>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Resumo do pedido */}
          <Text style={styles.secaoTitulo}>Resumo do pedido</Text>
          <View style={styles.card}>
            {itens.map((item, index) => (<View key={item.id} style={[styles.itemLinha, index > 0 && styles.itemLinhaBorda]}>
                <View style={styles.itemImagem}>
                  <Ionicons name="shirt-outline" size={26} color="#6B7280"/>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemNome} numberOfLines={2}>
                    {item.nome}
                  </Text>
                  <Text style={styles.itemDetalhe}>
                    {[item.tamanho && `Tam. ${item.tamanho}`, item.cor, `Qtd. ${item.quantidade}`]
                .filter(Boolean)
                .join(' · ')}
                  </Text>
                </View>
                <Text style={styles.itemPreco}>
                  {formatarMoeda(item.preco * item.quantidade)}
                </Text>
              </View>))}
          </View>

          {/* Forma de pagamento */}
          <Text style={styles.secaoTitulo}>Forma de pagamento</Text>
          <View style={styles.metodosLinha}>
            {metodos.map((m) => {
            const ativo = metodo === m.id;
            return (<Pressable key={m.id} onPress={() => setMetodo(m.id)} style={[styles.metodo, ativo && styles.metodoAtivo]}>
                  <Ionicons name={m.icone} size={24} color={ativo ? '#FFFFFF' : '#374151'}/>
                  <Text style={[styles.metodoTexto, ativo && styles.metodoTextoAtivo]}>
                    {m.titulo}
                  </Text>
                </Pressable>);
        })}
          </View>

          {/* Cartão */}
          {metodo === 'cartao' && (<View style={styles.card}>
              <Campo rotulo="Número do cartão" placeholder="0000 0000 0000 0000" keyboardType="number-pad" value={numero} onChangeText={(t) => {
                setNumero(mascaraCartao(t));
                limparErro('numero');
            }} erro={erros.numero} returnKeyType="next" onSubmitEditing={() => nomeRef.current?.focus()} autoComplete="cc-number" maxLength={19}/>
              <Campo rotulo="Nome no cartão" placeholder="Como está impresso no cartão" autoCapitalize="characters" value={nome} onChangeText={(t) => {
                setNome(t);
                limparErro('nome');
            }} erro={erros.nome} inputRef={nomeRef} returnKeyType="next" onSubmitEditing={() => validadeRef.current?.focus()} autoComplete="cc-name"/>
              <View style={styles.linhaDupla}>
                <View style={styles.flex}>
                  <Campo rotulo="Validade" placeholder="MM/AA" keyboardType="number-pad" value={validade} onChangeText={(t) => {
                setValidade(mascaraValidade(t));
                limparErro('validade');
            }} erro={erros.validade} inputRef={validadeRef} returnKeyType="next" onSubmitEditing={() => cvvRef.current?.focus()} maxLength={5}/>
                </View>
                <View style={styles.espacoColunas}/>
                <View style={styles.flex}>
                  <Campo rotulo="CVV" placeholder="123" keyboardType="number-pad" secureTextEntry value={cvv} onChangeText={(t) => {
                setCvv(somenteNumeros(t).slice(0, 4));
                limparErro('cvv');
            }} erro={erros.cvv} inputRef={cvvRef} returnKeyType="done" maxLength={4}/>
                </View>
              </View>

              <Text style={styles.rotulo}>Parcelamento</Text>
              <View style={styles.parcelasLinha}>
                {Array.from({ length: MAX_PARCELAS }, (_, i) => i + 1).map((n) => {
                const ativo = parcelas === n;
                return (<Pressable key={n} onPress={() => setParcelas(n)} style={[styles.parcela, ativo && styles.parcelaAtiva]}>
                      <Text style={[styles.parcelaTexto, ativo && styles.parcelaTextoAtivo]}>
                        {n}x de {formatarMoeda(total / n)}
                      </Text>
                      <Text style={[styles.parcelaSub, ativo && styles.parcelaTextoAtivo]}>
                        sem juros
                      </Text>
                    </Pressable>);
            })}
              </View>
            </View>)}

          {/* Pix */}
          {metodo === 'pix' && (<View style={styles.infoBox}>
              <Ionicons name="flash-outline" size={22} color="#15803D"/>
              <Text style={styles.infoTexto}>
                Pague via Pix e ganhe {Math.round(DESCONTO_PIX * 100)}% de desconto. Ao
                finalizar, mostramos o QR Code e o código copia e cola. A aprovação é
                imediata.
              </Text>
            </View>)}

          {/* Boleto */}
          {metodo === 'boleto' && (<View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={22} color="#374151"/>
              <Text style={styles.infoTexto}>
                O boleto vence em 3 dias úteis. Seu pedido é liberado após a compensação
                do pagamento, que pode levar até 2 dias úteis.
              </Text>
            </View>)}

          {/* Totais */}
          <Text style={styles.secaoTitulo}>Valores</Text>
          <View style={styles.card}>
            <View style={styles.totalLinha}>
              <Text style={styles.totalRotulo}>Subtotal</Text>
              <Text style={styles.totalValor}>{formatarMoeda(subtotal)}</Text>
            </View>
            <View style={styles.totalLinha}>
              <Text style={styles.totalRotulo}>Frete</Text>
              <Text style={styles.totalValor}>
                {frete === 0 ? 'Grátis' : formatarMoeda(frete)}
              </Text>
            </View>
            {desconto > 0 && (<View style={styles.totalLinha}>
                <Text style={styles.totalRotulo}>Desconto Pix</Text>
                <Text style={[styles.totalValor, styles.descontoValor]}>
                  - {formatarMoeda(desconto)}
                </Text>
              </View>)}
            <View style={styles.divisor}/>
            <View style={styles.totalLinha}>
              <Text style={styles.totalFinalRotulo}>Total</Text>
              <Text style={styles.totalFinalValor}>{formatarMoeda(total)}</Text>
            </View>
          </View>

          <View style={styles.seguro}>
            <Ionicons name="lock-closed-outline" size={14} color="#6B7280"/>
            <Text style={styles.seguroTexto}>Pagamento seguro</Text>
          </View>
        </ScrollView>

        {/* Rodapé fixo */}
        <View style={styles.rodape}>
          <Pressable onPress={finalizar} disabled={carregando} style={({ pressed }) => [
            styles.botaoPagar,
            (pressed || carregando) && styles.botaoPagarPressionado,
        ]}>
            {carregando ? (<ActivityIndicator color="#FFFFFF"/>) : (<Text style={styles.botaoPagarTexto}>
                {metodo === 'pix'
                ? `Gerar Pix · ${formatarMoeda(total)}`
                : metodo === 'boleto'
                    ? `Gerar boleto · ${formatarMoeda(total)}`
                    : `Pagar ${formatarMoeda(total)}`}
              </Text>)}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Confirmação */}
      <Modal visible={sucesso} transparent animationType="fade" onRequestClose={concluir}>
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={72} color="#16A34A"/>
            <Text style={styles.modalTitulo}>Pedido confirmado!</Text>
            <Text style={styles.modalTexto}>
              {metodo === 'cartao' &&
            `Pagamento aprovado em ${parcelas}x. Você receberá os detalhes por e-mail.`}
              {metodo === 'pix' &&
            'Pedido criado. Finalize o pagamento pelo Pix para liberarmos o envio.'}
              {metodo === 'boleto' &&
            'Pedido criado. Pague o boleto até o vencimento para liberarmos o envio.'}
            </Text>
            <Pressable onPress={concluir} style={styles.botaoPagar}>
              <Text style={styles.botaoPagarTexto}>Continuar comprando</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>);
}
/* -------------------------------------------------------------------------- */
/* Estilos                                                                    */
/* -------------------------------------------------------------------------- */
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
    botaoVoltar: { width: 32, height: 32, justifyContent: 'center' },
    headerTitulo: { fontSize: 18, fontWeight: '700', color: '#111827' },
    conteudo: { padding: 16, paddingBottom: 24 },
    secaoTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginTop: 8,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    // Itens
    itemLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    itemLinhaBorda: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
    itemImagem: {
        width: 56,
        height: 56,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemNome: { fontSize: 14, fontWeight: '600', color: '#111827' },
    itemDetalhe: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    itemPreco: { fontSize: 14, fontWeight: '700', color: '#111827' },
    // Métodos
    metodosLinha: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    metodo: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    metodoAtivo: { backgroundColor: '#111827', borderColor: '#111827' },
    metodoTexto: { fontSize: 13, fontWeight: '600', color: '#374151' },
    metodoTextoAtivo: { color: '#FFFFFF' },
    // Formulário
    campoWrapper: { marginBottom: 12 },
    rotulo: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
    input: {
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    inputErro: { borderColor: '#DC2626' },
    textoErro: { fontSize: 12, color: '#DC2626', marginTop: 4 },
    linhaDupla: { flexDirection: 'row' },
    espacoColunas: { width: 12 },
    // Parcelas
    parcelasLinha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    parcela: {
        width: '48%',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
    },
    parcelaAtiva: { backgroundColor: '#111827', borderColor: '#111827' },
    parcelaTexto: { fontSize: 13, fontWeight: '600', color: '#111827' },
    parcelaSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
    parcelaTextoAtivo: { color: '#FFFFFF' },
    // Pix / boleto
    infoBox: {
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        marginBottom: 16,
    },
    infoTexto: { flex: 1, fontSize: 13, lineHeight: 19, color: '#374151' },
    // Totais
    totalLinha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    totalRotulo: { fontSize: 14, color: '#4B5563' },
    totalValor: { fontSize: 14, color: '#111827', fontWeight: '500' },
    descontoValor: { color: '#16A34A' },
    divisor: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginVertical: 8 },
    totalFinalRotulo: { fontSize: 16, fontWeight: '700', color: '#111827' },
    totalFinalValor: { fontSize: 18, fontWeight: '800', color: '#111827' },
    seguro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    seguroTexto: { fontSize: 12, color: '#6B7280' },
    // Rodapé / botão
    rodape: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E7EB',
    },
    botaoPagar: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
    },
    botaoPagarPressionado: { opacity: 0.8 },
    botaoPagarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    // Modal
    modalFundo: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        gap: 10,
    },
    modalTitulo: { fontSize: 20, fontWeight: '800', color: '#111827' },
    modalTexto: {
        fontSize: 14,
        lineHeight: 20,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 10,
    },
});