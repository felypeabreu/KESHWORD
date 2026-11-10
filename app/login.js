import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../src/components/Button';
import Input from '../src/components/Input';
import { useToast } from '../src/components/Toast';
import { useAuth } from '../src/context/AuthContext';
import { firebaseErrorMessage, validateLogin } from '../src/utils/validation';
import { colors } from '../src/theme';

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const found = validateLogin({ email, senha });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      setLoading(true);
      await login(email, senha);
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
        <Text style={styles.sub}>Entre para usar seu carrinho</Text>

        <Input
          label="E-mail"
          placeholder="voce@email.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />
        <Input
          label="Senha"
          placeholder="••••••"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          error={errors.senha}
        />

        <Button title="Entrar" onPress={handleLogin} loading={loading} />

        <Pressable onPress={() => router.push('/cadastro')} style={{ marginTop: 20 }}>
          <Text style={styles.link}>Não tem conta? <Text style={{ fontWeight: '700' }}>Cadastre-se</Text></Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  logo: { fontSize: 40, fontWeight: '900', letterSpacing: 6, textAlign: 'center', color: colors.primary },
  sub: { textAlign: 'center', color: colors.muted, marginBottom: 32, marginTop: 4 },
  link: { textAlign: 'center', color: colors.text },
});
