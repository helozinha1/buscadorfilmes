import { Link } from 'react-router-dom';
import styles from './MovieCard.module.css';


export default function MovieCard({ movie, isFavorite, onToggleFavorite }) {
   const flagUrl =  movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=Sem+Imagem';
   const title = movie.title || 'Título não disponível';
   const releaseDate = movie.release_date || 'Data de lançamento não disponível';
   return (
    <div className={styles['movie-card']}>
        <div className={styles['image-container']}>
            <img src={flagUrl}  />
            <button 
            className={styles['favorite-btn']}
            onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(movie);
            }}         
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} >
                {isFavorite ? '★' : '☆'}
            </button>
            <div className={styles.overlay}>
                <h3>{title}</h3>
                <p>{releaseDate}</p>
                <Link to={`/filmes/${movie.id}`} className={styles['details-btn']}>Ver Detalhes</Link>
            </div>
        </div>
    </div>
   );
}