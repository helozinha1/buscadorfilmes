import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Calendar, 
  Clapperboard, 
  Globe, 
  DollarSign,
  Tv,
  Users
} from 'lucide-react';
import tmdbApi from '../api/tmdb';
import styles from './MovieDetails.module.css';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [detailsRes, videosRes, creditsRes] = await Promise.all([
          tmdbApi.get(`/movie/${id}`),
          tmdbApi.get(`/movie/${id}/videos`),
          tmdbApi.get(`/movie/${id}/credits`)
        ]);

        setMovie(detailsRes.data);

        const trailer = videosRes.data.results.find(
          (v) => v.site === 'YouTube' && v.type === 'Trailer'
        ) || videosRes.data.results.find((v) => v.site === 'YouTube');
        
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        if (creditsRes.data.cast) {
          setCast(creditsRes.data.cast.slice(0, 15));
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do filme", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <p className={styles.loadingText}>Carregando dados do filme...</p>;
  if (!movie) return <p className={styles.loadingText}>Filme não encontrado.</p>;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Capa';

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const genres = movie.genres ? movie.genres.map((g) => g.name).join(', ') : 'N/A';
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString('pt-BR')
    : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';

  return (
    <div
      className={styles.wrapper}
      style={
        backdropUrl
          ? { backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(8, 7, 11, 0.98)), url(${backdropUrl})` }
          : {}
      }
    >
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={18} /> Voltar para o Catálogo
        </Link>

        <div className={styles.content}>
          <div className={styles.imagesContainer}>
            <img src={posterUrl} alt={`Cartaz de ${movie.title}`} className={styles.poster} />
          </div>

          <div className={styles.infoContainer}>
            <h1 className={styles.movieTitle}>{movie.title}</h1>
            {movie.tagline && <p className={styles.tagline}>"{movie.tagline}"</p>}

            <div className={styles.badges}>
              <span className={styles.ratingBadge}>
                <Star size={16} fill="#f5c518" stroke="#f5c518" /> {rating} / 10
              </span>
              <span className={styles.runtimeBadge}>
                <Clock size={16} /> {runtime}
              </span>
              <span className={styles.dateBadge}>
                <Calendar size={16} /> {releaseDate}
              </span>
            </div>

            <div className={styles.overviewSection}>
              <h3 className={styles.overviewTitle}>Sinopse</h3>
              <p className={styles.overviewText}>
                {movie.overview || 'Sinopse não disponível em português.'}
              </p>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <strong className={styles.detailLabel}>
                  <Clapperboard size={16} /> Gêneros:
                </strong>{' '}
                <span className={styles.detailValue}>{genres}</span>
              </div>
              <div className={styles.detailItem}>
                <strong className={styles.detailLabel}>
                  <Globe size={16} /> Idioma Original:
                </strong>{' '}
                <span className={styles.detailValue}>{movie.original_language?.toUpperCase()}</span>
              </div>
              {movie.budget > 0 && (
                <div className={styles.detailItem}>
                  <strong className={styles.detailLabel}>
                    <DollarSign size={16} /> Orçamento:
                  </strong>{' '}
                  <span className={styles.detailValue}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(movie.budget)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>
              <Users size={20} /> Elenco Principal
            </h2>
            <div className={styles.castCarousel}>
              {cast.map((actor) => (
                <div key={actor.id} className={styles.castCard}>
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : 'https://via.placeholder.com/185x278?text=Sem+Foto'
                    }
                    alt={actor.name}
                    className={styles.castImage}
                  />
                  <p className={styles.castName}>{actor.name}</p>
                  <p className={styles.castCharacter}>{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {trailerKey && (
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>
              <Tv size={20} /> Trailer Oficial
            </h2>
            <div className={styles.trailerWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title={`Trailer de ${movie.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.trailerIframe}
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}