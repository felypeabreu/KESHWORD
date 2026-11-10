// Produtos locais (usados como fallback caso a coleção "produtos" do Firestore esteja vazia)
const img = (text) =>
  `https://placehold.co/400x500/EFEBE3/111111/png?text=${encodeURIComponent(text)}`;

export const products = [
  { id: 'm1', nome: 'Camiseta Básica Preta', preco: 59.9, categoria: 'masculino', imagem: img('Camiseta Preta'), destaque: true },
  { id: 'm2', nome: 'Camisa Social Branca', preco: 129.9, categoria: 'masculino', imagem: img('Camisa Social'), destaque: false },
  { id: 'm3', nome: 'Calça Jeans Slim', preco: 189.9, categoria: 'masculino', imagem: img('Calça Jeans'), destaque: true },
  { id: 'm4', nome: 'Jaqueta Bomber', preco: 249.9, categoria: 'masculino', imagem: img('Jaqueta Bomber'), destaque: false },
  { id: 'm5', nome: 'Bermuda Chino', preco: 99.9, categoria: 'masculino', imagem: img('Bermuda Chino'), destaque: false },
  { id: 'f1', nome: 'Blusa Cropped Off White', preco: 69.9, categoria: 'feminino', imagem: img('Blusa Cropped'), destaque: true },
  { id: 'f2', nome: 'Vestido Midi Floral', preco: 179.9, categoria: 'feminino', imagem: img('Vestido Midi'), destaque: true },
  { id: 'f3', nome: 'Calça Wide Leg', preco: 159.9, categoria: 'feminino', imagem: img('Calça Wide Leg'), destaque: false },
  { id: 'f4', nome: 'Saia Plissada', preco: 119.9, categoria: 'feminino', imagem: img('Saia Plissada'), destaque: false },
  { id: 'f5', nome: 'Blazer Alfaiataria', preco: 229.9, categoria: 'feminino', imagem: img('Blazer'), destaque: false },
];

export const sizes = ['P', 'M', 'G', 'GG'];
