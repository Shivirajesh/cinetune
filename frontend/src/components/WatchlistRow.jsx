import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import MovieCard from './MovieCard'

export default function WatchlistRow({ onCardClick }) {
    const [watchlist, setWatchlist] = useState([])

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('cinetune_watchlist') || '[]')
        setWatchlist(stored)
    }, [])

    if (watchlist.length === 0) return null

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 48 }}>

            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    My Watchlist
                </h2>
                <span style={{
                    fontSize: 10, padding: '2px 8px',
                    background: 'rgba(139,0,0,0.3)',
                    border: '1px solid rgba(139,0,0,0.5)',
                    borderRadius: 999, color: '#ff4444', fontWeight: 600
                }}>
                    {watchlist.length} saved
                </span>
            </div>

            {/* horizontal scroll row — same size as trending */}
            <div style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                paddingBottom: 8,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}>
                {watchlist.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            width: 'calc(100% / 6 - 10px)',
                            minWidth: 120,
                            maxWidth: 160,
                            flexShrink: 0,
                        }}
                    >
                        <MovieCard
                            movie={item}
                            index={i}
                            onClick={() => onCardClick(item)}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}