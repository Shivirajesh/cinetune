import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import MovieCard from './MovieCard'

const API = 'http://localhost:5001'

export default function BecauseYouLiked({ onCardClick, watchlistUpdated }) {
    const [recommendations, setRecommendations] = useState([])
    const [basedOn, setBasedOn] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('cinetune_watchlist') || '[]')
        if (stored.length === 0) return

        const latest = stored[0]
        setBasedOn(latest)
        setLoading(true)

        axios.post(`${API}/api/search`, {
            query: `${latest.type === 'series' ? 'series' : 'movies'} like ${latest.title}`,
            tab: latest.type === 'series' ? 'series' : 'movies'
        })
            .then(res => {
                const filtered = res.data.results
                    .filter(r => !stored.some(w => w.id === r.id))
                    .slice(0, 6)
                setRecommendations(filtered)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [watchlistUpdated])

    if (!basedOn && !loading) return null

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 48 }}>

            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    Because you liked
                </h2>
                {basedOn && (
                    <span style={{
                        fontSize: 13, color: '#ff4444', fontWeight: 600,
                        background: 'rgba(139,0,0,0.15)',
                        border: '1px solid rgba(139,0,0,0.3)',
                        borderRadius: 999, padding: '2px 12px'
                    }}>
                        {basedOn.title}
                    </span>
                )}
            </div>

            {/* skeletons */}
            {loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: 16
                }}>
                    {Array(6).fill(0).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08 }}
                            style={{
                                height: 230,
                                background: 'rgba(139,0,0,0.1)',
                                borderRadius: 12,
                                border: '1px solid rgba(139,0,0,0.15)'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* cards */}
            {!loading && recommendations.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: 16
                }}>
                    {recommendations.map((item, i) => (
                        <MovieCard
                            key={i}
                            movie={item}
                            index={i}
                            onClick={() => onCardClick(item)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}