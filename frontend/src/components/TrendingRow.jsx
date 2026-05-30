import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = 'http://localhost:5001'

export default function TrendingRow({ onCardClick }) {
    const [trending, setTrending] = useState([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef(null)

    useEffect(() => {
        axios.get(`${API}/api/trending`)
            .then(res => setTrending(res.data.results))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
        }
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 36 }}>

            {/* section header */}
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 14
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ fontSize: 14 }}
                    >
                    </motion.div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                        Trending Today
                    </h2>
                    <span style={{
                        fontSize: 10, padding: '2px 8px',
                        background: 'rgba(139,0,0,0.3)',
                        border: '1px solid rgba(139,0,0,0.5)',
                        borderRadius: 999, color: '#ff4444', fontWeight: 600
                    }}>
                        LIVE
                    </span>
                </div>

                {/* scroll arrows */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {['←', '→'].map((arrow, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => scroll(i === 0 ? -1 : 1)}
                            style={{
                                width: 26, height: 26,
                                background: 'rgba(139,0,0,0.2)',
                                border: '1px solid rgba(139,0,0,0.3)',
                                borderRadius: '50%', color: '#fff',
                                cursor: 'pointer', fontSize: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {arrow}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* skeleton loading */}
            {loading && (
                <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
                    {Array(8).fill(0).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                            style={{
                                width: 'calc(100% / 6 - 10px)',
                                minWidth: 120,
                                maxWidth: 160,
                                flexShrink: 0,
                                height: 200,
                                background: 'rgba(139,0,0,0.1)',
                                borderRadius: 8,
                                border: '1px solid rgba(139,0,0,0.15)'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* horizontal scroll row */}
            {!loading && (
                <div
                    ref={scrollRef}
                    style={{
                        display: 'flex',
                        gap: 10,
                        overflowX: 'auto',
                        paddingBottom: 8,
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {trending.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ y: -4, scale: 1.04 }}
                            onClick={() => onCardClick(item)}
                            style={{
                                width: 'calc(100% / 6 - 10px)',
                                minWidth: 120,
                                maxWidth: 160,
                                flexShrink: 0,
                                cursor: 'pointer',
                                borderRadius: 8,
                                overflow: 'hidden',
                                background: 'rgba(20,5,5,0.8)',
                                border: '1px solid rgba(139,0,0,0.2)',
                                position: 'relative',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,0,0,0.5)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,0,0,0.2)'}
                        >
                            {/* rank badge */}
                            <div style={{
                                position: 'absolute', top: 5, left: 5,
                                background: 'rgba(139,0,0,0.85)',
                                borderRadius: 4, padding: '1px 5px',
                                fontSize: 9, fontWeight: 700, color: '#fff',
                                zIndex: 1,
                            }}>
                                #{i + 1}
                            </div>

                            {/* type badge */}
                            <div style={{
                                position: 'absolute', top: 5, right: 5,
                                background: 'rgba(0,0,0,0.7)',
                                borderRadius: 4, padding: '1px 4px',
                                fontSize: 8, color: 'rgba(255,255,255,0.7)',
                                zIndex: 1,
                            }}>
                                {item.type === 'series' ? '📺' : '🎬'}
                            </div>

                            {/* poster */}
                            <div style={{ aspectRatio: '2/3', background: '#1a0000' }}>
                                {item.poster_url ? (
                                    <img
                                        src={item.poster_url}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '100%',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 20
                                    }}>
                                        🎬
                                    </div>
                                )}
                            </div>

                            {/* info */}
                            <div style={{ padding: '6px 8px' }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 600, color: '#fff',
                                    whiteSpace: 'nowrap', overflow: 'hidden',
                                    textOverflow: 'ellipsis', marginBottom: 2
                                }}>
                                    {item.title}
                                </p>
                                <span style={{ fontSize: 9, color: '#ff4444', fontWeight: 600 }}>
                                    ⭐ {item.rating}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}