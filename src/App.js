import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Star, Heart, Filter, X, Play, Tv, Film, Calendar, Clock, 
  Home, Bookmark, ThumbsUp, Sliders, ChevronDown, Loader, AlertCircle,
  Moon, Sun
} from 'lucide-react';

const MovieTVRecommendationSystem = () => {
  const [content, setContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [contentType, setContentType] = useState('movie');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [watchlist, setWatchlist] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [darkMode, setDarkMode] = useState(false);

  // Adiciona ou remove a classe dark do documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Substitua por sua chave da API do TMDB
  const API_KEY = '4e44d9029b1270a757cddc766a1bcb63'; // EXEMPLO - USE SUA PRÓPRIA CHAVE
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Carregar gêneros da API
  const loadGenres = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/genre/${contentType}/list?api_key=${API_KEY}&language=pt-BR`);
      const data = await res.json();
      setGenres(data.genres || []);
    } catch {
      setGenres([]);
    }
  }, [contentType]);

  // Carregar conteúdo da API (filmes ou séries populares)
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        contentType === 'movie'
          ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`
          : `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setContent(data.results || []);
    } catch (e) {
      setError('Erro ao carregar conteúdo.');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  // Buscar conteúdo (filme ou série)
  const searchContent = useCallback(async (query) => {
    if (!query) {
      loadContent();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        contentType === 'movie'
          ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
          : `${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setContent(data.results || []);
    } catch (e) {
      setError('Erro ao buscar conteúdo.');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [contentType, loadContent]);

  // Filtrar por gênero
  const filterByGenre = useCallback(async (genreId) => {
    if (!genreId) {
      loadContent();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        contentType === 'movie'
          ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}`
          : `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setContent(data.results || []);
    } catch (e) {
      setError('Erro ao filtrar por gênero.');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [contentType, loadContent]);

  // Efeitos para carregar dados ao trocar tipo
  useEffect(() => {
    loadGenres();
    loadContent();
  }, [contentType, loadGenres, loadContent]);

  // Gerenciar favoritos
  const toggleFavorite = useCallback((itemId) => {
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Gerenciar watchlist
  const toggleWatchlist = useCallback((itemId) => {
    setWatchlist(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Avaliar conteúdo
  const rateContent = useCallback((itemId, rating) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
  }, []);

  // Ordenar conteúdo
  const sortContent = useCallback((items) => {
    // Implemente aqui ou remova se não for usar
    return items;
  }, [sortBy]);

  // Handlers
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      searchContent(searchTerm);
    }
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    filterByGenre(genreId);
  };

  const handleContentTypeChange = (type) => {
    setContentType(type);
    setSearchTerm('');
    setSelectedGenre('');
  };

  // Componente de avaliação por estrelas (mesmo que antes)
  const StarRating = React.memo(({ itemId, currentRating = 0, interactive = true, size = 'md' }) => {
    // ... (mesmo conteúdo que antes)
  });

  // Componente de card de conteúdo - atualizado para dark mode
  const ContentCard = React.memo(({ item }) => {
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const genreNames = item.genre_ids
      ?.map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const formatDuration = (item) => {
      if (item.type === 'movie') {
        return `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}min`;
      } else {
        const avgRuntime = item.episode_run_time?.[0] || 45;
        return `${item.number_of_seasons} temporada${item.number_of_seasons > 1 ? 's' : ''} • ${avgRuntime}min/ep`;
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-600/50 transition-all duration-300 transform hover:-translate-y-1 group">
        <div className="relative">
          <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
            {item.poster_path ? (
              <img
                src={
                  item.poster_path.startsWith('/placeholder')
                    ? item.poster_path
                    : `${IMAGE_BASE_URL}${item.poster_path}`
                }
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                {item.type === 'movie' ? (
                  <Film className="w-16 h-16 text-white opacity-70" />
                ) : (
                  <Tv className="w-16 h-16 text-white opacity-70" />
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <button
                onClick={() => setSelectedContent(item)}
                className="flex items-center gap-2 px-3 py-1 bg-white/90 dark:bg-gray-700/90 text-gray-800 dark:text-white rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-gray-600 transition-colors"
              >
                <Play className="w-4 h-4" />
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{item.overview}</p>
          
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(releaseDate).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(item)}</span>
            </div>
          </div>
          
          {genreNames && (
            <div className="mb-3">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{genreNames}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <StarRating itemId={item.id} size="sm" />
            <button
              onClick={() => setSelectedContent(item)}
              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Detalhes
            </button>
          </div>
        </div>
      </div>
    );
  });

  // Componente de item de lista - atualizado para dark mode
  const ContentListItem = React.memo(({ item }) => {
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const genreNames = item.genre_ids
      ?.map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/50 overflow-hidden hover:shadow-md dark:hover:shadow-gray-600/50 transition-all duration-300 flex"
        onClick={() => setSelectedContent(item)}
      >
        <div className="w-24 h-32 bg-gradient-to-br from-purple-400 to-blue-500 flex-shrink-0 relative">
          {item.poster_path ? (
            <img 
              src={
                item.poster_path?.startsWith('/placeholder')
                  ? item.poster_path
                  : item.poster_path
                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                    : '/placeholder1.jpg'
              }
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
            {item.type === 'movie' ? (
              <Film className="w-8 h-8 text-white opacity-70" />
            ) : (
              <Tv className="w-8 h-8 text-white opacity-70" />
            )}
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg dark:text-white">{title}</h3>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(item.id);
                }}
                className={`p-1 rounded-full transition-colors ${
                  watchlist.includes(item.id) 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${watchlist.includes(item.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className={`p-1 rounded-full transition-colors ${
                  favorites.includes(item.id) 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span>{new Date(releaseDate).getFullYear()}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">{item.overview}</p>
          
          {genreNames && (
            <div className="mt-auto pt-2">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{genreNames}</span>
            </div>
          )}
        </div>
      </div>
    );
  });

  // Modal de detalhes - atualizado para dark mode
  const ContentModal = ({ item, onClose }) => {
    if (!item) return null;

    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const genreNames = item.genre_ids
      ?.map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const formatDuration = (item) => {
      if (item.type === 'movie') {
        return `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}min`;
      } else {
        const avgRuntime = item.episode_run_time?.[0] || 45;
        return `${item.number_of_seasons} temporada${item.number_of_seasons > 1 ? 's' : ''} • ${avgRuntime}min/ep`;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 dark:bg-gray-700/80 p-2 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors z-10"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
          
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
              {item.backdrop_path ? (
                <img 
                  src={`${IMAGE_BASE_URL}${item.backdrop_path}`}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-4">
                <div className="w-24 h-36 bg-white dark:bg-gray-700 rounded-lg shadow-md flex-shrink-0 relative overflow-hidden">
                  {item.poster_path ? (
                    <img 
                      src={`${IMAGE_BASE_URL}${item.poster_path}`}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                      {item.type === 'movie' ? (
                        <Film className="w-8 h-8 text-white" />
                      ) : (
                        <Tv className="w-8 h-8 text-white" />
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-white">{title}</h2>
                  <div className="flex items-center gap-4 text-white mt-2">
                    <span>{new Date(releaseDate).getFullYear()}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{formatDuration(item)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    {item.type === 'movie' ? 'Assistir Trailer' : 'Ver Trailer'}
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleWatchlist(item.id)}
                      className={`p-2 rounded-full transition-colors ${
                        watchlist.includes(item.id) 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${watchlist.includes(item.id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.includes(item.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 dark:text-white">Sinopse</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{item.overview || 'Sinopse não disponível.'}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Tipo</h4>
                    <p className="font-medium dark:text-white">{item.type === 'movie' ? 'Filme' : 'Série'}</p>
                  </div>
                  
                  {genreNames && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Gêneros</h4>
                      <p className="font-medium dark:text-white">{genreNames}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {item.type === 'movie' ? 'Data de Lançamento' : 'Estreia'}
                    </h4>
                    <p className="font-medium dark:text-white">
                      {new Date(releaseDate).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {item.type === 'movie' ? 'Duração' : 'Duração por episódio'}
                    </h4>
                    <p className="font-medium dark:text-white">
                      {item.type === 'movie' 
                        ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}min`
                        : `${item.episode_run_time?.[0] || 45} minutos`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-64 flex-shrink-0">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-bold mb-3 dark:text-white">Avalie este {item.type === 'movie' ? 'filme' : 'série'}</h3>
                  <div className="flex justify-center mb-4">
                    <StarRating itemId={item.id} size="lg" />
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-bold mb-2 dark:text-white">Estatísticas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Popularidade</span>
                        <span className="font-medium dark:text-white">{item.popularity?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Avaliação média</span>
                        <span className="font-medium dark:text-white">{item.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Total de votos</span>
                        <span className="font-medium dark:text-white">{item.vote_count || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Obter conteúdo atual baseado na aba ativa (mesmo que antes)
  const getCurrentContent = () => {
    if (activeTab === 'favorites') {
      return content.filter(item => favorites.includes(item.id));
    }
    if (activeTab === 'watchlist') {
      return content.filter(item => watchlist.includes(item.id));
    }
    // Adapte para recommendations se implementar depois
    return content;
  };

  // Renderização principal - atualizada para dark mode
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FlemBox</h1>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Buscar ${contentType === 'movie' ? 'filmes...' : 'séries...'}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleContentTypeChange('movie')}
              className={`p-2 rounded-full transition-colors ${contentType === 'movie' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-500 hover:text-white'}`}
              aria-label="Filmes"
            >
              <Film className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleContentTypeChange('tv')}
              className={`p-2 rounded-full transition-colors ${contentType === 'tv' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-500 hover:text-white'}`}
              aria-label="Séries"
            >
              <Tv className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="max-w-7xl mx-auto px-4 mt-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'discover', label: 'Descobrir', icon: <Home className="w-4 h-4" /> },
          { id: 'favorites', label: 'Favoritos', icon: <Heart className="w-4 h-4" /> },
          { id: 'watchlist', label: 'Assistir depois', icon: <Bookmark className="w-4 h-4" /> },
          { id: 'recommendations', label: 'Recomendados', icon: <ThumbsUp className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 mt-4 flex flex-col sm:flex-row gap-4 items-center">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Sliders className="w-4 h-4" />
          Filtros
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1 max-w-xs">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGenre}
                onChange={e => handleGenreChange(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos os gêneros</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 max-w-xs">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="popularity">Mais populares</option>
                <option value="rating">Melhor avaliados</option>
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
              </select>
            </div>
            <div className="relative flex-1 max-w-xs">
              <select
                value={viewMode}
                onChange={e => setViewMode(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="grid">Visualização em grade</option>
                <option value="list">Visualização em lista</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {getCurrentContent().length === 0 ? (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                Nenhum conteúdo encontrado.
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {getCurrentContent().map(item => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {getCurrentContent().map(item => (
                  <ContentListItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de detalhes */}
      {selectedContent && (
        <ContentModal
          item={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} FlemBox. Todos os direitos reservados.
          </p>
        </div>
        <p className="text-gray-500 dark:text-gray-600 text-sm mt-2 text-center w-full transition-colors duration-300">
          Desenvolvido por <a href="https://instagram.com/devmxs" className="hover:text-blue-400 dark:hover:text-blue-500 font-semibold transition">DEVMXS</a>
        </p>
      </footer>

      {/* Botão de alternar tema */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 bg-blue-500 dark:bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-purple-700 transition-colors duration-300 z-20"
        aria-label={darkMode ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default MovieTVRecommendationSystem;