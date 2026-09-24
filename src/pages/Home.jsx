import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowUpDown, Calendar, Star, RotateCcw } from 'lucide-react';
import tmdbApi from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import { useFavorites } from '../hooks/useFavorites.js';
import { useDebounce } from '../hooks/useDebounce.js';
import styles from './Home.module.css';

const GENRES = [
  { id: 'popular', name: 'Populares', endpoint: '/movie/popular' },
  { id: '28', name: 'Ação', endpoint: '/discover/movie', params: { with_genres: 28 } },
  { id: '35', name: 'Comédia', endpoint: '/discover/movie', params: { with_genres: 35 } },
  { id: '18', name: 'Drama', endpoint: '/discover/movie', params: { with_genres: 18 } },
  { id: '10749', name: 'Romance', endpoint: '/discover/movie', params: { with_genres: 10749 } },
  { id: '878', name: 'Ficção Científica', endpoint: '/discover/movie', params: { with_genres: 878 } },
  { id: '10751', name: 'Infantil', endpoint: '/discover/movie', params: { with_genres: '16,10751' } }
];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(GENRES[0]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para os filtros adicionais no endpoint /discover/movie
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { isFavorite, toggleFavorite } = useFavorites();
  const observer = useRef();

  const handleResetFilters = () => {
    setSortBy('popularity.desc');
    setYear('');
    setMinRating('');
  };

  const lastMovieRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Reinicia lista e página ao mudar aba, busca por texto ou filtros
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [activeTab, debouncedSearch, sortBy, year, minRating]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let response;

        // 1. PESQUISA NORMAL POR TEXTO (Sempre priorizada se houver busca digitada)
        if (debouncedSearch.trim() !== '') {
          response = await tmdbApi.get('/search/movie', {
            params: { 
              query: debouncedSearch, 
              page 
            },
          });
        } 
        // 2. NAVEGAÇÃO POR ABAS + FILTROS AVANÇADOS (Troca dinamicamente para /discover/movie)
        else {
          // Se estiver na aba 'Populares', mudamos para /discover/movie para aceitar filtros de ordenação e ano
          const isPopularTab = activeTab.id === 'popular';
          const endpoint = isPopularTab ? '/discover/movie' : activeTab.endpoint;

          const params = {
            page,
            ...activeTab.params,
            sort_by: sortBy,
          };

          if (year) {
            params.primary_release_year = year;
          }

          if (minRating) {
            params['vote_average.gte'] = minRating;
            params['vote_count.gte'] = 100; // Evita filmes irrelevantes com pouquíssimos votos
          }

          response = await tmdbApi.get(endpoint, { params });
        }

        const newMovies = response.data.results || [];
        const totalPages = response.data.total_pages || 1;

        setMovies((prevMovies) =>
          page === 1 ? newMovies : [...prevMovies, ...newMovies]
        );
        setHasMore(page < totalPages);
      } catch (error) {
        console.error('Erro ao buscar filmes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeTab, page, debouncedSearch, sortBy, year, minRating]);

  const handleTabChange = (genre) => {
    setActiveTab(genre);
    setSearchTerm(''); // Limpa a busca ao trocar de aba
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.topActionsContainer}>
        {/* Abas de Gêneros */}
        <div className={styles.tabsContainer}>
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              className={`${styles.tabBtn} ${
                activeTab.id === genre.id && !searchTerm ? styles.active : ''
              }`}
              onClick={() => handleTabChange(genre)}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Campo de Pesquisa Normal por Texto */}
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar filme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros Avançados (visível apenas quando NÃO estiver pesquisando por texto) */}
      {!searchTerm && (
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            <ArrowUpDown size={15} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="popularity.desc">Mais Populares</option>
              <option value="revenue.desc">Maior Bilheteria</option>
              <option value="vote_average.desc">Melhor Avaliados</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <Calendar size={15} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Ano:</span>
            <input
              type="number"
              placeholder="Ex: 1984"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={styles.filterInput}
              min="1900"
              max="2026"
            />
          </div>

          <div className={styles.filterGroup}>
            <Star size={15} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Nota Mínima:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas</option>
              <option value="6">6.0+</option>
              <option value="7">7.0+</option>
              <option value="8">8.0+</option>
            </select>
          </div>

          {(sortBy !== 'popularity.desc' || year !== '' || minRating !== '') && (
            <button
              onClick={handleResetFilters}
              className={styles.resetFiltersBtn}
              title="Limpar Filtros"
            >
              <RotateCcw size={14} /> Limpar
            </button>
          )}
        </div>
      )}

      {/* Título Dinâmico */}
      <h1 className={styles.title}>
        {debouncedSearch
          ? `Resultados para: "${debouncedSearch}"`
          : `Catálogo: ${activeTab.name}`}
      </h1>

      {/* Grid de Filmes */}
      {movies.length === 0 && !loading ? (
        <p className={styles.emptyText}>Nenhum filme encontrado.</p>
      ) : (
        <div className={styles.grid}>
          {movies.map((movie, index) => {
            const isLastItem = movies.length === index + 1;
            return (
              <div key={`${movie.id}-${index}`} ref={isLastItem ? lastMovieRef : null}>
                <MovieCard
                  movie={movie}
                  isFavorite={isFavorite(movie.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            );
          })}
        </div>
      )}

      {loading && <p className={styles.loadingText}>Carregando filmes...</p>}
    </div>
  );
}