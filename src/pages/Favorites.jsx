import { useFavorites } from '../hooks/useFavorites';
import MovieCard from '../components/MovieCard';
import styles from './Favorites.module.css';

export default function Favorites() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="favorites-page">
      <h1 className={styles.title}>Meus Filmes Favoritos</h1>

      {favorites.length === 0 ? (
        <p className={styles.emptyText}>Você ainda não adicionou nenhum filme aos favoritos.</p>
      ) : (
        <div className={styles.grid}>
          {favorites.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={isFavorite(movie.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}