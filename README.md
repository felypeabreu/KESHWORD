# KESH — Loja de Roupas (React Native + Expo + Firebase)

Aplicativo mobile de loja de roupas desenvolvido como Projeto Final da disciplina de React Native.

## Descrição

A **Kesh** permite navegar livremente pela página inicial e pelos catálogos **masculino** e **feminino**.
O **login só é exigido ao usar o carrinho** (adicionar peças ou finalizar a compra).

## Telas

| Tela | Rota | Login obrigatório? |
|------|------|--------------------|
| Página inicial (destaques) | `/` | Não |
| Catálogo masculino | `/masculino` | Não |
| Catálogo feminino | `/feminino` | Não |
| Carrinho / finalizar compra | `/carrinho` | **Sim** |
| Login | `/login` | — |
| Cadastro | `/cadastro` | — |

> Capturas de tela / GIFs: _adicionar aqui_

## Tecnologias

- React Native + Expo (Expo Router: Stack + Bottom Tabs)
- Estado global: Context API (`AuthContext`, `CartContext` com `useReducer`)
- Firebase Auth (login/cadastro) e Firestore (produtos, carrinhos, pedidos)
- Recurso nativo: Haptics (`expo-haptics`)
- Ícones: `@expo/vector-icons`

## Estrutura de pastas

```
kesh/
├── app/                 # Rotas (Expo Router)
│   ├── _layout.js       # Providers + Stack
│   ├── login.js
│   ├── cadastro.js
│   └── (tabs)/          # Bottom Tabs
│       ├── _layout.js
│       ├── index.js     # Início
│       ├── masculino.js
│       ├── feminino.js
│       └── carrinho.js
└── src/
    ├── components/      # Button, Input, ProductCard, ProductGrid, Toast, Loading
    ├── config/          # firebase.js
    ├── context/         # AuthContext, CartContext
    ├── data/            # produtos locais (fallback)
    ├── services/        # productService, cartService
    ├── theme/           # cores e espaçamentos
    └── utils/           # validações e formatadores
```

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   npx expo install --fix
   ```
2. Crie um projeto no [Firebase Console](https://console.firebase.google.com):
   - Ative **Authentication → E-mail/senha**
   - Crie um banco **Firestore** (modo de teste)
   - Registre um app Web e copie as chaves
3. Copie `.env.example` para `.env` e preencha com as chaves do Firebase de teste.
4. Inicie o app:
   ```bash
   npx expo start
   ```
   Abra no emulador ou no celular com o app **Expo Go**.

### Coleções do Firestore

- `produtos` (opcional): `{ nome, preco, categoria: 'masculino' | 'feminino', imagem, destaque }`.
  Se estiver vazia, o app usa os produtos de `src/data/products.js`.
- `carrinhos/{uid}`: carrinho de cada usuário (criado automaticamente).
- `pedidos`: pedidos finalizados (criado automaticamente).

## Git Flow

- `main` — versão estável
- `develop` — integração
- `feature/nome-da-funcionalidade` — novas funcionalidades (merge em `develop` via Pull Request)

## Divisão de tarefas

| Integrante | Tarefas |
|------------|---------|
| _Nome 1_ | _ex.: Login/Cadastro e Firebase Auth_ |
| _Nome 2_ | _ex.: Catálogos e Home_ |
| _Nome 3_ | _ex.: Carrinho e Firestore_ |
