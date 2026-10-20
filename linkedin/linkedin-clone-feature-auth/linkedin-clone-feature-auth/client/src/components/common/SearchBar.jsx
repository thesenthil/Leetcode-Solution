import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import Avatar from './Avatar';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      const response = await api.get(`/search/users?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.users || []);
    } catch (error) {
      setResults([]);
      if (error.response?.status === 404) {
        setSearchError('Search is not available on the server');
      } else {
        setSearchError(getErrorMessage(error, 'Search failed'));
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleSelect = (userId) => {
    setQuery('');
    setShowResults(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="search-bar">
      <Search size={18} className="search-bar__icon" />
      <input
        type="text"
        className="search-bar__input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="Search people..."
        aria-label="Search people"
      />

      {showResults && (isSearching || results.length > 0 || searchError) && (
        <div className="search-bar__dropdown">
          {isSearching && <p className="search-bar__status">Searching...</p>}
          {searchError && <p className="search-bar__error">{searchError}</p>}
          {!isSearching && !searchError && results.length === 0 && query && (
            <p className="search-bar__status">No results found</p>
          )}
          {results.map((user) => (
            <button
              key={user._id}
              type="button"
              className="search-bar__result"
              onMouseDown={() => handleSelect(user._id)}
            >
              <Avatar
                src={user.profileImage}
                firstName={user.firstName}
                lastName={user.lastName}
                size={40}
              />
              <div className="search-bar__result-info">
                <span className="search-bar__result-name">
                  {user.firstName} {user.lastName}
                </span>
                <span className="search-bar__result-headline">
                  {user.headline || 'LinkedIn Member'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
