import { Asset } from 'expo-asset';

export const PRODUCTS = [
  {
    id: 1,
    name: 'Camiseta Oversized Pixel',
    cat: 'Camisetas',
    category: 'camisetas',
    gender: 'masculino',
    price: 89.90,
    badge: 'NOVO',
    bg: '#FEF1CF',
    sizes: ['P', 'M', 'G', 'GG'],
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=70',
  },
  {
    id: 2,
    name: 'Camiseta Boxy Logo',
    cat: 'Camisetas',
    category: 'camisetas',
    gender: 'masculino',
    price: 79.90,
    old: 99.90,
    badge: '-20%',
    bg: '#FC3B7F',
    sizes: ['P', 'M', 'G', 'GG'],
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=70',
  },
  {
    id: 3,
    name: 'Camiseta Time de Rua',
    cat: 'Camisetas',
    category: 'camisetas',
    gender: 'masculino',
    price: 99.90,
    bg: '#0032A8',
    sizes: ['P', 'M', 'G', 'GG'],
    image: require('../../assets/produtos/camiseta-time-de-rua.jpg'),
  },
  {
    id: 4,
    name: 'Moletom Capuz Heavy',
    cat: 'Moletons',
    category: 'moletons',
    gender: 'masculino',
    price: 219.90,
    badge: 'NOVO',
    bg: '#FC3B7F',
    sizes: ['P', 'M', 'G', 'GG'],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=70',
  },
  {
    id: 5,
    name: 'Moletom Careca Soft',
    cat: 'Moletons',
    category: 'moletons',
    gender: 'masculino',
    price: 189.90,
    bg: '#0032A8',
    sizes: ['P', 'M', 'G', 'GG'],
    image: require('../../assets/produtos/moletom-careca-soft.jpg'),
  },
  {
    id: 6,
    name: 'Jaqueta Bomber',
    cat: 'Jaquetas',
    category: 'jaquetas',
    gender: 'masculino',
    price: 329.90,
    old: 379.90,
    badge: '-13%',
    bg: '#FEF1CF',
    sizes: ['P', 'M', 'G', 'GG'],
    image: require('../../assets/produtos/jaqueta-bomber.jpg'),
  },
  {
    id: 7,
    name: 'Jaqueta Corta-vento',
    cat: 'Jaquetas',
    category: 'jaquetas',
    gender: 'masculino',
    price: 279.90,
    bg: '#FC3B7F',
    sizes: ['P', 'M', 'G', 'GG'],
    image: require('../../assets/produtos/jaqueta-corta-vento.jpg'),
  },
  {
    id: 8,
    name: 'Calça Cargo Bolsos',
    cat: 'Calças',
    category: 'calcas',
    gender: 'masculino',
    price: 199.90,
    bg: '#FEF1CF',
    sizes: ['38', '40', '42', '44'],
    image: require('../../assets/produtos/calca-cargo-bolsos.jpg'),
  },
  {
    id: 9,
    name: 'Calça Jogger Azul',
    cat: 'Calças',
    category: 'calcas',
    gender: 'masculino',
    price: 169.90,
    badge: 'NOVO',
    bg: '#FC3B7F',
    sizes: ['38', '40', '42', '44'],
    image: require('../../assets/produtos/calca-jogger-azul.jpg'),
  },
  {
    id: 10,
    name: 'Bermuda Cargo',
    cat: 'Calças',
    category: 'calcas',
    gender: 'masculino',
    price: 139.90,
    bg: '#0032A8',
    sizes: ['38', '40', '42', '44'],
    image: require('../../assets/produtos/bermuda-cargo.jpg'),
  },
  {
    id: 11,
    name: 'Boné Dad Hat',
    cat: 'Acessórios',
    category: 'acessorios',
    gender: 'masculino',
    price: 69.90,
    bg: '#FEF1CF',
    sizes: ['Único'],
    image: require('../../assets/produtos/bone-dad-hat.jpg'),
  },
  {
    id: 12,
    name: 'Boné Five Panel',
    cat: 'Acessórios',
    category: 'acessorios',
    gender: 'masculino',
    price: 74.90,
    old: 89.90,
    badge: '-17%',
    bg: '#FC3B7F',
    sizes: ['Único'],
    image: require('../../assets/produtos/bone-five-panel.jpg'),
  },
];

// A imagem pode ser um link (string) ou um arquivo local (require).
// Esta função devolve o formato que o <Image source={...}> espera.
export const imageSource = (product) =>
  typeof product.image === 'string' ? { uri: product.image } : product.image;

// Link (uri) da imagem, para telas que usam <Image source={{ uri }} /> (carrinho, ProductCard).
export const imageUri = (product) => {
  if (typeof product.image === 'string') return product.image;
  try {
    return Asset.fromModule(product.image).uri;
  } catch (e) {
    return undefined;
  }
};

// Tamanhos padrão (usados pelo ProductCard)
export const sizes = ['P', 'M', 'G', 'GG'];

// Formato em português esperado por productService / ProductCard / ProductGrid
export const products = PRODUCTS.map((p) => ({
  id: String(p.id),
  nome: p.name,
  preco: p.price,
  imagem: imageUri(p),
  categoria: p.gender || 'masculino',
  destaque: Boolean(p.badge),
}));

export const findProductById = (id) => PRODUCTS.find((p) => String(p.id) === String(id));

// Converte um produto + tamanho escolhido para o formato que o CartContext espera.
export const toCartItem = (product, tamanho) => ({
  id: String(product.id),
  nome: product.name,
  preco: product.price,
  imagem: imageUri(product),
  tamanho,
});

export default PRODUCTS;