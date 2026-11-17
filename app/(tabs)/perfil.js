import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import Loading from '../../src/components/Loading';
import { useToast } from '../../src/components/Toast';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { firebaseErrorMessage, validateChangePassword } from '../../src/utils/validation';
import { colors, radius } from '../../src/theme';

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR');
};

export default function Perfil() {
  const router = useRouter();
  const toast = useToast();
  const { user, initializing, logout, updateName, changePassword } = useAuth();
  const { count } = useCart();

  const [nome, setNome] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errors, setErrors] = useState({});
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    setNome(user?.displayName || '');
  }, [user?.displayName]);

  if (initializing) return <Loading />;

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={64} color={colors.muted} />
        <Text style={styles.title}>Entre na sua conta</Text>
        <Text style={styles.sub}>Faça login ou crie uma conta para ver seus dados e comprar na Kesh.</Text>
        <Button title="Entrar" onPress={() => router.push('/login')} style={{ width: '100%', marginTop: 20 }} />
        <Button
          title="Criar conta"
          variant="outline"
          onPress={() => router.push('/cadastro')}
          style={{ width: '100%', marginTop: 10 }}
        />
      </View>
    );
  }

  const displayName = user.displayName || 'Cliente Kesh';
  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();
  const since = formatDate(user.metadata?.creationTime);
  const nameChanged = nome.trim().length > 0 && nome.trim() !== (user.displayName || '');

  const handleSaveName = async () => {
    if (!nameChanged) return;
    try {
      setSavingName(true);
      await updateName(nome);
      toast.show('Nome atualizado!');
    } catch (e) {
      toast.show(firebaseErrorMessage(e.code), 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    const found = validateChangePassword({ atual, nova, confirmar });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      setSavingPass(true);
      await changePassword(atual, nova);
      setAtual('');
      setNova('');
      setConfirmar('');
      setErrors({});
      toast.show('Senha alterada com sucesso!');
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        setErrors({ atual: 'Senha atual incorreta.' });
      } else {
        toast.show(firebaseErrorMessage(e.code), 'error');
      }
    } finally {
      setSavingPass(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.show('Você saiu da conta.');
      router.replace('/');
    } catch (e) {
      toast.show('Não foi possível sair. Tente novamente.', 'error');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {since ? <Text style={styles.since}>Cliente desde {since}</Text> : null}
          </View>

          <Pressable style={styles.row} onPress={() => router.push('/carrinho')}>
            <Ionicons name="bag-outline" size={20} color={colors.text} />
            <Text style={styles.rowText}>Meu carrinho</Text>
            <Text style={styles.rowBadge}>{count > 0 ? `${count} ${count === 1 ? 'item' : 'itens'}` : 'vazio'}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados da conta</Text>
            <Input label="Nome" placeholder="Seu nome" value={nome} onChangeText={setNome} autoCapitalize="words" />
            <Input label="E-mail" value={user.email || ''} editable={false} style={styles.readonly} />
            <Button title="Salvar nome" onPress={handleSaveName} loading={savingName} style={!nameChanged && { opacity: 0.5 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alterar senha</Text>
            <Input
              label="Senha atual"
              placeholder="••••••"
              secureTextEntry
              value={atual}
              onChangeText={setAtual}
              error={errors.atual}
            />
            <Input
              label="Nova senha"
              placeholder="Mínimo de 6 caracteres"
              secureTextEntry
              value={nova}
              onChangeText={setNova}
              error={errors.nova}
            />
            <Input
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              secureTextEntry
              value={confirmar}
              onChangeText={setConfirmar}
              error={errors.confirmar}
            />
            <Button title="Alterar senha" onPress={handleChangePassword} loading={savingPass} />
          </View>

          <Button title="Sair da conta" variant="outline" onPress={handleLogout} style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 12 },
  sub: { textAlign: 'center', color: colors.muted, marginTop: 6 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 12 },
  email: { color: colors.muted, marginTop: 2 },
  since: { color: colors.muted, fontSize: 12, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  rowBadge: { color: colors.muted, fontSize: 13 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 14 },
  readonly: { backgroundColor: colors.background, color: colors.muted },
});
