import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Star, Heart, Filter, X, Play, Tv, Film, Calendar, Clock, 
  Popcorn, Clapperboard, List, Home, ThumbsUp, Award, Sparkles, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MovieTVRecommendationSystem = () => {
  // Estados
  const [content, setContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [contentType, setContentType] = useState('movie');
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Configurações da API
  const API_KEY = '4e44d9029b1270a757cddc766a1bcb63'; // Exemplo - use sua própria chave
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

  // Dados mock para fallback
  const mockData = {
    movies: [
      {
        id: 1,
        title: 'Inception',
        overview: 'Um ladrão que rouba segredos corporativos através da tecnologia de compartilhamento de sonhos...',
        poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdrop_path: '/8riQbqi8gWXob3W7ap3hZtbT5Xb.jpg',
        vote_average: 8.8,
        release_date: '2010-07-16',
        genre_ids: [28, 878, 53],
        type: 'movie',
        runtime: 148
      },
      // ... outros filmes mock
    ],
    tvShows: [
      {
        id: 101,
        name: 'Breaking Bad',
        overview: 'Um professor de química do ensino médio diagnosticado com câncer de pulmão inoperável...',
        poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
        vote_average: 9.5,
        first_air_date: '2008-01-20',
        genre_ids: [18, 80],
        type: 'tv',
        number_of_seasons: 5,
        number_of_episodes: 62,
        episode_run_time: [47]
      },
      // ... outras séries mock
    ],
    genres: [
      { id: 28, name: 'Ação' },
      { id: 35, name: 'Comédia' },
      // ... outros gêneros
    ]
  };

  // Efeito para verificar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    
    // Carregar favoritos do localStorage
    const savedFavorites = localStorage.getItem('tmdbFavorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    const savedRatings = localStorage.getItem('tmdbRatings');
    if (savedRatings) setRatings(JSON.parse(savedRatings));
  }, []);

  // Carregar dados quando o tipo de conteúdo muda
  useEffect(() => {
    loadGenres();
    loadContent();
    loadAdditionalContent();
  }, [contentType]);

  // Salvar favoritos e avaliações no localStorage
  useEffect(() => {
    localStorage.setItem('tmdbFavorites', JSON.stringify(favorites));
    localStorage.setItem('tmdbRatings', JSON.stringify(ratings));
    generateRecommendations();
  }, [favorites, ratings]);

  // Carregar dados iniciais
  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadGenres(),
        loadContent(),
        loadAdditionalContent()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      // Fallback para dados mock
      setGenres(mockData.genres);
      setContent(contentType === 'movie' ? mockData.movies : mockData.tvShows);
    }
  };

  // Carregar gêneros
  const loadGenres = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${contentType}/list?api_key=${API_KEY}&language=pt-BR`);
      const data = await response.json();
      setGenres(data.genres || mockData.genres);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      setGenres(mockData.genres);
    }
  };

  // Carregar conteúdo principal
  const loadContent = async () => {
    setLoading(true);
    try {
      const endpoint = contentType === 'movie' 
        ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`
        : `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setContent(data.results?.map(normalizeContent) || mockContent());
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      setContent(mockContent());
    } finally {
      setLoading(false);
    }
  };

  // Carregar conteúdo adicional (em destaque, mais votados, etc.)
  const loadAdditionalContent = async () => {
    try {
      if (contentType === 'movie') {
        const [trendingRes, topRatedRes, nowPlayingRes] = await Promise.all([
          fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=pt-BR`),
          fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=pt-BR&page=1`),
          fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&page=1`)
        ]);
        
        setTrending((await trendingRes.json()).results?.map(normalizeContent) || []);
        setTopRated((await topRatedRes.json()).results?.map(normalizeContent) || []);
        setNowPlaying((await nowPlayingRes.json()).results?.map(normalizeContent) || []);
      } else {
        const [trendingRes, topRatedRes] = await Promise.all([
          fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=pt-BR`),
          fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=pt-BR&page=1`)
        ]);
        
        setTrending((await trendingRes.json()).results?.map(normalizeContent) || []);
        setTopRated((await topRatedRes.json()).results?.map(normalizeContent) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo adicional:', error);
    }
  };

  // Normalizar estrutura do conteúdo
  const normalizeContent = (item) => ({
    ...item,
    title: item.title || item.name,
    type: contentType,
    backdrop_path: item.backdrop_path || `/placeholder-${Math.floor(Math.random() * 5) + 1}.jpg`
  });

  // Fallback para conteúdo mock
  const mockContent = () => contentType === 'movie' 
    ? mockData.movies.map(normalizeContent) 
    : mockData.tvShows.map(normalizeContent);

  // Buscar conteúdo
  const searchContent = async (query) => {
    if (!query.trim()) {
      loadContent();
      return;
    }
    
    setLoading(true);
    try {
      const endpoint = contentType === 'movie' 
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`
        : `${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setContent(data.results?.map(normalizeContent) || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      // Busca local nos dados mock
      const currentContent = contentType === 'movie' ? mockData.movies : mockData.tvShows;
      const filtered = currentContent.filter(item =>
        (item.title || item.name).toLowerCase().includes(query.toLowerCase())
      );
      setContent(filtered.map(normalizeContent));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por gênero
  const filterByGenre = async (genreId) => {
    if (!genreId) {
      loadContent();
      return;
    }
    
    setLoading(true);
    try {
      const endpoint = contentType === 'movie' 
        ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}`
        : `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setContent(data.results?.map(normalizeContent) || []);
    } catch (error) {
      console.error('Erro ao filtrar por gênero:', error);
      // Filtro local
      const currentContent = contentType === 'movie' ? mockData.movies : mockData.tvShows;
      const filtered = currentContent
        .filter(item => item.genre_ids?.includes(parseInt(genreId)))
        .map(normalizeContent);
      setContent(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Gerenciar favoritos
  const toggleFavorite = useCallback((itemId) => {
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Avaliar conteúdo
  const rateContent = useCallback((itemId, rating) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
  }, []);

  // Gerar recomendações baseadas nos favoritos e avaliações
  const generateRecommendations = useCallback(() => {
    const userPreferences = [...favorites];
    const highRatedContent = Object.entries(ratings)
      .filter(([_, rating]) => rating >= 4)
      .map(([itemId]) => parseInt(itemId));
    
    const allPreferred = [...new Set([...userPreferences, ...highRatedContent])];
    
    if (allPreferred.length === 0) {
      setRecommendations((contentType === 'movie' ? mockData.movies : mockData.tvShows)
        .slice(0, 4)
        .map(normalizeContent));
      return;
    }

    // Simular recomendações baseadas em gêneros preferidos
    const preferredGenres = [];
    allPreferred.forEach(id => {
      const item = [...mockData.movies, ...mockData.tvShows].find(i => i.id === id);
      if (item) preferredGenres.push(...(item.genre_ids || []));
    });
    
    const genreCounts = preferredGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => parseInt(genre));
    
    const recommended = (contentType === 'movie' ? mockData.movies : mockData.tvShows)
      .filter(item => 
        !allPreferred.includes(item.id) &&
        item.genre_ids?.some(genre => topGenres.includes(genre))
      )
      .slice(0, 4)
      .map(normalizeContent);
    
    setRecommendations(recommended.length > 0 ? recommended : 
      (contentType === 'movie' ? mockData.movies : mockData.tvShows)
        .slice(0, 4)
        .map(normalizeContent));
  }, [favorites, ratings, contentType]);

  // Manipuladores de eventos
  const handleSearch = (e) => {
    if (e.key === 'Enter') searchContent(searchTerm);
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

  // Componente de avaliação por estrelas
  const StarRating = React.memo(({ itemId, currentRating = 0, interactive = true, size = 'md' }) => {
    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizes[size]} ${interactive ? 'cursor-pointer' : ''} transition-colors ${
              star <= (ratings[itemId] || currentRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={interactive ? () => rateContent(itemId, star) : undefined}
          />
        ))}
      </div>
    );
  });

  // Componente de card de conteúdo
  const ContentCard = React.memo(({ item, variant = 'default' }) => {
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const isFavorite = favorites.includes(item.id);
    
    const genreNames = useMemo(() => 
      item.genre_ids
        ?.map(id => genres.find(g => g.id === id)?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join(', '), 
      [item.genre_ids, genres]
    );

    const formatDuration = useMemo(() => {
      if (item.type === 'movie') {
        return item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}min` : 'Duração desconhecida';
      } else {
        const avgRuntime = item.episode_run_time?.[0] || 45;
        return `${item.number_of_seasons || '?'} temporada${item.number_of_seasons > 1 ? 's' : ''} • ${avgRuntime}min/ep`;
      }
    }, [item]);

    const imageSize = variant === 'featured' ? 'w500' : 'w300';
    const imageUrl = item.poster_path 
      ? `${IMAGE_BASE_URL}${imageSize}${item.poster_path}`
      : `/placeholder-${Math.floor(Math.random() * 5) + 1}.jpg`;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
          variant === 'featured' ? 'featured-card' : 'transform hover:-translate-y-1'
        }`}
      >
        <div className="relative">
          <div className={`${variant === 'featured' ? 'h-80' : 'h-64'} bg-gradient-to-br from-purple-400 to-blue-500 relative overflow-hidden`}>
            <img 
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
              loading="lazy"
              onError={(e) => {
                e.target.src = `/placeholder-${Math.floor(Math.random() * 5) + 1}.jpg`;
              }}
            />
            
            <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-white ${
              item.type === 'movie' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {item.type === 'movie' ? 'FILME' : 'SÉRIE'}
            </div>
            
            <button
              onClick={() => toggleFavorite(item.id)}
              className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
              ★ {item.vote_average?.toFixed(1) || 'N/A'}
            </div>
            
            {variant === 'featured' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <div>
                  <h3 className="font-bold text-xl text-white mb-1">{title}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <span>{new Date(releaseDate).getFullYear()}</span>
                    <span>•</span>
                    <span>{genreNames}</span>
                  </div>
                  <button
                    onClick={() => setSelectedContent(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Ver detalhes</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {variant !== 'featured' && (
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-1">{title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.overview || 'Descrição não disponível.'}</p>
              
              <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration}</span>
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
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  Detalhes
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  });

  // Modal de detalhes do conteúdo
  const ContentModal = ({ item, onClose }) => {
    if (!item) return null;

    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const isFavorite = favorites.includes(item.id);

    // Corrigido: cálculo direto, sem useMemo
    const genreNames = item.genre_ids
      ?.map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const backdropUrl = item.backdrop_path 
      ? `${IMAGE_BASE_URL}w1280${item.backdrop_path}`
      : `/placeholder-large-${Math.floor(Math.random() * 3) + 1}.jpg`;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        >
          <div className="relative h-96">
            <img 
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                e.target.src = `/placeholder-large-${Math.floor(Math.random() * 3) + 1}.jpg`;
              }}
            />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className={`absolute top-4 left-4 px-3 py-1 rounded text-sm font-semibold text-white ${
              item.type === 'movie' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {item.type === 'movie' ? 'FILME' : 'SÉRIE'}
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">{title}</h2>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  {releaseDate && (
                    <span>{new Date(releaseDate).toLocaleDateString('pt-BR')}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {item.vote_average?.toFixed(1) || 'N/A'}
                  </span>
                  {item.type === 'tv' && (
                    <>
                      <span>{item.number_of_seasons || '?'} temporada{item.number_of_seasons > 1 ? 's' : ''}</span>
                      <span>{item.number_of_episodes || '?'} episódios</span>
                    </>
                  )}
                  {item.runtime && item.type === 'movie' && (
                    <span>{Math.floor(item.runtime / 60)}h {item.runtime % 60}min</span>
                  )}
                </div>
                
                {genreNames && (
                  <div className="mb-4">
                    <span className="text-sm text-blue-600 font-medium">{genreNames}</span>
                  </div>
                )}
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {item.overview || 'Descrição não disponível.'}
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                </button>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <Play className="w-5 h-5" />
                  {item.type === 'movie' ? 'Assistir Trailer' : 'Ver Trailer'}
                </button>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Sua Avaliação</h3>
              <div className="flex items-center gap-4">
                <StarRating itemId={item.id} size="lg" />
                <span className="text-gray-600">
                  {ratings[item.id] ? `Você avaliou com ${ratings[item.id]} estrelas` : 'Avalie este conteúdo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Obter conteúdo atual baseado na aba ativa
  const getCurrentContent = useMemo(() => {
    switch (activeTab) {
      case 'favorites':
        return content.filter(item => favorites.includes(item.id));
      case 'recommendations':
        return recommendations;
      default:
        return content;
    }
  }, [activeTab, content, favorites, recommendations]);

  // Seções de conteúdo
  const contentSections = [
    {
      id: 'trending',
      title: `${contentType === 'movie' ? 'Filmes' : 'Séries'} em Alta`,
      icon: <Sparkles className="w-5 h-5" />,
      items: trending.slice(0, 5)
    },
    {
      id: 'top-rated',
      title: `${contentType === 'movie' ? 'Filmes' : 'Séries'} Mais Votados`,
      icon: <Award className="w-5 h-5" />,
      items: topRated.slice(0, 5)
    },
    ...(contentType === 'movie' ? [{
      id: 'now-playing',
      title: 'Nos Cinemas',
      icon: <Clapperboard className="w-5 h-5" />,
      items: nowPlaying.slice(0, 5)
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <header className={`fixed top-0 left-0 right-0 bg-white shadow-sm z-40 transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-md' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Popcorn className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Movie<span className="text-blue-500">Finder</span>
              </h1>
            </div>
            
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Buscar ${contentType === 'movie' ? 'filmes...' : 'séries...'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleContentTypeChange('movie')}
                className={`p-2 rounded-full transition-colors ${
                  contentType === 'movie'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Filmes"
              >
                <Film className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleContentTypeChange('tv')}
                className={`p-2 rounded-full transition-colors ${
                  contentType === 'tv'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Séries"
              >
                <Tv className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Navegação */}
        <nav className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'discover', label: 'Descobrir', icon: <Home className="w-4 h-4" /> },
            { id: 'favorites', label: 'Favoritos', icon: <Heart className="w-4 h-4" /> },
            { id: 'recommendations', label: 'Recomendados', icon: <ThumbsUp className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Filtros (apenas na aba Descobrir) */}
        {activeTab === 'discover' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todos os gêneros</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Conteúdo */}
        {!loading && (
          <div>
            {/* Seções especiais apenas na aba Descobrir */}
            {activeTab === 'discover' && (
              <>
                {contentSections.map(section => (
                  <section key={section.id} className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                      {section.icon}
                      <h2 className="text-xl font-bold">{section.title}</h2>
                    </div>
                    
                    {section.items.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {section.items.map(item => (
                          <ContentCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum conteúdo disponível nesta seção.
                      </div>
                    )}
                  </section>
                ))}
                
                <div className="flex items-center gap-2 mb-4">
                  <List className="w-5 h-5" />
                  <h2 className="text-xl font-bold">
                    {searchTerm 
                      ? `Resultados para "${searchTerm}"` 
                      : `${contentType === 'movie' ? 'Filmes' : 'Séries'} Populares`}
                  </h2>
                </div>
              </>
            )}
            
            {/* Conteúdo principal */}
            {getCurrentContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {getCurrentContent.map(item => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20">
                {activeTab === 'favorites' ? (
                  <>
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Você ainda não tem {contentType === 'movie' ? 'filmes' : 'séries'} favoritos.
                    </p>
                    <p className="text-gray-400 mt-2">Clique no ícone de coração para adicionar!</p>
                  </>
                ) : activeTab === 'recommendations' ? (
                  <>
                    <ThumbsUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Adicione alguns favoritos ou avalie conteúdos para receber recomendações personalizadas!
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-lg">
                    Nenhum {contentType === 'movie' ? 'filme' : 'série'} encontrado.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {selectedContent && (
          <ContentModal 
            item={selectedContent} 
            onClose={() => setSelectedContent(null)} 
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Popcorn className="w-6 h-6" />
                MovieFinder
              </h3>
              <p className="text-gray-300">
                Descubra os melhores filmes e séries com recomendações personalizadas baseadas em seus gostos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Tecnologias</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Tailwind CSS</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">TMDB API</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">Framer Motion</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} MovieFinder. Todos os direitos reservados.</p>
            <p className="mt-1 text-sm">Este produto usa a API TMDB mas não é endossado ou certificado pelo TMDB.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MovieTVRecommendationSystem;