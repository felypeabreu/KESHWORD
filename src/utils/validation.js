export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function validateLogin({ email, senha }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Informe seu e-mail.';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
  if (!senha) errors.senha = 'Informe sua senha.';
  return errors;
}

export function validateRegister({ nome, email, senha, confirmar }) {
  const errors = {};
  if (!nome.trim()) errors.nome = 'Informe seu nome.';
  if (!email.trim()) errors.email = 'Informe seu e-mail.';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
  if (!senha) errors.senha = 'Informe uma senha.';
  else if (senha.length < 6) errors.senha = 'A senha deve ter ao menos 6 caracteres.';
  if (confirmar !== senha) errors.confirmar = 'As senhas não conferem.';
  return errors;
}

export const formatPrice = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function firebaseErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password':
      return 'Senha muito fraca.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
