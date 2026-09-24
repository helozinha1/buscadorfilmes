import axios from 'axios';


// Importa a variável de ambiente (escondida no arquivo .env)
// O import.meta.env é a forma como o Vite acessa variáveis de ambiente no frontend.
const tokenOrKey = import.meta.env.VITE_TMDB_API_KEY;

/**
 * Cria uma instância customizada do Axios.
 * Isso evita que precisemos digitar a URL completa em toda requisição que formos fazer.
 */
const tmdbApi = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
});

/**
 * Interceptors do Axios
 * Ele "intercepta" todas as requisições ANTES delas saírem do seu computador rumo ao servidor.
 * É perfeito para injetar a Chave da API e a linguagem automaticamente em todas as chamadas.
 */
tmdbApi.interceptors.request.use((config) => {
  // O TMDB oferece dois tipos de chaves (v3 curta ou v4 Token Longo).
  // Se a chave for muito grande (mais de 50 letras), é um Token Bearer
  if (tokenOrKey && tokenOrKey.length > 50) {
    config.headers.Authorization = `Bearer ${tokenOrKey}`;
  } else {
    // Se for curta, é a API Key clássica (v3) que deve ir pela URL (query param)
    config.params = {
      ...config.params,
      api_key: tokenOrKey,
    };
  }
  
  // Garante que o idioma padrão das sinopses e títulos sempre seja Português do Brasil
  config.params = {
    ...config.params,
    language: 'pt-BR'
  };

  return config; // Libera a requisição para seguir viagem
});

export default tmdbApi;