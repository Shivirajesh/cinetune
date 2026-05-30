import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import DetailModal from '../components/DetailModal'
import TrendingRow from '../components/TrendingRow'
import WatchlistRow from '../components/WatchlistRow'
import BecauseYouLiked from '../components/BecauseYouLiked'

const API = 'http://localhost:5001'

const suggestions = {
  all: [
    'movies like Inception',
    'thriller movies',
    'series like Breaking Bad',
    'horror series',
    'action movies',
    'crime series',
  ],
  movies: [
    'movies like Inception',
    'thriller movies',
    'movies like Interstellar',
    'horror movies',
    'action movies',
    'romantic movies',
  ],
  series: [
    'series like Breaking Bad',
    'horror series',
    'series like Stranger Things',
    'crime series',
    'series like Game of Thrones',
    'drama series',
  ],
}

const tabs = ['all', 'movies', 'series']

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [resultType, setResultType] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [watchlistUpdated, setWatchlistUpdated] = useState(0)
  const [searchHistory, setSearchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('cinetune_history') || '[]')
  })

  const isMobile = useIsMobile()

  useEffect(() => {
    const refresh = () => setWatchlistUpdated(n => n + 1)
    window.addEventListener('watchlist_updated', refresh)
    return () => window.removeEventListener('watchlist_updated', refresh)
  }, [])

  const handleCardClick = (item) => {
    setSelectedItem(item)
  }

  const handleSearch = async (q) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) return

    const updated = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 4)
    setSearchHistory(updated)
    localStorage.setItem('cinetune_history', JSON.stringify(updated))

    setLoading(true)
    setSearched(true)
    setResults([])

    try {
      const res = await axios.post(`${API}/api/search`, {
        query: searchQuery,
        tab: activeTab
      })
      setResults(res.data.results)
      setResultType(res.data.type)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (s) => {
    setQuery(s)
    handleSearch(s)
  }

  const getResultLabel = () => {
    if (resultType.includes('series')) return `Found ${results.length} series recommendations`
    if (resultType.includes('movie')) return `Found ${results.length} movie recommendations`
    return `Found ${results.length} recommendations`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #3b0000 0%, #1a0000 30%, #0a0a0a 70%)',
      paddingBottom: 60,
    }}>

      {/* navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '14px 20px' : '20px 40px',
          borderBottom: '1px solid rgba(139,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10,5,5,0.7)',
        }}
      >
        <h1 style={{
          fontSize: isMobile ? 18 : 22,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ff4444, #cc0000)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🎬 CineTune
        </h1>
        {!isMobile && (
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Movies & Series, tuned to your taste
          </span>
        )}
      </motion.nav>

      {/* hero */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '36px 16px 28px' : '60px 20px 40px',
      }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: isMobile ? 24 : 38,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 10,
            lineHeight: 1.3,
            padding: isMobile ? '0 8px' : 0,
          }}
        >
          What are you in the mood for?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: isMobile ? 13 : 15,
            marginBottom: isMobile ? 20 : 28,
            textAlign: 'center',
            padding: isMobile ? '0 16px' : 0,
          }}
        >
          Try "movies like Inception" or "series like Breaking Bad"
        </motion.p>

        {/* tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: isMobile ? 6 : 8, marginBottom: isMobile ? 16 : 24 }}
        >
          {tabs.map(tab => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: isMobile ? '6px 14px' : '8px 22px',
                borderRadius: 999,
                border: activeTab === tab
                  ? '1px solid rgba(200,0,0,0.7)'
                  : '1px solid rgba(255,255,255,0.1)',
                background: activeTab === tab
                  ? 'rgba(139,0,0,0.35)'
                  : 'rgba(255,255,255,0.05)',
                color: activeTab === tab ? '#ff4444' : 'rgba(255,255,255,0.5)',
                fontSize: isMobile ? 11 : 13,
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'all' ? '✨ All' : tab === 'movies' ? '🎬 Movies' : '📺 Series'}
            </motion.button>
          ))}
        </motion.div>

        {/* search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 8 : 12,
            width: '100%',
            maxWidth: 620,
            padding: isMobile ? '0 16px' : 0,
          }}
        >
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={
              activeTab === 'series'
                ? 'Try "series like Breaking Bad"...'
                : activeTab === 'movies'
                  ? 'Try "movies like Inception"...'
                  : 'Search movies, series, genres...'
            }
            style={{
              flex: 1,
              padding: isMobile ? '14px 18px' : '16px 22px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(139,0,0,0.4)',
              borderRadius: 14,
              color: '#fff',
              fontSize: isMobile ? 14 : 15,
              outline: 'none',
              backdropFilter: 'blur(10px)',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(200,0,0,0.8)'}
            onBlur={e => e.target.style.borderColor = 'rgba(139,0,0,0.4)'}
          />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSearch()}
            style={{
              padding: isMobile ? '14px' : '16px 28px',
              background: 'linear-gradient(135deg, #cc0000, #8b0000)',
              border: 'none',
              borderRadius: 14,
              color: '#fff',
              fontSize: isMobile ? 14 : 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(139,0,0,0.4)',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            Search
          </motion.button>
        </motion.div>

        {/* suggestion chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? 8 : 10,
            marginTop: isMobile ? 14 : 20,
            justifyContent: 'center',
            maxWidth: 620,
            padding: isMobile ? '0 16px' : 0,
          }}
        >
          {suggestions[activeTab].map((s, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSuggestion(s)}
              style={{
                padding: isMobile ? '6px 12px' : '8px 16px',
                background: 'rgba(139,0,0,0.15)',
                border: '1px solid rgba(139,0,0,0.3)',
                borderRadius: 999,
                color: 'rgba(255,255,255,0.7)',
                fontSize: isMobile ? 11 : 13,
                cursor: 'pointer',
              }}
            >
              {s}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* search history chips */}
      {searchHistory.length > 0 && !searched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 12,
            justifyContent: 'center',
            maxWidth: 620,
            margin: '0 auto 16px',
            padding: isMobile ? '0 16px' : 0,
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Recent:</span>
          {searchHistory.map((h, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSuggestion(h)}
              style={{
                padding: '5px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999,
                color: 'rgba(255,255,255,0.45)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🕐 {h}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setSearchHistory([])
              localStorage.removeItem('cinetune_history')
            }}
            style={{
              padding: '5px 10px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.2)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            clear
          </motion.button>
        </motion.div>
      )}

      {/* trending, watchlist, because you liked */}
      {!searched && (
        <>
          <TrendingRow onCardClick={handleCardClick} />
          <WatchlistRow
            key={watchlistUpdated}
            onCardClick={handleCardClick}
          />
          <BecauseYouLiked
            onCardClick={handleCardClick}
            watchlistUpdated={watchlistUpdated}
          />
        </>
      )}

      {/* results */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>

        {/* back to home */}
        {searched && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSearched(false)
              setResults([])
              setQuery('')
              setResultType('')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
              padding: '8px 18px',
              background: 'rgba(139,0,0,0.15)',
              border: '1px solid rgba(139,0,0,0.3)',
              borderRadius: 999,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Back to Home
          </motion.button>
        )}

        {/* skeletons */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(auto-fill, minmax(130px, 1fr))'
              : 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: isMobile ? 12 : 20,
          }}>
            {Array(12).fill(0).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.05 }}
                style={{
                  height: isMobile ? 200 : 280,
                  background: 'rgba(139,0,0,0.1)',
                  borderRadius: 14,
                  border: '1px solid rgba(139,0,0,0.15)',
                }}
              />
            ))}
          </div>
        )}

        {/* result label */}
        {!loading && searched && results.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 20 }}
          >
            {getResultLabel()}
          </motion.p>
        )}

        {/* cards grid */}
        <AnimatePresence>
          {!loading && results.length > 0 && (
            <motion.div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(auto-fill, minmax(130px, 1fr))'
                : 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: isMobile ? 12 : 20,
            }}>
              {results.map((item, i) => (
                <MovieCard
                  key={i}
                  movie={item}
                  index={i}
                  onClick={() => handleCardClick(item)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* no results */}
        {!loading && searched && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <p style={{ fontSize: 16 }}>No results found. Try a different search.</p>
          </motion.div>
        )}
      </div>

      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  )
}