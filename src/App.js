import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Star, Heart, Filter, X, Play, Tv, Film, Calendar, Clock, 
  Home, Bookmark, ThumbsUp, Sliders, ChevronDown, Loader, AlertCircle 
} from 'lucide-react';

const MovieTVRecommendationSystem = () => {
  const [content, setContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [contentType, setContentType] = useState('movie');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [watchlist, setWatchlist] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Substitua por sua chave da API do TMDB
  const API_KEY = '4e44d9029b1270a757cddc766a1bcb63'; // EXEMPLO - USE SUA PRÓPRIA CHAVE
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Dados mock para demonstração
  const mockMovies = [
    {
      id: 1,
      title: 'Inception',
      overview: 'Um ladrão que rouba segredos corporativos através da tecnologia de compartilhamento de sonhos...',
      poster_path: '/placeholder1.jpg',
      backdrop_path: '/backdrop1.jpg',
      vote_average: 8.8,
      release_date: '2010-07-16',
      genre_ids: [28, 878, 53],
      type: 'movie',
      runtime: 148,
      popularity: 85.5
    },
    {
      id: 2,
      title: 'The Matrix',
      overview: 'Um programador de computador descobre que a realidade como ele a conhece não é real...',
      poster_path: '/placeholder2.jpg',
      backdrop_path: '/backdrop2.jpg',
      vote_average: 8.7,
      release_date: '1999-03-31',
      genre_ids: [28, 878],
      type: 'movie',
      runtime: 136,
      popularity: 78.2
    },
    {
      id: 3,
      title: 'Interstellar',
      overview: 'Um grupo de exploradores faz uso de uma fenda no espaço-tempo recém-descoberta...',
      poster_path: '/placeholder3.jpg',
      backdrop_path: '/backdrop3.jpg',
      vote_average: 8.6,
      release_date: '2014-11-07',
      genre_ids: [18, 878],
      type: 'movie',
      runtime: 169,
      popularity: 92.1
    },
    {
      id: 4,
      title: 'The Dark Knight',
      overview: 'Quando a ameaça conhecida como Coringa surge de seu passado misterioso...',
      poster_path: '/placeholder4.jpg',
      backdrop_path: '/backdrop4.jpg',
      vote_average: 9.0,
      release_date: '2008-07-18',
      genre_ids: [28, 80, 18],
      type: 'movie',
      runtime: 152,
      popularity: 95.3
    }
  ];

  const mockTVShows = [
    {
      id: 101,
      name: 'Breaking Bad',
      title: 'Breaking Bad',
      overview: 'Um professor de química do ensino médio diagnosticado com câncer de pulmão inoperável...',
      poster_path: '/placeholder5.jpg',
      backdrop_path: '/backdrop5.jpg',
      vote_average: 9.5,
      first_air_date: '2008-01-20',
      genre_ids: [18, 80],
      type: 'tv',
      number_of_seasons: 5,
      number_of_episodes: 62,
      episode_run_time: [47],
      popularity: 88.7
    },
    {
      id: 102,
      name: 'Stranger Things',
      title: 'Stranger Things',
      overview: 'Quando um garoto desaparece, sua mãe, um chefe de polícia e seus amigos devem confrontar...',
      poster_path: '/placeholder6.jpg',
      backdrop_path: '/backdrop6.jpg',
      vote_average: 8.7,
      first_air_date: '2016-07-15',
      genre_ids: [18, 14, 27],
      type: 'tv',
      number_of_seasons: 4,
      number_of_episodes: 42,
      episode_run_time: [50],
      popularity: 94.2
    },
    {
      id: 103,
      name: 'Game of Thrones',
      title: 'Game of Thrones',
      overview: 'Nove famílias nobres lutam pelo controle das terras míticas de Westeros...',
      poster_path: '/placeholder7.jpg',
      backdrop_path: '/backdrop7.jpg',
      vote_average: 9.3,
      first_air_date: '2011-04-17',
      genre_ids: [18, 14, 10759],
      type: 'tv',
      number_of_seasons: 8,
      number_of_episodes: 73,
      episode_run_time: [60],
      popularity: 97.5
    },
    {
      id: 104,
      name: 'The Office',
      title: 'The Office',
      overview: 'Uma comédia mockumentary sobre um grupo de funcionários de escritório típicos...',
      poster_path: '/placeholder8.jpg',
      backdrop_path: '/backdrop8.jpg',
      vote_average: 8.9,
      first_air_date: '2005-03-24',
      genre_ids: [35],
      type: 'tv',
      number_of_seasons: 9,
      number_of_episodes: 201,
      episode_run_time: [22],
      popularity: 82.4
    }
  ];

  const mockGenres = [
    { id: 28, name: 'Ação' },
    { id: 35, name: 'Comédia' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Terror' },
    { id: 878, name: 'Ficção Científica' },
    { id: 53, name: 'Thriller' },
    { id: 80, name: 'Crime' },
    { id: 14, name: 'Fantasia' },
    { id: 10759, name: 'Ação & Aventura' }
  ];

  // Carregar gêneros da API
  const loadGenres = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${contentType}/list?api_key=${API_KEY}&language=pt-BR`);
      const data = await response.json();
      setGenres(data.genres || mockGenres);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      setGenres(mockGenres);
    }
  }, [contentType]);

  // Carregar conteúdo da API
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = contentType === 'movie' 
        ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`
        : `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.results) {
        const normalizedContent = data.results.map(item => ({
          ...item,
          title: item.title || item.name,
          type: contentType,
        }));
        
        setContent(normalizedContent);
        generateRecommendations(normalizedContent);
      } else {
        const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
        setContent(currentContent);
        generateRecommendations(currentContent);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      setError('Falha ao carregar conteúdo. Verifique sua conexão ou tente novamente mais tarde.');
      const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
      setContent(currentContent);
      generateRecommendations(currentContent);
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  useEffect(() => {
    loadContent();
    loadGenres();
  }, [loadContent, loadGenres]);

  // Buscar conteúdo
  const searchContent = useCallback(async (query) => {
    if (!query.trim()) {
      loadContent();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const endpoint = contentType === 'movie' 
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
        : `${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.results) {
        const normalizedResults = data.results.map(item => ({
          ...item,
          title: item.title || item.name,
          type: contentType,
        }));
        setContent(normalizedResults);
      } else {
        setContent([]);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setError('Falha ao buscar conteúdo. Verifique sua conexão.');
      const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
      const filtered = currentContent.filter(item =>
        (item.title || item.name).toLowerCase().includes(query.toLowerCase())
      );
      setContent(filtered);
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
      const endpoint = contentType === 'movie' 
        ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}`
        : `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.results) {
        const normalizedResults = data.results.map(item => ({
          ...item,
          title: item.title || item.name,
          type: contentType,
        }));
        setContent(normalizedResults);
      } else {
        setContent([]);
      }
    } catch (error) {
      console.error('Erro ao filtrar por gênero:', error);
      setError('Falha ao filtrar conteúdo. Verifique sua conexão.');
      const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
      const filtered = currentContent.filter(item =>
        item.genre_ids.includes(parseInt(genreId))
      );
      setContent(filtered);
    } finally {
      setLoading(false);
    }
  }, [contentType, loadContent]);

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

  // Gerar recomendações
  const generateRecommendations = useCallback((currentContent = content) => {
    const userPreferences = [...favorites];
    const highRatedContent = Object.entries(ratings)
      .filter(([_, rating]) => rating >= 4)
      .map(([itemId, _]) => parseInt(itemId));
    
    const allPreferred = [...userPreferences, ...highRatedContent];
    
    if (allPreferred.length === 0) {
      setRecommendations(currentContent.slice(0, 4));
      return;
    }

    // Encontrar gêneros preferidos
    const preferredGenres = [];
    allPreferred.forEach(id => {
      const item = currentContent.find(c => c.id === parseInt(id));
      if (item) {
        preferredGenres.push(...item.genre_ids);
      }
    });

    // Contar ocorrências de cada gênero
    const genreCounts = preferredGenres.reduce((acc, genreId) => {
      acc[genreId] = (acc[genreId] || 0) + 1;
      return acc;
    }, {});

    // Ordenar gêneros por preferência
    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genreId]) => parseInt(genreId));

    // Gerar recomendações baseadas nos gêneros preferidos
    const recommended = currentContent
      .filter(item => !allPreferred.includes(item.id))
      .sort((a, b) => {
        // Pontuar cada item baseado na correspondência com gêneros preferidos
        const scoreA = a.genre_ids.reduce((sum, genreId) => 
          sum + (sortedGenres.includes(genreId) ? sortedGenres.indexOf(genreId) + 1 : 0), 0);
        const scoreB = b.genre_ids.reduce((sum, genreId) => 
          sum + (sortedGenres.includes(genreId) ? sortedGenres.indexOf(genreId) + 1 : 0), 0);
        
        return scoreB - scoreA || b.vote_average - a.vote_average;
      })
      .slice(0, 4);

    setRecommendations(recommended);
  }, [content, favorites, ratings]);

  useEffect(() => {
    generateRecommendations();
  }, [favorites, ratings, contentType, generateRecommendations]);

  // Ordenar conteúdo
  const sortContent = useCallback((items) => {
    if (!items) return [];
    
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'newest':
          return new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date);
        case 'oldest':
          return new Date(a.release_date || a.first_air_date) - new Date(b.release_date || b.first_air_date);
        default:
          return 0;
      }
    });
  }, [sortBy]);

  // Handlers
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
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
    setShowFilters(false);
  };

  // Componente de avaliação por estrelas
  const StarRating = React.memo(({ itemId, currentRating = 0, interactive = true, size = 'md' }) => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizes[size]} ${interactive ? 'cursor-pointer' : ''} transition-colors ${
              star <= (ratings[itemId] || currentRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => interactive && rateContent(itemId, star)}
          />
        ))}
      </div>
    );
  });

  // Componente de card de conteúdo
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
        <div className="relative">
          {/* Imagem de fundo com gradiente */}
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
                className="flex items-center gap-2 px-3 py-1 bg-white/90 text-gray-800 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                <Play className="w-4 h-4" />
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1">{title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.overview}</p>
          
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
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
              <span className="text-xs text-blue-600 font-medium">{genreNames}</span>
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

  // Componente de item de lista
  const ContentListItem = React.memo(({ item }) => {
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const genreNames = item.genre_ids
      ?.map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    return (
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex"
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
            <h3 className="font-bold text-lg">{title}</h3>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(item.id);
                }}
                className={`p-1 rounded-full transition-colors ${
                  watchlist.includes(item.id) ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
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
                  favorites.includes(item.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span>{new Date(releaseDate).getFullYear()}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{item.overview}</p>
          
          {genreNames && (
            <div className="mt-auto pt-2">
              <span className="text-xs text-blue-600 font-medium">{genreNames}</span>
            </div>
          )}
        </div>
      </div>
    );
  });

  // Modal de detalhes
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Cabeçalho com imagem de fundo */}
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
                <div className="w-24 h-36 bg-white rounded-lg shadow-md flex-shrink-0 relative overflow-hidden">
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
          
          {/* Corpo do modal */}
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
                        watchlist.includes(item.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${watchlist.includes(item.id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.includes(item.id) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3">Sinopse</h3>
                <p className="text-gray-700 mb-6">{item.overview || 'Sinopse não disponível.'}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Tipo</h4>
                    <p className="font-medium">{item.type === 'movie' ? 'Filme' : 'Série'}</p>
                  </div>
                  
                  {genreNames && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-1">Gêneros</h4>
                      <p className="font-medium">{genreNames}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">
                      {item.type === 'movie' ? 'Data de Lançamento' : 'Estreia'}
                    </h4>
                    <p className="font-medium">
                      {new Date(releaseDate).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">
                      {item.type === 'movie' ? 'Duração' : 'Duração por episódio'}
                    </h4>
                    <p className="font-medium">
                      {item.type === 'movie' 
                        ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}min`
                        : `${item.episode_run_time?.[0] || 45} minutos`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-64 flex-shrink-0">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-3">Avalie este {item.type === 'movie' ? 'filme' : 'série'}</h3>
                  <div className="flex justify-center mb-4">
                    <StarRating itemId={item.id} size="lg" />
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Estatísticas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Popularidade</span>
                        <span className="font-medium">{item.popularity?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avaliação média</span>
                        <span className="font-medium">{item.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total de votos</span>
                        <span className="font-medium">{item.vote_count || 'N/A'}</span>
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

  // Obter conteúdo atual baseado na aba ativa
  const getCurrentContent = () => {
    let currentContent = [];
    
    switch (activeTab) {
      case 'favorites':
        currentContent = content.filter(item => favorites.includes(item.id));
        break;
      case 'watchlist':
        currentContent = content.filter(item => watchlist.includes(item.id));
        break;
      case 'recommendations':
        currentContent = recommendations;
        break;
      default:
        currentContent = content;
    }

    // Ordenar conforme seleção
    return sortContent(currentContent);
  };

  // Renderização principal
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 bg-white shadow z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">FlemBox</h1>
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
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleContentTypeChange('movie')}
              className={`p-2 rounded-full transition-colors ${contentType === 'movie' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white'}`}
              aria-label="Filmes"
            >
              <Film className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleContentTypeChange('tv')}
              className={`p-2 rounded-full transition-colors ${contentType === 'tv' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-500 hover:text-white'}`}
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
              activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
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
                className="w-full pl-10 pr-8 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                className="w-full pl-4 pr-8 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                className="w-full pl-4 pr-8 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded mb-6">
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
              <div className="text-center py-20 text-gray-500">
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
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Flembox. Todos os direitos reservados.
          </p>
        </div>
        <p className="text-gray-600 text-sm mt-2 text-center w-full">
            Desenvolvido por <a href="https://instagram.com/devmxs" className="hover:text-blue-700 font-semibold transition">DEVMXS</a>
          </p>
      </footer>
      
    </div>
  );
};

export default MovieTVRecommendationSystem;