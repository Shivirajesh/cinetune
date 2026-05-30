import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

function isInWatchlist(id) {
    const list = JSON.parse(localStorage.getItem('cinetune_watchlist') || '[]')
    return list.some(item => item.id === id)
}

function toggleWatchlist(movie) {
    const list = JSON.parse(localStorage.getItem('cinetune_watchlist') || '[]')
    const exists = list.some(item => item.id === movie.id)
    const updated = exists
        ? list.filter(item => item.id !== movie.id)
        : [movie, ...list]
    localStorage.setItem('cinetune_watchlist', JSON.stringify(updated))
    return !exists
}

export default function MovieCard({ movie, index, onClick }) {
    const posterUrl = movie.poster_path
        ? TMDB_IMAGE_BASE + movie.poster_path
        : movie.poster_url || null

    const [hovered, setHovered] = useState(false)
    const [liked, setLiked] = useState(() => isInWatchlist(movie.id))
    const [showToast, setShowToast] = useState(false)
    const [toastMsg, setToastMsg] = useState('')

    const handleHeart = (e) => {
        e.stopPropagation() // don't open modal
        const added = toggleWatchlist(movie)
        setLiked(added)
        setToastMsg(added ? 'Added to Watchlist ❤️' : 'Removed from Watchlist')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
        window.dispatchEvent(new Event('watchlist_updated'))
    }

    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                background: 'rgba(20,5,5,0.8)',
                border: '1px solid rgba(139,0,0,0.2)',
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                position: 'relative',
            }}
        >
            {/* toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: 'absolute',
                            top: 8, left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(139,0,0,0.4)',
                            borderRadius: 999,
                            padding: '4px 12px',
                            fontSize: 10,
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                        }}
                    >
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* poster */}
            <div style={{ position: 'relative', aspectRatio: '2/3', background: '#1a0000' }}>
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 40
                    }}>
                        🎬
                    </div>
                )}

                {/* heart button — shows on hover */}
                <AnimatePresence>
                    {hovered && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            onClick={handleHeart}
                            style={{
                                position: 'absolute',
                                bottom: 10, right: 10,
                                width: 32, height: 32,
                                borderRadius: '50%',
                                background: liked
                                    ? 'rgba(180,0,0,0.9)'
                                    : 'rgba(0,0,0,0.7)',
                                border: liked
                                    ? '1px solid rgba(255,80,80,0.6)'
                                    : '1px solid rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: 14,
                                zIndex: 5,
                            }}
                        >
                            {liked ? '❤️' : '🤍'}
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* match score badge */}
                {movie.match_score && (
                    <div style={{
                        position: 'absolute',
                        top: 10, right: 10,
                        background: 'rgba(139,0,0,0.85)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: 999,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#fff',
                    }}>
                        {movie.match_score}% match
                    </div>
                )}
            </div>

            {/* info */}
            <div style={{ padding: '12px 14px' }}>
                <p style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {movie.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        {movie.genres?.split(' ').slice(0, 2).join(' · ')}
                    </span>
                    <span style={{ fontSize: 11, color: '#ff4444', fontWeight: 600 }}>
                        ⭐ {movie.rating}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}