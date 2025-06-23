import React, { useState, useEffect } from 'react';
import { Search, Star, Heart, Filter, X, Play, Tv, Film, Calendar, Clock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('discover');
  const [contentType, setContentType] = useState('movie'); // 'movie' ou 'tv'

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
      vote_average: 8.8,
      release_date: '2010-07-16',
      genre_ids: [28, 878, 53],
      type: 'movie',
      runtime: 148
    },
    {
      id: 2,
      title: 'The Matrix',
      overview: 'Um programador de computador descobre que a realidade como ele a conhece não é real...',
      poster_path: '/placeholder2.jpg',
      vote_average: 8.7,
      release_date: '1999-03-31',
      genre_ids: [28, 878],
      type: 'movie',
      runtime: 136
    },
    {
      id: 3,
      title: 'Interstellar',
      overview: 'Um grupo de exploradores faz uso de uma fenda no espaço-tempo recém-descoberta...',
      poster_path: '/placeholder3.jpg',
      vote_average: 8.6,
      release_date: '2014-11-07',
      genre_ids: [18, 878],
      type: 'movie',
      runtime: 169
    },
    {
      id: 4,
      title: 'The Dark Knight',
      overview: 'Quando a ameaça conhecida como Coringa surge de seu passado misterioso...',
      poster_path: '/placeholder4.jpg',
      vote_average: 9.0,
      release_date: '2008-07-18',
      genre_ids: [28, 80, 18],
      type: 'movie',
      runtime: 152
    }
  ];

  const mockTVShows = [
    {
      id: 101,
      name: 'Breaking Bad',
      title: 'Breaking Bad', // Para compatibilidade
      overview: 'Um professor de química do ensino médio diagnosticado com câncer de pulmão inoperável...',
      poster_path: '/placeholder5.jpg',
      vote_average: 9.5,
      first_air_date: '2008-01-20',
      genre_ids: [18, 80],
      type: 'tv',
      number_of_seasons: 5,
      number_of_episodes: 62,
      episode_run_time: [47]
    },
    {
      id: 102,
      name: 'Stranger Things',
      title: 'Stranger Things',
      overview: 'Quando um garoto desaparece, sua mãe, um chefe de polícia e seus amigos devem confrontar...',
      poster_path: '/placeholder6.jpg',
      vote_average: 8.7,
      first_air_date: '2016-07-15',
      genre_ids: [18, 14, 27],
      type: 'tv',
      number_of_seasons: 4,
      number_of_episodes: 42,
      episode_run_time: [50]
    },
    {
      id: 103,
      name: 'Game of Thrones',
      title: 'Game of Thrones',
      overview: 'Nove famílias nobres lutam pelo controle das terras míticas de Westeros...',
      poster_path: '/placeholder7.jpg',
      vote_average: 9.3,
      first_air_date: '2011-04-17',
      genre_ids: [18, 14, 10759],
      type: 'tv',
      number_of_seasons: 8,
      number_of_episodes: 73,
      episode_run_time: [60]
    },
    {
      id: 104,
      name: 'The Office',
      title: 'The Office',
      overview: 'Uma comédia mockumentary sobre um grupo de funcionários de escritório típicos...',
      poster_path: '/placeholder8.jpg',
      vote_average: 8.9,
      first_air_date: '2005-03-24',
      genre_ids: [35],
      type: 'tv',
      number_of_seasons: 9,
      number_of_episodes: 201,
      episode_run_time: [22]
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

  useEffect(() => {
    loadContent();
    loadGenres();
  }, [contentType]);

  // Carregar gêneros da API
  const loadGenres = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genre/${contentType}/list?api_key=${API_KEY}&language=pt-BR`);
      const data = await response.json();
      setGenres(data.genres || mockGenres);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      setGenres(mockGenres);
    }
  };

  // Carregar conteúdo da API
  const loadContent = async () => {
    setLoading(true);
    try {
      const endpoint = contentType === 'movie' 
        ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`
        : `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.results) {
        // Normalizar dados para ter estrutura consistente
        const normalizedContent = data.results.map(item => ({
          ...item,
          title: item.title || item.name, // Para compatibilidade
          type: contentType,
          // Adicionar campos específicos conforme necessário
        }));
        
        setContent(normalizedContent);
        generateRecommendations(normalizedContent);
      } else {
        // Fallback para dados mock
        const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
        setContent(currentContent);
        generateRecommendations(currentContent);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      // Fallback para dados mock
      const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
      setContent(currentContent);
      generateRecommendations(currentContent);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar conteúdo na API
  const searchContent = async (query) => {
    setLoading(true);
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
      // Fallback para busca local nos dados mock
      const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
      const filtered = currentContent.filter(item =>
        (item.title || item.name).toLowerCase().includes(query.toLowerCase())
      );
      setContent(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar por gênero na API
  const filterByGenre = async (genreId) => {
    if (!genreId) {
      loadContent(); // Recarregar conteúdo popular
      return;
    }
    
    setLoading(true);
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
      // Fallback para filtro local
      const currentContent = contentType === 'movie' ? mockMovies : mockTVShows;
      const filtered = currentContent.filter(item =>
        item.genre_ids.includes(parseInt(genreId))
      );
      setContent(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar/remover favoritos
  const toggleFavorite = (itemId) => {
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Avaliar conteúdo
  const rateContent = (itemId, rating) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
  };

  // Gerar recomendações
  const generateRecommendations = (currentContent = content) => {
    const userPreferences = [...favorites];
    const highRatedContent = Object.entries(ratings)
      .filter(([_, rating]) => rating >= 4)
      .map(([itemId, _]) => parseInt(itemId));
    
    const allPreferred = [...userPreferences, ...highRatedContent];
    
    if (allPreferred.length === 0) {
      setRecommendations(currentContent.slice(0, 3));
      return;
    }

    const recommended = currentContent.filter(item => !allPreferred.includes(item.id));
    setRecommendations(recommended.slice(0, 3));
  };

  useEffect(() => {
    generateRecommendations();
  }, [favorites, ratings, contentType]);

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
  };

  const StarRating = ({ itemId, currentRating = 0 }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer transition-colors ${
              star <= (ratings[itemId] || currentRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => rateContent(itemId, star)}
          />
        ))}
      </div>
    );
  };

  const ContentCard = ({ item }) => {
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative">
          <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
            {item.poster_path ? (
              <img 
                src={`${IMAGE_BASE_URL}${item.poster_path}`}
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
                <Film className="w-16 h-16 text-white opacity-70" />
              ) : (
                <Tv className="w-16 h-16 text-white opacity-70" />
              )}
            </div>
          </div>
          
          <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-white ${
            item.type === 'movie' ? 'bg-blue-600' : 'bg-purple-600'
          }`}>
            {item.type === 'movie' ? 'FILME' : 'SÉRIE'}
          </div>
          
          <button
            onClick={() => toggleFavorite(item.id)}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              favorites.includes(item.id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
          </button>
          
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
            ★ {item.vote_average.toFixed(1)}
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
          
          <div className="mb-3">
            <span className="text-xs text-blue-600 font-medium">{genreNames}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <StarRating itemId={item.id} />
            <button
              onClick={() => setSelectedContent(item)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Detalhes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ContentModal = ({ item, onClose }) => {
    if (!item) return null;

    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
              {item.poster_path ? (
                <img 
                  src={`${IMAGE_BASE_URL}${item.poster_path}`}
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
                  <Film className="w-20 h-20 text-white opacity-70" />
                ) : (
                  <Tv className="w-20 h-20 text-white opacity-70" />
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
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
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>{new Date(releaseDate).getFullYear()}</span>
                  <span>★ {item.vote_average.toFixed(1)}</span>
                </div>
                {item.type === 'tv' && (
                  <div className="text-sm text-gray-600">
                    {item.number_of_seasons} temporada{item.number_of_seasons > 1 ? 's' : ''} • {item.number_of_episodes} episódios
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`p-2 rounded-full transition-colors ${
                  favorites.includes(item.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">{item.overview}</p>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">Sua Avaliação:</span>
                <StarRating itemId={item.id} />
              </div>
              <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                {item.type === 'movie' ? 'Assistir Trailer' : 'Ver Trailer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'favorites':
        return (contentType === 'movie' ? mockMovies : mockTVShows)
          .filter(item => favorites.includes(item.id));
      case 'recommendations':
        return recommendations;
      default:
        return content;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎬 FlemBox
          </h1>
          
          {/* Content Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleContentTypeChange('movie')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                contentType === 'movie'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Film className="w-4 h-4" />
              Filmes
            </button>
            <button
              onClick={() => handleContentTypeChange('tv')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                contentType === 'tv'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Tv className="w-4 h-4" />
              Séries
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-6 mb-6">
            {[
              { id: 'discover', label: 'Descobrir' },
              { id: 'favorites', label: 'Favoritos' },
              { id: 'recommendations', label: 'Recomendações' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Search and Filters */}
          {activeTab === 'discover' && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Buscar ${contentType === 'movie' ? 'filmes' : 'séries'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedGenre}
                  onChange={(e) => handleGenreChange(e.target.value)}
                  className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {activeTab === 'discover' && searchTerm 
                ? `Resultados para "${searchTerm}"` 
                : activeTab === 'discover'
                ? `${contentType === 'movie' ? 'Filmes' : 'Séries'} Populares`
                : activeTab === 'favorites'
                ? `Meus ${contentType === 'movie' ? 'Filmes' : 'Séries'} Favoritos`
                : `${contentType === 'movie' ? 'Filmes' : 'Séries'} Recomendados`
              }
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getCurrentContent().map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
            
            {getCurrentContent().length === 0 && (
              <div className="text-center py-12">
                {activeTab === 'favorites' ? (
                  <>
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Você ainda não tem {contentType === 'movie' ? 'filmes' : 'séries'} favoritos.
                    </p>
                    <p className="text-gray-400">Clique no coração no conteúdo que você gosta!</p>
                  </>
                ) : activeTab === 'recommendations' ? (
                  <>
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Adicione alguns favoritos para receber recomendações!
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

      {/* Content Modal */}
      <ContentModal 
        item={selectedContent} 
        onClose={() => setSelectedContent(null)} 
      />
    </div>
  );
};

export default MovieTVRecommendationSystem;