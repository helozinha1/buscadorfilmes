import { useState, useEffect } from 'react';

const FAVORITES_KEY = '@TMDB_FILMES_FAVORITOS';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (movie) => {
    
    const isFav = favorites.some((item) => item.id === movie.id);

    if (isFav) {
      setFavorites(favorites.filter((item) => item.id !== movie.id));
    } else {
      setFavorites([...favorites, movie]);
    }
  };

  const isFavorite = (movieId) => {
    return favorites.some((item) => item.id === movieId);
  };

  return { favorites, toggleFavorite, isFavorite };
}