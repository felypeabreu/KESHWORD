import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../src/components/Button';
import Input from '../src/components/Input';
import { useToast } from '../src/components/Toast';
import { useAuth } from '../src/context/AuthContext';
import { firebaseErrorMessage, validateRegister } from '../src/utils/validation';
import { colors } from '../src/theme';

export default function Cadastro() {
  const router = useRouter();
  const toast = useToast();
  const { register } = useAuth();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    const found = validateRegister(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      setLoading(true);
      await register(form.nome, form.email, form.senha);
      toast.show('Conta criada com sucesso!');
      router.replace('/carrinho');
    } catch (e) {
      toast.show(firebaseErrorMessage(e.code), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>KESH</Text>
        <Text style={styles.sub}>Crie sua conta</Text>

        <Input label="Nome" placeholder="Seu nome" autoCapitalize="words" value={form.nome} onChangeText={set('nome')} error={errors.nome} />
        <Input label="E-mail" placeholder="voce@email.com" keyboardType="email-address" value={form.email} onChangeText={set('email')} error={errors.email} />
        <Input label="Senha" placeholder="Mínimo 6 caracteres" secureTextEntry value={form.senha} onChangeText={set('senha')} error={errors.senha} />
        <Input label="Confirmar senha" placeholder="Repita a senha" secureTextEntry value={form.confirmar} onChangeText={set('confirmar')} error={errors.confirmar} />

        <Button title="Criar conta" onPress={handleRegister} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  logo: { fontSize: 40, fontWeight: '900', letterSpacing: 6, textAlign: 'center', color: colors.primary },
  sub: { textAlign: 'center', color: colors.muted, marginBottom: 32, marginTop: 4 },
});
